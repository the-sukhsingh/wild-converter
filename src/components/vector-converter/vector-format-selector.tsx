"use client";

import { useState } from "react";
import {
  VECTOR_FORMATS,
  type VectorFormat,
  type VectorFormatInfo,
} from "@/lib/vector-format-utils";

interface VectorFormatSelectorProps {
  selectedFormat: VectorFormat;
  onSelectFormat: (format: VectorFormat) => void;
  disabled?: boolean;
}

type TabCategory = "all" | "vector" | "publish" | "cad" | "rasterize" | "lossless-preset";

export function VectorFormatSelector({
  selectedFormat,
  onSelectFormat,
  disabled = false,
}: VectorFormatSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabCategory>("vector");

  const allFormats = Object.values(VECTOR_FORMATS);

  const filteredFormats = allFormats.filter((fmt) => {
    if (activeTab === "all") return true;
    if (activeTab === "lossless-preset") return fmt.id.endsWith("-ls");
    if (fmt.id.endsWith("-ls")) return false;
    return fmt.category === activeTab;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Target Vector / Export Format
        </label>
        <span className="text-xs font-mono text-[var(--muted-foreground)]">
          {VECTOR_FORMATS[selectedFormat]?.description}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[var(--border)] text-xs font-mono scrollbar-none">
        {(
          [
            { id: "vector", label: "Vector SVG / Metafile" },
            { id: "publish", label: "Prepress / Print (EPS, AI, PDF)" },
            { id: "cad", label: "CAD / CNC (DXF, DWG)" },
            { id: "rasterize", label: "High-DPI Bitmap" },
            { id: "lossless-preset", label: "Lossless (-ls)" },
            { id: "all", label: "All Formats" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Format Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1">
        {filteredFormats.map((fmt: VectorFormatInfo) => {
          const isSelected = selectedFormat === fmt.id;
          return (
            <button
              key={fmt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectFormat(fmt.id)}
              className={`flex flex-col items-start p-2 rounded text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-[var(--foreground)] text-[var(--background)] ring-1 ring-[var(--foreground)]"
                  : "bg-[var(--foreground)]/[0.02] hover:bg-[var(--foreground)]/5 text-[var(--foreground)] border border-[var(--border)]/60"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono font-bold text-xs truncate pr-1">
                  {fmt.label.split(" ")[0]}
                </span>
                {fmt.isLossless && (
                  <span
                    className={`text-[9px] px-1 rounded uppercase tracking-wider ${
                      isSelected
                        ? "bg-[var(--background)]/20 text-[var(--background)]"
                        : "bg-[var(--foreground)]/10 text-[var(--muted-foreground)]"
                    }`}
                  >
                    Vector
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] truncate w-full mt-0.5 ${
                  isSelected
                    ? "text-[var(--background)]/80"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                .{fmt.extension}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
