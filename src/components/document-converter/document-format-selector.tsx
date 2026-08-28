"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";
import {
  OUTPUT_DOCUMENT_FORMATS,
  type DocumentFormat,
  DOCUMENT_FORMAT_META,
} from "@/lib/document-format-utils";

interface DocumentFormatSelectorProps {
  selectedFormat: DocumentFormat;
  inputFormat: DocumentFormat | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectFormat: (fmt: DocumentFormat) => void;
}

export function DocumentFormatSelector({
  selectedFormat,
  inputFormat,
  searchQuery,
  onSearchChange,
  onSelectFormat,
}: DocumentFormatSelectorProps) {
  const targetMeta = DOCUMENT_FORMAT_META[selectedFormat];

  // Filter formats based on search query
  const filteredFormats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return OUTPUT_DOCUMENT_FORMATS;
    return OUTPUT_DOCUMENT_FORMATS.filter(
      (f) =>
        f.id.toLowerCase().includes(q) ||
        f.label.toLowerCase().includes(q) ||
        f.ext.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2 text-xs font-mono text-[var(--muted-foreground)]">
        <span className="uppercase tracking-wider font-semibold text-[var(--foreground)]">
          Convert to {targetMeta?.label}
        </span>
        <span className="text-[var(--muted-foreground)]/80 text-[11px] sm:text-xs">
          {targetMeta?.description}
        </span>
      </div>

      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter format (e.g. pdf, docx, xlsx, md, csv, latex, rtf)..."
          className="w-full h-9 pl-9 pr-3 text-xs md:text-sm bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] rounded-lg outline-none focus:ring-1 focus:ring-[var(--ring)] transition-all font-sans"
          aria-label="Filter target formats"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      <div
        className="flex flex-wrap gap-1.5 max-h-28 sm:max-h-24 overflow-y-auto no-scrollbar py-0.5"
        role="group"
        aria-label="Available output document formats"
      >
        {filteredFormats.map((fmt) => {
          const isSelected = selectedFormat === fmt.id;
          const isSameAsInput = inputFormat === fmt.id;

          return (
            <button
              key={fmt.id}
              type="button"
              disabled={isSameAsInput}
              onClick={() => onSelectFormat(fmt.id)}
              className={`h-7.5 px-2.5 rounded-md text-xs font-mono font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isSelected
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
              title={fmt.description}
            >
              <span>{fmt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
