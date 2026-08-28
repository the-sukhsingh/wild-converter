"use client";

import { X } from "lucide-react";
import { formatFileSize } from "@/lib/format-utils";
import { FONT_FORMATS } from "@/lib/font-format-utils";
import type { FontMetadata } from "@/lib/font-converter";

interface FontHeaderProps {
  metadata: FontMetadata;
  onRemove: () => void;
}

export function FontHeader({ metadata, onRemove }: FontHeaderProps) {
  const formatLabel =
    metadata.format !== "unknown"
      ? FONT_FORMATS[metadata.format]?.label.split(" ")[0] || metadata.format.toUpperCase()
      : "Font";

  return (
    <div className="flex flex-col gap-1.5 pb-3 border-b border-[var(--border)] w-full">
      {/* Top row: Filename & Action */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <h2
          className="text-base sm:text-lg font-semibold tracking-tight text-[var(--foreground)] truncate"
          title={metadata.name}
        >
          {metadata.familyName} {metadata.styleName !== "Regular" ? `(${metadata.styleName})` : ""}
        </h2>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded hover:bg-[var(--muted)]/50 transition-colors cursor-pointer shrink-0"
          title="Change file"
        >
          <X className="w-3.5 h-3.5" />
          <span>Change</span>
        </button>
      </div>

      {/* Bottom row: Metadata tokens */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono text-[var(--muted-foreground)]">
        <span className="px-1.5 py-0.2 rounded bg-[var(--card)] text-[var(--foreground)] font-medium">
          {formatLabel}
        </span>
        <span>•</span>
        <span>{formatFileSize(metadata.fileSizeBytes)}</span>
        <span>•</span>
        <span>{metadata.glyphCount.toLocaleString()} glyphs</span>
        <span>•</span>
        <span>UPM {metadata.unitsPerEm}</span>
        {metadata.version && (
          <>
            <span>•</span>
            <span className="truncate max-w-[120px]">{metadata.version}</span>
          </>
        )}
      </div>
    </div>
  );
}
