"use client";

import { X } from "lucide-react";
import { formatFileSize } from "@/lib/format-utils";
import { THREE_D_FORMATS } from "@/lib/three-d-format-utils";
import type { ThreeDMetadata } from "@/lib/three-d-converter";

interface ThreeDHeaderProps {
  metadata: ThreeDMetadata;
  onRemove: () => void;
}

export function ThreeDHeader({ metadata, onRemove }: ThreeDHeaderProps) {
  const formatLabel =
    metadata.format !== "unknown"
      ? THREE_D_FORMATS[metadata.format]?.label.split(" ")[0] || metadata.format.toUpperCase()
      : "3D Model";

  return (
    <div className="flex flex-col gap-1.5 pb-3 border-b border-(--border) w-full">
      {/* Top row: Filename & Action */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <h2
          className="text-base sm:text-lg font-semibold tracking-tight text-(--foreground) truncate"
          title={metadata.name}
        >
          {metadata.name}
        </h2>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-xs font-mono text-(--muted-foreground) hover:text-(--foreground) px-2 py-1 rounded hover:bg-(--muted)/50 transition-colors cursor-pointer shrink-0"
          title="Change file"
        >
          <X className="w-3.5 h-3.5" />
          <span>Change</span>
        </button>
      </div>

      {/* Bottom row: Metadata tokens */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono text-(--muted-foreground)">
        <span className="px-1.5 py-0.2 rounded bg-(--card) text-(--foreground) font-medium">
          {formatLabel}
        </span>
        <span>•</span>
        <span>{formatFileSize(metadata.fileSizeBytes)}</span>
        <span>•</span>
        <span>{metadata.faceCount.toLocaleString()} faces</span>
        <span>•</span>
        <span>{metadata.vertexCount.toLocaleString()} vertices</span>
        <span>•</span>
        <span>
          {Math.round(metadata.boundingBox.sizeX)}×{Math.round(metadata.boundingBox.sizeY)}×{Math.round(metadata.boundingBox.sizeZ)} mm
        </span>
      </div>
    </div>
  );
}
