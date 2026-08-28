"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";
import {
  ARCHIVE_FORMATS,
  type ArchiveFormat,
} from "@/lib/archive-format-utils";

interface ArchiveFormatSelectorProps {
  selectedFormat: ArchiveFormat;
  inputFormat: ArchiveFormat | "unknown" | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectFormat: (fmt: ArchiveFormat) => void;
}

export function ArchiveFormatSelector({
  selectedFormat,
  inputFormat,
  searchQuery,
  onSearchChange,
  onSelectFormat,
}: ArchiveFormatSelectorProps) {
  const allFormats = Object.values(ARCHIVE_FORMATS);
  const targetMeta = ARCHIVE_FORMATS[selectedFormat];

  const filteredFormats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allFormats;
    return allFormats.filter(
      (f) =>
        f.id.toLowerCase().includes(q) ||
        f.label.toLowerCase().includes(q) ||
        f.extension.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [searchQuery, allFormats]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2 text-xs font-mono text-(--muted-foreground)">
        <span className="uppercase tracking-wider font-semibold text-(--foreground)">
          Convert to {targetMeta?.label}
        </span>
        <span className="text-(--muted-foreground)/80 text-[11px] sm:text-xs">
          {targetMeta?.description}
        </span>
      </div>

      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-(--muted-foreground) absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter format (e.g. zip, tgz, tar, gz, 7z, bz2, ls)..."
          className="w-full h-9 pl-9 pr-3 text-xs md:text-sm bg-(--card) text-(--foreground) placeholder:text-(--muted-foreground) rounded-lg outline-none focus:ring-1 focus:ring-(--ring) transition-all font-sans"
          aria-label="Filter target archive formats"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 text-xs text-(--muted-foreground) hover:text-(--foreground) p-1 cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      <div
        className="flex flex-wrap gap-1.5 max-h-28 sm:max-h-24 overflow-y-auto no-scrollbar py-0.5"
        role="group"
        aria-label="Available output formats"
      >
        {filteredFormats.map((fmt) => {
          const isSelected = selectedFormat === fmt.id;
          const isSameAsInput = inputFormat === fmt.id;
          const isLossless = fmt.id.endsWith("-ls") || fmt.isLossless;

          return (
            <button
              key={fmt.id}
              type="button"
              disabled={isSameAsInput}
              onClick={() => onSelectFormat(fmt.id)}
              className={`h-7.5 px-2.5 rounded-md text-xs font-mono font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isSelected
                  ? "bg-(--primary) text-(--primary-foreground) shadow-xs"
                  : "bg-(--card) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)"
              }`}
              title={fmt.description}
            >
              <span>{fmt.label}</span>
              {isLossless && (
                <span
                  className={`text-[9px] px-1 rounded uppercase tracking-wider font-semibold ${
                    isSelected
                      ? "bg-(--background)/20 text-(--primary-foreground)"
                      : "bg-(--background) text-(--muted-foreground)"
                  }`}
                >
                  {fmt.category === "universal" ? "ZIP" : "LS"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
