"use client";

import { Code, X, FileCode, AlignLeft, Hash } from "lucide-react";
import type { CodeMetadata } from "@/lib/code-converter";

interface CodeHeaderProps {
  metadata: CodeMetadata;
  onClear: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function CodeHeader({ metadata, onClear }: CodeHeaderProps) {
  return (
    <div className="w-full flex items-center justify-between py-3 border-b border-[var(--border)] text-sm">
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <div className="w-8 h-8 rounded bg-[var(--foreground)]/5 flex items-center justify-center shrink-0 text-[var(--foreground)] font-mono font-bold text-xs">
          {"</>"}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-[var(--foreground)] truncate text-sm">
              {metadata.name}
            </p>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[var(--foreground)]/5 text-[var(--muted-foreground)]">
              {metadata.detectedLanguage}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)]">
            <span>{formatBytes(metadata.fileSizeBytes)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <AlignLeft className="w-3 h-3" />
              {metadata.lineCount.toLocaleString()} lines
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {metadata.charCount.toLocaleString()} characters
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer shrink-0"
        title="Change code file"
      >
        <X className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Change</span>
      </button>
    </div>
  );
}
