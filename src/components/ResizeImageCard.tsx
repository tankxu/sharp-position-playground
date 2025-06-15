
import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

const SHADOW = "shadow-md";
const BORDER =
  "border border-gray-200 group-hover:border-primary transition-colors";

interface ResizeImageCardProps {
  url: string | null;
  loading: boolean;
  type: "origin" | "center" | "entropy" | "attention";
}

const ResizeImageCard: React.FC<ResizeImageCardProps> = ({
  url,
  loading,
  type,
}) => (
  <div
    className={cn(
      "w-[260px] h-[260px] rounded-lg overflow-hidden flex items-center justify-center relative group",
      BORDER,
      SHADOW
    )}
    style={{
      minWidth: 260,
      minHeight: 260,
    }}
  >
    {/* 如果是 origin 卡片，loading 时不显示 skeleton，只显示文字；其余卡片 loading 时用 skeleton 占位 */}
    {!url ? (
      loading && type !== "origin" ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <div className="text-center text-sm text-muted-foreground px-2">
          {loading ? "Processing..." : type === "origin" ? "No image yet" : "—"}
        </div>
      )
    ) : type === "origin" ? (
      <img
        src={url}
        alt="original"
        className="max-h-[258px] max-w-full object-contain"
        draggable={false}
        style={{
          width: "auto",
          height: 260,
          objectFit: "contain",
        }}
      />
    ) : (
      <img
        src={url}
        alt={type}
        className="w-[260px] h-[260px] object-cover"
        draggable={false}
        style={{
          objectFit: "cover",
          width: 260,
          height: 260,
        }}
      />
    )}
  </div>
);

export default ResizeImageCard;

