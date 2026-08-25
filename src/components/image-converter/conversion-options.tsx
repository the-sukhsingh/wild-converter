"use client";

import { type ImageFormat, FORMAT_META } from "@/lib/format-utils";
import { type ConversionOptions } from "@/lib/image-converter";

interface ConversionOptionsProps {
  targetFormat: ImageFormat;
  options: ConversionOptions;
  dimensions: { w: number; h: number } | null;
  onOptionsChange: (opts: ConversionOptions) => void;
}

export function ConversionOptionsPanel({
  targetFormat,
  options,
  dimensions,
  onOptionsChange,
}: ConversionOptionsProps) {
  const targetMeta = FORMAT_META[targetFormat];
  const isPdf = targetFormat === "pdf";
  const isLossless = targetFormat.endsWith("-ls") || !targetMeta?.supportsQuality;
  const q = options.quality ?? 0.85;

  const pageSize = options.pdfPageSize || "a4";
  const orientation = options.pdfOrientation || "portrait";
  const margins = options.pdfMargins || "normal";

  if (isPdf) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-y border-[var(--border)]">
        {/* Column 1: Page Size & Orientation */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Page Size & Orientation</span>
            <span className="font-semibold text-[var(--foreground)] uppercase">
              {pageSize} · {orientation}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["a4", "letter", "legal"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onOptionsChange({ ...options, pdfPageSize: s })}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-medium uppercase transition-all cursor-pointer ${
                  pageSize === s
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {s}
              </button>
            ))}
            <span className="text-xs text-[var(--muted-foreground)] mx-1">•</span>
            {(["portrait", "landscape"] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onOptionsChange({ ...options, pdfOrientation: o })}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-medium capitalize transition-all cursor-pointer ${
                  orientation === o
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Page Margins */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Page Margins</span>
            <span className="font-semibold text-[var(--foreground)] capitalize">{margins}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {(["compact", "normal", "wide"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onOptionsChange({ ...options, pdfMargins: m })}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-medium capitalize transition-all cursor-pointer ${
                  margins === m
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-y border-[var(--border)]">
      {/* Quality slider for lossy formats */}
      {!isLossless ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Quality</span>
            <span className="font-semibold text-[var(--foreground)]">{Math.round(q * 100)}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={Math.round(q * 100)}
            onChange={(e) =>
              onOptionsChange({ ...options, quality: Number(e.target.value) / 100 })
            }
            className="w-full h-1.5 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer accent-[var(--foreground)]"
            aria-label="Compression quality"
          />
        </div>
      ) : (
        <div className="flex flex-col justify-center gap-1 text-xs font-mono text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]">Lossless Profile</span>
          <span>Preserves 100% pixel data with zero visual compression artifacts.</span>
        </div>
      )}

      {/* Resize dimension inputs */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>Target Size (px)</span>
          <span className="text-[var(--foreground)]">
            {options.width || dimensions?.w || "—"} × {options.height || dimensions?.h || "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={16000}
            value={options.width || ""}
            onChange={(e) =>
              onOptionsChange({ ...options, width: Number(e.target.value) || 0 })
            }
            placeholder={String(dimensions?.w || "width")}
            className="w-24 h-7 px-2 text-xs font-mono bg-[var(--card)] text-[var(--foreground)] rounded-md outline-none focus:ring-1 focus:ring-[var(--ring)]"
            aria-label="Target width in pixels"
          />
          <span className="text-xs text-[var(--muted-foreground)] font-mono">×</span>
          <input
            type="number"
            min={1}
            max={16000}
            value={options.height || ""}
            onChange={(e) =>
              onOptionsChange({ ...options, height: Number(e.target.value) || 0 })
            }
            placeholder={String(dimensions?.h || "height")}
            className="w-24 h-7 px-2 text-xs font-mono bg-[var(--card)] text-[var(--foreground)] rounded-md outline-none focus:ring-1 focus:ring-[var(--ring)]"
            aria-label="Target height in pixels"
          />
        </div>
      </div>
    </div>
  );
}
