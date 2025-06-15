
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
    <div className="w-screen h-screen bg-background flex">
      {/* 左栏，内容靠右，顶部排列 */}
      <div className="w-1/2 flex flex-col justify-start items-end">
        <div className="max-w-md w-full pr-8 pt-10">
          <ImageUploadPanel onImageSelected={handleImageSelected} loading={loading} />
        </div>
      </div>
      {/* 右栏，背景色填满，内容靠左，顶部排列 */}
      <div className="w-1/2 bg-[#f6f8fa] flex flex-col justify-start items-start">
        <div className="max-w-md w-full pl-8 pt-10">
          <ResizeDemoPanel
            sourcePreviewUrl={originProcessedUrl}
            processedImages={processed}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;

