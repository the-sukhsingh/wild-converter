"use client";

import { Sliders, Code, Sparkles, Edit3 } from "lucide-react";
import { FONT_FORMATS } from "@/lib/font-format-utils";
import type { FontConversionOptions, FontMetadata } from "@/lib/font-converter";

interface FontOptionsProps {
  options: FontConversionOptions;
  metadata: FontMetadata;
  onChange: (options: FontConversionOptions) => void;
  disabled?: boolean;
}

export function FontOptions({
  options,
  metadata,
  onChange,
  disabled = false,
}: FontOptionsProps) {
  const formatInfo = FONT_FORMATS[options.format] || FONT_FORMATS.woff2;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Font Packaging & Web Integration Options
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Custom Font Family Name */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              CSS Font Family Name
            </span>
          </label>
          <input
            type="text"
            disabled={disabled}
            value={options.customFontFamily ?? metadata.familyName}
            placeholder={metadata.familyName}
            onChange={(e) =>
              onChange({ ...options, customFontFamily: e.target.value })
            }
            className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)]"
          />
        </div>

        {/* Generate CSS @font-face code */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label
            className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
              options.generateCssFace
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
            }`}
          >
            <input
              type="checkbox"
              checked={options.generateCssFace}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...options, generateCssFace: e.target.checked })
              }
              className="rounded accent-[var(--foreground)]"
            />
            <Code className="w-3.5 h-3.5 shrink-0" />
            <span>Generate CSS @font-face Snippet</span>
          </label>
        </div>

        {/* Preserve Hinting Tables */}
        {formatInfo.supportsHinting && (
          <div className="space-y-1.5 flex flex-col justify-end">
            <label
              className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
                options.hinting
                  ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
              }`}
            >
              <input
                type="checkbox"
                checked={options.hinting}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...options, hinting: e.target.checked })
                }
                className="rounded accent-[var(--foreground)]"
              />
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>Preserve Hinting & TrueType Instructions</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
