"use client";

import { Sliders, Move, Binary, Compass, Box } from "lucide-react";
import { THREE_D_FORMATS } from "@/lib/three-d-format-utils";
import type { ThreeDConversionOptions, ThreeDMetadata } from "@/lib/three-d-converter";

interface ThreeDOptionsProps {
  options: ThreeDConversionOptions;
  metadata: ThreeDMetadata;
  onChange: (options: ThreeDConversionOptions) => void;
  disabled?: boolean;
}

export function ThreeDOptions({
  options,
  metadata,
  onChange,
  disabled = false,
}: ThreeDOptionsProps) {
  const formatInfo = THREE_D_FORMATS[options.format] || THREE_D_FORMATS.glb;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Mesh Transformation & Geometry Settings
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Scale Multiplier */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>Scale / Unit Preset</span>
            <span className="text-[var(--foreground)] font-medium">
              {options.scale}x
            </span>
          </label>
          <select
            value={options.scale}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...options,
                scale: Number(e.target.value),
              })
            }
            className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
          >
            <option value={1}>1.0x (1:1 Native Scale)</option>
            <option value={0.001}>0.001x (Millimeters → Meters)</option>
            <option value={0.01}>0.01x (Centimeters → Meters)</option>
            <option value={1000}>1000x (Meters → Millimeters for 3D Print)</option>
            <option value={0.0254}>0.0254x (Inches → Meters)</option>
            <option value={2}>2.0x (200% Upscale)</option>
            <option value={0.5}>0.5x (50% Downscale)</option>
          </select>
        </div>

        {/* Up-Axis */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>Up-Axis Orientation</span>
            <span className="text-[var(--foreground)] font-medium">
              {options.upAxis}-Up
            </span>
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[var(--foreground)]/5 p-0.5 rounded border border-[var(--border)]">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...options, upAxis: "Y" })}
              className={`text-xs py-1 rounded transition-colors cursor-pointer ${
                options.upAxis === "Y"
                  ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Y-Up (glTF / WebGL)
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...options, upAxis: "Z" })}
              className={`text-xs py-1 rounded transition-colors cursor-pointer ${
                options.upAxis === "Z"
                  ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Z-Up (CAD / 3D Print)
            </button>
          </div>
        </div>

        {/* Binary Encoding */}
        {formatInfo.supportsBinary && (
          <div className="space-y-1.5">
            <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
              <span>Encoding Mode</span>
              <span className="text-[var(--foreground)] font-medium">
                {options.binary ? "Binary" : "ASCII Text"}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-1 bg-[var(--foreground)]/5 p-0.5 rounded border border-[var(--border)]">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...options, binary: true })}
                className={`text-xs py-1 rounded transition-colors cursor-pointer ${
                  options.binary
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Binary (Fast & Small)
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...options, binary: false })}
                className={`text-xs py-1 rounded transition-colors cursor-pointer ${
                  !options.binary
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                ASCII Text
              </button>
            </div>
          </div>
        )}

        {/* Center Mesh to Origin */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label
            className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
              options.centerMesh
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
            }`}
          >
            <input
              type="checkbox"
              checked={options.centerMesh}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...options, centerMesh: e.target.checked })
              }
              className="rounded accent-[var(--foreground)]"
            />
            <Move className="w-3.5 h-3.5 shrink-0" />
            <span>Center Mesh to (0, 0, 0)</span>
          </label>
        </div>

        {/* Recalculate Normals */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label
            className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
              options.computeNormals
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
            }`}
          >
            <input
              type="checkbox"
              checked={options.computeNormals}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...options, computeNormals: e.target.checked })
              }
              className="rounded accent-[var(--foreground)]"
            />
            <Compass className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>Recompute Facet Normals</span>
          </label>
        </div>

        {/* Engine status */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <div className="flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--foreground)]/[0.02]">
            <Box className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            <span className="truncate">WebGL 3D Buffer Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
