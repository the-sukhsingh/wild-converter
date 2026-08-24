"use client";

import { X } from "lucide-react";
import { formatFileSize } from "@/lib/format-utils";
import { VECTOR_FORMATS } from "@/lib/vector-format-utils";
import type { VectorMetadata } from "@/lib/vector-converter";

interface VectorHeaderProps {
  metadata: VectorMetadata;
  onRemove: () => void;
}

export function VectorHeader({ metadata, onRemove }: VectorHeaderProps) {
  const formatLabel =
    metadata.format !== "unknown"
      ? VECTOR_FORMATS[metadata.format]?.label.split(" ")[0] || metadata.format.toUpperCase()
      : "Vector";

  return (
    <div className="flex items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
      <div className="flex items-baseline gap-3 min-w-0">
        <h2
          className="text-lg md:text-xl font-semibold tracking-tight text-[var(--foreground)] truncate max-w-md"
          title={metadata.name}
        >
          {metadata.name}
        </h2>
        <div className="text-xs font-mono text-[var(--muted-foreground)] shrink-0 flex items-center gap-1.5">
          <span>{formatLabel}</span>
          <span>•</span>
          <span>{formatFileSize(metadata.fileSizeBytes)}</span>
          <span>•</span>
          <span>
            {Math.round(metadata.width)}×{Math.round(metadata.height)} viewBox
          </span>
          <span>•</span>
          <span>{metadata.pathCount} paths</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center gap-1 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded hover:bg-[var(--muted)]/50 transition-colors cursor-pointer"
        title="Change file"
      >
        <X className="w-3.5 h-3.5" />
        <span>Change</span>
      </button>
    </div>
  );
}
