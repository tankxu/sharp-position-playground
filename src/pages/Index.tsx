
import React, { useState, useCallback } from "react";
import ImageUploadPanel from "../components/ImageUploadPanel";
import ResizeDemoPanel from "../components/ResizeDemoPanel";

const API_BASE = "http://localhost:3001/api";

const Index = () => {
  // Origin
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  // Processed
  const [processed, setProcessed] = useState<{
    [key: string]: string | null;
  }>({ center: null, entropy: null, attention: null });
  const [originProcessedUrl, setOriginProcessedUrl] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Main image load (trigger resize)
  const handleImageSelected = useCallback(
    async (file: File, previewUrl: string) => {
      setImageFile(file);
      setSourcePreviewUrl(previewUrl);
      setOriginProcessedUrl(previewUrl); // 前端直接用原始URL，不再请求 /api/origin
      setProcessed({ center: null, entropy: null, attention: null });
      setLoading(true);

      try {
        // 现在不用请求 /api/origin 了，直接使用 previewUrl
        // 2. For three positions
        const resizes = ["center", "entropy", "attention"];
        const results: { [pos: string]: string | null } = {};
        await Promise.all(
          resizes.map(async (pos) => {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("position", pos);

            const r = await fetch(`${API_BASE}/resize`, {
              method: "POST",
              body: fd,
            });
            if (r.ok) {
              const blob = await r.blob();
              results[pos] = URL.createObjectURL(blob);
            } else {
              results[pos] = null;
            }
          })
        );
        setProcessed(results);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background">
      <div className="flex w-full max-w-5xl mx-auto h-[80vh] rounded-xl overflow-hidden shadow-lg bg-white/80">
        {/* Left: Upload */}
        <div className="w-1/2 h-full flex items-center justify-center bg-white">
          <div className="w-full max-w-md h-full flex items-center">
            <ImageUploadPanel onImageSelected={handleImageSelected} loading={loading} />
          </div>
        </div>
        {/* Right: Result */}
        <div className="w-1/2 h-full flex items-center justify-center bg-[#f6f8fa]">
          <div className="w-full max-w-md h-full flex items-center">
            <ResizeDemoPanel
              sourcePreviewUrl={originProcessedUrl}
              processedImages={processed}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
