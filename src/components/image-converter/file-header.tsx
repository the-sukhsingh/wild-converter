"use client";

import { X } from "lucide-react";
import { type ImageFormat, FORMAT_META, formatFileSize } from "@/lib/format-utils";

interface FileHeaderProps {
  file: File;
  inputFormat: ImageFormat | null;
  dimensions: { w: number; h: number } | null;
  onRemove: () => void;
  extraAction?: React.ReactNode;
}

export function FileHeader({
  file,
  inputFormat,
  dimensions,
  onRemove,
  extraAction,
}: FileHeaderProps) {
  const formatLabel = inputFormat ? FORMAT_META[inputFormat]?.label : "Image";

  return (
    <div className="flex flex-col gap-1.5 pb-3 border-b border-(--border) w-full">
      {/* Top row: Filename & Actions */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <h2
          className="text-base sm:text-lg font-semibold tracking-tight text-(--foreground) truncate"
          title={file.name}
        >
          {file.name}
        </h2>

        <div className="flex items-center gap-1.5 shrink-0">
          {extraAction}
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs font-mono text-(--muted-foreground) hover:text-(--foreground) px-2 py-1 rounded hover:bg-(--muted)/50 transition-colors cursor-pointer"
            title="Remove file"
          >
            <X className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Metadata tags */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono text-(--muted-foreground)">
        <span className="px-1.5 py-0.2 rounded bg-(--card) text-(--foreground) font-medium">
          {formatLabel}
        </span>
        <span>•</span>
        <span>{formatFileSize(file.size)}</span>
        {dimensions && (
          <>
            <span>•</span>
            <span>
              {dimensions.w}×{dimensions.h}px
            </span>
          </>
        )}
      </div>
    </div>
  );
}
