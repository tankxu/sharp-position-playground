
import React, { useState, useCallback } from "react";
import ImageUploadPanel from "../components/ImageUploadPanel";
import ResizeDemoPanel from "../components/ResizeDemoPanel";

/**
 * You need to run the backend at http://localhost:3001
 * See server/index.js for Node.js backend.
 */

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
      setOriginProcessedUrl(null);
      setProcessed({ center: null, entropy: null, attention: null });
      setLoading(true);

      try {
        // 1. Send to /api/origin to get scaled origin display
        const formDataOrigin = new FormData();
        formDataOrigin.append("file", file);

        const originRes = await fetch(`${API_BASE}/origin`, {
          method: "POST",
          body: formDataOrigin,
        });

        if (originRes.ok) {
          // use blob
          const blob = await originRes.blob();
          setOriginProcessedUrl(URL.createObjectURL(blob));
        } else {
          setOriginProcessedUrl(previewUrl); // fallback to true preview
        }

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
    <div className="w-screen h-screen bg-background flex overflow-hidden">
      {/* Left: Upload */}
      <div
        className="w-[380px] min-w-[320px] max-w-[440px] h-full overflow-y-auto"
        style={{ boxShadow: "2px 0 16px 0 rgba(48,51,77,0.08)" }}
      >
        <ImageUploadPanel onImageSelected={handleImageSelected} loading={loading} />
      </div>
      {/* Right: Result */}
      <div className="flex-1 min-w-0 h-full overflow-x-auto">
        <ResizeDemoPanel
          sourcePreviewUrl={originProcessedUrl}
          processedImages={processed}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Index;
