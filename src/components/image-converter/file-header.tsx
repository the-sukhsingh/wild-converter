"use client";

import { X } from "lucide-react";
import { type ImageFormat, FORMAT_META, formatFileSize } from "@/lib/format-utils";

interface FileHeaderProps {
  file: File;
  inputFormat: ImageFormat | null;
  dimensions: { w: number; h: number } | null;
  onRemove: () => void;
}

export function FileHeader({ file, inputFormat, dimensions, onRemove }: FileHeaderProps) {
  const formatLabel = inputFormat ? FORMAT_META[inputFormat]?.label : "Image";

  return (
    <div className="flex items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
      <div className="flex items-baseline gap-3 min-w-0">
        <h2 className="text-lg md:text-xl font-semibold tracking-tight text-[var(--foreground)] truncate max-w-md" title={file.name}>
          {file.name}
        </h2>
        <div className="text-xs font-mono text-[var(--muted-foreground)] shrink-0 flex items-center gap-1.5">
          <span>{formatLabel}</span>
          <span>•</span>
          <span>{formatFileSize(file.size)}</span>
          {dimensions && (
            <>
              <span>•</span>
              <span>{dimensions.w}×{dimensions.h}px</span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center gap-1 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded hover:bg-[var(--muted)]/50 transition-colors"
        title="Remove file"
      >
        <X className="w-3.5 h-3.5" />
        <span>Change</span>
      </button>
    </div>
  );
}
