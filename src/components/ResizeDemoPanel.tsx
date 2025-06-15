
import React from "react";
import ResizeImageCard from "./ResizeImageCard";

export const POSITION_LABELS: { [k: string]: string } = {
  origin: "origin",
  center: "position: center",
  entropy: "position: entropy",
  attention: "position: attention",
};

interface ResizeDemoPanelProps {
  sourcePreviewUrl: string | null;
  processedImages: { [position: string]: string | null };
  loading: boolean;
}

const ResizeDemoPanel: React.FC<ResizeDemoPanelProps> = ({
  sourcePreviewUrl,
  processedImages,
  loading,
}) => {
  return (
    // 只保留 padding、overflow-y-auto、背景色
    <div className="bg-[#f6f8fa] px-0 sm:px-8 py-10 overflow-y-auto rounded-r-xl">
      <div className="max-w-lg mx-auto">
        {/* Image origin */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-[55px] flex-shrink-0 pt-[2px] text-[13px] font-bold text-gray-700 leading-tight">
            {POSITION_LABELS.origin}
          </div>
          <ResizeImageCard
            url={sourcePreviewUrl}
            loading={loading}
            type="origin"
          />
        </div>
        {/* Resized Images */}
        {(["center", "entropy", "attention"] as Array<"center" | "entropy" | "attention">).map((pos) => (
          <div className="flex items-start gap-4 mb-10" key={pos}>
            <div className="w-[55px] flex-shrink-0 pt-[2px] text-[13px] font-normal text-gray-600 leading-tight">
              {POSITION_LABELS[pos]}
            </div>
            <ResizeImageCard
              url={processedImages[pos]}
              loading={loading}
              type={pos}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResizeDemoPanel;

