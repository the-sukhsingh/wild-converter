"use client";

import { Sliders, Cpu, Archive } from "lucide-react";
import { ARCHIVE_FORMATS } from "@/lib/archive-format-utils";
import type { ArchiveConversionOptions, ArchiveMetadata } from "@/lib/archive-converter";

interface ArchiveOptionsProps {
  options: ArchiveConversionOptions;
  metadata: ArchiveMetadata;
  onChange: (options: ArchiveConversionOptions) => void;
  disabled?: boolean;
}

export function ArchiveOptions({
  options,
  metadata,
  onChange,
  disabled = false,
}: ArchiveOptionsProps) {
  const formatInfo = ARCHIVE_FORMATS[options.format] || ARCHIVE_FORMATS.zip;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Compression Level & Packing Options
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Compression Level */}
        {formatInfo.supportsCompressionLevel ? (
          <div className="space-y-1.5">
            <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
              <span>Compression Level</span>
              <span className="text-[var(--foreground)] font-medium">
                {options.compressionLevel === 0
                  ? "Level 0 (Store Only)"
                  : options.compressionLevel === 1
                  ? "Level 1 (Fast)"
                  : options.compressionLevel === 6
                  ? "Level 6 (Standard)"
                  : "Level 9 (Maximum Deflate)"}
              </span>
            </label>
            <select
              value={options.compressionLevel}
              disabled={disabled}
              onChange={(e) =>
                onChange({
                  ...options,
                  compressionLevel: Number(e.target.value) as 0 | 1 | 6 | 9,
                })
              }
              className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
            >
              <option value={9}>Level 9 (Maximum Compression)</option>
              <option value={6}>Level 6 (Balanced Standard)</option>
              <option value={1}>Level 1 (Fastest Speed)</option>
              <option value={0}>Level 0 (Store / Uncompressed)</option>
            </select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-xs text-[var(--muted-foreground)] font-mono">
              Compression
            </label>
            <div className="p-2 rounded bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs font-mono text-[var(--muted-foreground)]">
              Uncompressed POSIX Tape Archive Container
            </div>
          </div>
        )}

        {/* Engine status */}
        <div className="space-y-1.5 flex flex-col justify-end sm:col-span-2">
          <div className="flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--foreground)]/[0.02]">
            <Cpu className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="truncate">
              Pure Client-Side WASM / Deflate Streaming Compression Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
