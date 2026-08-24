"use client";

import { Sliders, Sparkles, Paintbrush, Cpu } from "lucide-react";
import { VECTOR_FORMATS } from "@/lib/vector-format-utils";
import type { VectorConversionOptions, VectorMetadata } from "@/lib/vector-converter";

interface VectorOptionsProps {
  options: VectorConversionOptions;
  metadata: VectorMetadata;
  onChange: (options: VectorConversionOptions) => void;
  disabled?: boolean;
}

export function VectorOptions({
  options,
  metadata,
  onChange,
  disabled = false,
}: VectorOptionsProps) {
  const formatInfo = VECTOR_FORMATS[options.format] || VECTOR_FORMATS.svg;
  const isCad = formatInfo.category === "cad";
  const isRaster = formatInfo.category === "rasterize";

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Geometry Scale, DPI & Rendering Engine
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Scale Multiplier */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>Scale Multiplier</span>
            <span className="text-[var(--foreground)] font-medium">
              {options.scale}x ({metadata.width * options.scale}×{metadata.height * options.scale} px)
            </span>
          </label>
          <select
            value={options.scale}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...options,
                scale: Number(e.target.value) as 1 | 2 | 3 | 4 | 8,
              })
            }
            className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
          >
            <option value={1}>1.0x (Original Dimensions)</option>
            <option value={2}>2.0x (Retina Display)</option>
            <option value={3}>3.0x (High Density)</option>
            <option value={4}>4.0x (4K Master)</option>
            <option value={8}>8.0x (8K Ultra Precision)</option>
          </select>
        </div>

        {/* DPI (for Prepress / Raster) */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>DPI Density</span>
            <span className="text-[var(--foreground)] font-medium">
              {options.dpi} DPI
            </span>
          </label>
          <select
            value={options.dpi}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...options,
                dpi: Number(e.target.value) as 72 | 150 | 300 | 600,
              })
            }
            className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
          >
            <option value={72}>72 DPI (Standard Web Screen)</option>
            <option value={150}>150 DPI (Draft Proofing)</option>
            <option value={300}>300 DPI (Commercial Print / Prepress)</option>
            <option value={600}>600 DPI (Ultra Precision Archival)</option>
          </select>
        </div>

        {/* Background Fill */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>Background Fill</span>
            <span className="text-[var(--foreground)] font-medium capitalize">
              {options.background}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-[var(--foreground)]/5 p-0.5 rounded border border-[var(--border)]">
            {(["transparent", "white", "black"] as const).map((bg) => (
              <button
                key={bg}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...options, background: bg })}
                className={`text-xs py-1 rounded transition-colors capitalize cursor-pointer ${
                  options.background === bg
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* CAD Version or Optimize SVG */}
        {isCad ? (
          <div className="space-y-1.5">
            <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
              <span>AutoCAD Standard</span>
              <span className="text-[var(--foreground)] font-medium">
                {options.dxfVersion}
              </span>
            </label>
            <select
              value={options.dxfVersion}
              disabled={disabled}
              onChange={(e) =>
                onChange({
                  ...options,
                  dxfVersion: e.target.value as "R12" | "R2000",
                })
              }
              className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
            >
              <option value="R2000">AutoCAD 2000 (AC1015) 64-bit</option>
              <option value="R12">AutoCAD R12 (AC1009) Legacy CNC</option>
            </select>
          </div>
        ) : (
          <div className="space-y-1.5 flex flex-col justify-end">
            <label
              className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
                options.optimizeSvg
                  ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
              }`}
            >
              <input
                type="checkbox"
                checked={options.optimizeSvg}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...options, optimizeSvg: e.target.checked })
                }
                className="rounded accent-[var(--foreground)]"
              />
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>Clean & Minify SVG XML</span>
            </label>
          </div>
        )}

        {/* Engine Status */}
        <div className="space-y-1.5 flex flex-col justify-end sm:col-span-2 md:col-span-2">
          <div className="flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--foreground)]/[0.02]">
            <Cpu className="w-3.5 h-3.5 shrink-0 text-blue-500" />
            <span className="truncate">
              Pure Client-Side SVG DOM AST & PostScript Vector Compiler
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
