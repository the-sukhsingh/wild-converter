"use client";

import { ARCHIVE_FORMATS } from "@/lib/archive-format-utils";
import type { ArchiveConversionOptions, ArchiveMetadata } from "@/lib/archive-converter";

interface ArchiveOptionsProps {
  targetFormat: string;
  options: ArchiveConversionOptions;
  metadata: ArchiveMetadata | null;
  onOptionsChange: (options: ArchiveConversionOptions) => void;
}

export function ArchiveOptionsPanel({
  targetFormat,
  options,
  metadata,
  onOptionsChange,
}: ArchiveOptionsProps) {
  const formatInfo = ARCHIVE_FORMATS[options.format] || ARCHIVE_FORMATS.zip;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-3 border-y border-(--border) min-h-20.5 items-center">
      {/* Compression Level */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-(--muted-foreground)">
          <span>Deflate Compression</span>
          <span className="font-semibold text-(--foreground)">
            Level {options.compressionLevel}
          </span>
        </div>
        <select
          value={options.compressionLevel}
          onChange={(e) =>
            onOptionsChange({
              ...options,
              compressionLevel: Number(e.target.value) as 0 | 1 | 6 | 9,
            })
          }
          className="w-full h-8 px-2.5 text-xs font-mono bg-(--card) text-(--foreground) rounded-md outline-none focus:ring-1 focus:ring-(--ring) cursor-pointer"
        >
          <option value={9}>Level 9 (Maximum Compression)</option>
          <option value={6}>Level 6 (Balanced Default)</option>
          <option value={1}>Level 1 (Fast Speed)</option>
          <option value={0}>Level 0 (Store Only / No Deflate)</option>
        </select>
      </div>

      {/* Container Engine */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-(--muted-foreground)">
          <span>Container Spec</span>
          <span className="font-semibold text-(--foreground)">
            {formatInfo.category.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center h-8 px-2.5 text-xs font-mono bg-(--card) text-(--muted-foreground) rounded-md">
          POSIX ustar / PKZIP 2.0
        </div>
      </div>

      {/* Total Archived Files */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-(--muted-foreground)">
          <span>Files Count</span>
          <span className="text-(--foreground) font-semibold">
            {metadata ? `${metadata.totalFiles} files` : "—"}
          </span>
        </div>
        <div className="flex items-center h-8 px-2.5 text-xs font-mono bg-(--card) text-(--muted-foreground) rounded-md">
          {metadata ? `${metadata.entries.length} items unpacked` : "Archive Tree"}
        </div>
      </div>

      {/* Strip Root Folder Toggle */}
      <div className="flex flex-col justify-end">
        <label
          className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
            options.stripRootFolder
              ? "bg-(--primary) text-(--primary-foreground) font-medium"
              : "bg-(--card) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)"
          }`}
        >
          <input
            type="checkbox"
            checked={options.stripRootFolder}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                stripRootFolder: e.target.checked,
              })
            }
            className="rounded accent-(--foreground) sr-only"
          />
          <span>Flatten / Strip Root Enclosing Folder</span>
        </label>
      </div>
    </div>
  );
}
