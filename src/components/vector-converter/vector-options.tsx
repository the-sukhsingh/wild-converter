"use client";

import { VECTOR_FORMATS } from "@/lib/vector-format-utils";
import type { VectorConversionOptions, VectorMetadata } from "@/lib/vector-converter";

interface VectorOptionsProps {
  targetFormat: string;
  options: VectorConversionOptions;
  metadata: VectorMetadata | null;
  onOptionsChange: (options: VectorConversionOptions) => void;
}

export function VectorOptionsPanel({
  targetFormat,
  options,
  metadata,
  onOptionsChange,
}: VectorOptionsProps) {
  const formatInfo = VECTOR_FORMATS[options.format] || VECTOR_FORMATS.eps;
  const isRaster = formatInfo.category === "rasterize";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-[var(--border)]">
      {/* Raster Scale Preset or DPI */}
      {isRaster ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Render Scale</span>
            <span className="font-semibold text-[var(--foreground)]">
              {options.scale}x ({options.dpi} DPI)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 bg-[var(--card)] p-0.5 rounded-md h-8 items-center text-center">
            {([1, 2, 4, 8] as const).map((scl) => (
              <button
                key={scl}
                type="button"
                onClick={() =>
                  onOptionsChange({
                    ...options,
                    scale: scl,
                    dpi: scl === 8 ? 600 : scl === 4 ? 300 : scl === 2 ? 150 : 72,
                  })
                }
                className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
                  options.scale === scl
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {scl}x
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Coordinate Precision</span>
            <span className="font-semibold text-[var(--foreground)]">
              High (Floating Point)
            </span>
          </div>
          <select
            value={options.dxfVersion}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                dxfVersion: e.target.value as "R12" | "R2000",
              })
            }
            className="w-full h-8 px-2.5 text-xs font-mono bg-[var(--card)] text-[var(--foreground)] rounded-md outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer"
          >
            <option value="R2000">AutoCAD 2000 / Modern DXF</option>
            <option value="R12">AutoCAD Release 12 (CNC / Legacy)</option>
          </select>
        </div>
      )}

      {/* Background Fill (for raster) or Preserve Aspect */}
      {isRaster ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Background</span>
            <span className="font-semibold text-[var(--foreground)]">
              {options.background === "transparent" ? "Alpha" : "White"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 bg-[var(--card)] p-0.5 rounded-md h-8 items-center text-center">
            <button
              type="button"
              onClick={() =>
                onOptionsChange({ ...options, background: "transparent" })
              }
              className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
                options.background === "transparent"
                  ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Transparent
            </button>
            <button
              type="button"
              onClick={() =>
                onOptionsChange({ ...options, background: "white" })
              }
              className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
                options.background === "white"
                  ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              White #FFF
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>PostScript Standard</span>
            <span className="font-semibold text-[var(--foreground)]">
              Level 3 / AI 8.0
            </span>
          </div>
          <div className="flex items-center h-8 px-2.5 text-xs font-mono bg-[var(--card)] text-[var(--muted-foreground)] rounded-md">
            Vector PostScript Compiler
          </div>
        </div>
      )}

      {/* Target Render Size */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>Target Canvas</span>
          <span className="text-[var(--foreground)]">
            {metadata
              ? `${Math.round(metadata.width * options.scale)} × ${Math.round(
                  metadata.height * options.scale
                )} px`
              : "—"}
          </span>
        </div>
        <div className="flex items-center h-8 px-2.5 text-xs font-mono bg-[var(--card)] text-[var(--muted-foreground)] rounded-md">
          {metadata ? `${metadata.pathCount} vector paths compiled` : "Vector AST"}
        </div>
      </div>

      {/* Optimize Vectors Toggle */}
      <div className="flex flex-col justify-end">
        <label
          className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
            options.optimizeSvg
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-medium"
              : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
        >
          <input
            type="checkbox"
            checked={options.optimizeSvg}
            onChange={(e) =>
              onOptionsChange({ ...options, optimizeSvg: e.target.checked })
            }
            className="rounded accent-[var(--foreground)] sr-only"
          />
          <span>Optimize Vector Curves & Clean AST</span>
        </label>
      </div>
    </div>
  );
}
