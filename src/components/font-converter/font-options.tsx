"use client";

import { FONT_FORMATS } from "@/lib/font-format-utils";
import type { FontConversionOptions, FontMetadata } from "@/lib/font-converter";

interface FontOptionsProps {
  targetFormat: string;
  options: FontConversionOptions;
  metadata: FontMetadata | null;
  onOptionsChange: (options: FontConversionOptions) => void;
}

export function FontOptionsPanel({
  targetFormat,
  options,
  metadata,
  onOptionsChange,
}: FontOptionsProps) {
  const formatInfo = FONT_FORMATS[options.format] || FONT_FORMATS.woff2;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-3 border-y border-[var(--border)] min-h-[82px] items-center">
      {/* Custom Family Name */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>Family Name</span>
          <span className="font-semibold text-[var(--foreground)] truncate max-w-[120px]">
            {options.customFontFamily || metadata?.familyName || "Original"}
          </span>
        </div>
        <input
          type="text"
          value={options.customFontFamily || ""}
          onChange={(e) =>
            onOptionsChange({
              ...options,
              customFontFamily: e.target.value,
            })
          }
          placeholder={metadata?.familyName || "e.g. Inter"}
          className="w-full h-8 px-2.5 text-xs font-mono bg-[var(--card)] text-[var(--foreground)] rounded-md outline-none focus:ring-1 focus:ring-[var(--ring)]"
        />
      </div>

      {/* Subset ASCII */}
      <div className="flex flex-col justify-end">
        <label
          className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
            options.subsetAsciiOnly
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-medium"
              : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
        >
          <input
            type="checkbox"
            checked={options.subsetAsciiOnly}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                subsetAsciiOnly: e.target.checked,
              })
            }
            className="rounded accent-[var(--foreground)] sr-only"
          />
          <span>Subset ASCII Glyphs Only</span>
        </label>
      </div>

      {/* Include CSS @font-face Toggle */}
      <div className="flex flex-col justify-end">
        <label
          className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
            options.generateCssFace
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-medium"
              : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
        >
          <input
            type="checkbox"
            checked={options.generateCssFace}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                generateCssFace: e.target.checked,
              })
            }
            className="rounded accent-[var(--foreground)] sr-only"
          />
          <span>Generate CSS @font-face</span>
        </label>
      </div>

      {/* Preserve Hinting Toggle */}
      <div className="flex flex-col justify-end">
        <label
          className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
            options.hinting
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-medium"
              : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
        >
          <input
            type="checkbox"
            checked={options.hinting}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                hinting: e.target.checked,
              })
            }
            className="rounded accent-[var(--foreground)] sr-only"
          />
          <span>Preserve TrueType Hinting</span>
        </label>
      </div>
    </div>
  );
}
