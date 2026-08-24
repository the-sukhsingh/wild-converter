"use client";

import { FileText, Folder, ChevronDown, ChevronRight } from "lucide-react";
import type { ArchiveEntry } from "@/lib/archive-converter";

interface ArchiveFileTreeProps {
  entries: ArchiveEntry[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ArchiveFileTree({ entries }: ArchiveFileTreeProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Archived Files & Directory Contents ({entries.length} items)
        </label>
      </div>

      <div className="max-h-40 overflow-y-auto rounded border border-[var(--border)] bg-[var(--foreground)]/[0.01] p-2 space-y-1">
        {entries.map((entry) => (
          <div
            key={entry.path}
            className="flex items-center justify-between py-1 px-2 rounded hover:bg-[var(--foreground)]/5 text-xs font-mono text-[var(--foreground)]"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              {entry.isDirectory ? (
                <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />
              )}
              <span className="truncate">{entry.path}</span>
            </div>
            {!entry.isDirectory && (
              <span className="text-[11px] text-[var(--muted-foreground)] shrink-0">
                {formatBytes(entry.size)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
