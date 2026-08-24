"use client";

import { X } from "lucide-react";
import { formatFileSize } from "@/lib/format-utils";
import { VIDEO_FORMATS } from "@/lib/video-format-utils";
import type { VideoMetadata } from "@/lib/video-converter";

interface VideoHeaderProps {
  metadata: VideoMetadata;
  onRemove: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoHeader({ metadata, onRemove }: VideoHeaderProps) {
  const formatLabel =
    metadata.format !== "unknown"
      ? VIDEO_FORMATS[metadata.format]?.label.split(" ")[0] || metadata.format.toUpperCase()
      : "Video";

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
          <span>{formatDuration(metadata.duration)}</span>
          <span>•</span>
          <span>
            {metadata.width}×{metadata.height} ({metadata.aspectRatio})
          </span>
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
