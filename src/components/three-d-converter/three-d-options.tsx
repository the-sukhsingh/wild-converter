"use client";

import { THREE_D_FORMATS } from "@/lib/three-d-format-utils";
import type { ThreeDConversionOptions, ThreeDMetadata } from "@/lib/three-d-converter";

interface ThreeDOptionsProps {
  targetFormat: string;
  options: ThreeDConversionOptions;
  metadata: ThreeDMetadata | null;
  onOptionsChange: (options: ThreeDConversionOptions) => void;
}

export function ThreeDOptionsPanel({
  targetFormat,
  options,
  metadata,
  onOptionsChange,
}: ThreeDOptionsProps) {
  const formatInfo = THREE_D_FORMATS[options.format] || THREE_D_FORMATS.glb;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-3 border-y border-[var(--border)] min-h-[82px] items-center">
      {/* Unit Scaling */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>Unit Scale</span>
          <span className="font-semibold text-[var(--foreground)]">
            {options.scale === 1 ? "1:1" : `${options.scale}x`}
          </span>
        </div>
        <select
          value={options.scale}
          onChange={(e) =>
            onOptionsChange({
              ...options,
              scale: Number(e.target.value),
            })
          }
          className="w-full h-8 px-2.5 text-xs font-mono bg-[var(--card)] text-[var(--foreground)] rounded-md outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer"
        >
          <option value={1}>1:1 (No Rescaling)</option>
          <option value={0.001}>mm to meters (÷ 1000)</option>
          <option value={1000}>meters to mm (× 1000)</option>
          <option value={0.0254}>inches to meters (× 0.0254)</option>
        </select>
      </div>

      {/* Up Axis */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>Up Axis</span>
          <span className="font-semibold text-[var(--foreground)]">
            {options.upAxis}-UP
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 bg-[var(--card)] p-0.5 rounded-md h-8 items-center text-center">
          <button
            type="button"
            onClick={() => onOptionsChange({ ...options, upAxis: "Y" })}
            className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
              options.upAxis === "Y"
                ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Y-Up (glTF/Web)
          </button>
          <button
            type="button"
            onClick={() => onOptionsChange({ ...options, upAxis: "Z" })}
            className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
              options.upAxis === "Z"
                ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Z-Up (CAD/STL)
          </button>
        </div>
      </div>

      {/* Binary / ASCII Mode */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>Container Format</span>
          <span className="font-semibold text-[var(--foreground)]">
            {options.binary ? "Binary" : "ASCII Text"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 bg-[var(--card)] p-0.5 rounded-md h-8 items-center text-center">
          <button
            type="button"
            onClick={() => onOptionsChange({ ...options, binary: true })}
            className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
              options.binary
                ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Binary (Small)
          </button>
          <button
            type="button"
            onClick={() => onOptionsChange({ ...options, binary: false })}
            className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
              !options.binary
                ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            ASCII (Readable)
          </button>
        </div>
      </div>

      {/* Center Mesh Toggle */}
      <div className="flex flex-col justify-end">
        <label
          className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
            options.centerMesh
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-medium"
              : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
        >
          <input
            type="checkbox"
            checked={options.centerMesh}
            onChange={(e) =>
              onOptionsChange({ ...options, centerMesh: e.target.checked })
            }
            className="rounded accent-[var(--foreground)] sr-only"
          />
          <span>Center Mesh at Origin (0,0,0)</span>
        </label>
      </div>
    </div>
  );
}
