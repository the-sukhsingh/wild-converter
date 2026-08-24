"use client";

import { Sliders, Minimize2, EyeOff, Hash } from "lucide-react";
import { CODE_FORMATS } from "@/lib/code-format-utils";
import type { CodeConversionOptions, CodeMetadata } from "@/lib/code-converter";

interface CodeOptionsProps {
  options: CodeConversionOptions;
  metadata: CodeMetadata;
  onChange: (options: CodeConversionOptions) => void;
  disabled?: boolean;
}

export function CodeOptions({
  options,
  metadata,
  onChange,
  disabled = false,
}: CodeOptionsProps) {
  const formatInfo = CODE_FORMATS[options.format] || CODE_FORMATS.ts;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Formatting, Indentation & Transpiler Options
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Indentation */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>Indentation</span>
            <span className="text-[var(--foreground)] font-medium">
              {options.indentation === "tab"
                ? "Tab (\\t)"
                : `${options.indentation} Spaces`}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-[var(--foreground)]/5 p-0.5 rounded border border-[var(--border)]">
            <button
              type="button"
              disabled={disabled || options.minify}
              onClick={() => onChange({ ...options, indentation: 2 })}
              className={`text-xs py-1 rounded transition-colors cursor-pointer ${
                options.indentation === 2
                  ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              2 Spaces
            </button>
            <button
              type="button"
              disabled={disabled || options.minify}
              onClick={() => onChange({ ...options, indentation: 4 })}
              className={`text-xs py-1 rounded transition-colors cursor-pointer ${
                options.indentation === 4
                  ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              4 Spaces
            </button>
            <button
              type="button"
              disabled={disabled || options.minify}
              onClick={() => onChange({ ...options, indentation: "tab" })}
              className={`text-xs py-1 rounded transition-colors cursor-pointer ${
                options.indentation === "tab"
                  ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Tab
            </button>
          </div>
        </div>

        {/* Minify Code */}
        {formatInfo.supportsMinify && (
          <div className="space-y-1.5 flex flex-col justify-end">
            <label
              className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
                options.minify
                  ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
              }`}
            >
              <input
                type="checkbox"
                checked={options.minify}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...options, minify: e.target.checked })
                }
                className="rounded accent-[var(--foreground)]"
              />
              <Minimize2 className="w-3.5 h-3.5 shrink-0" />
              <span>Minify & Compress Code</span>
            </label>
          </div>
        )}

        {/* Strip Comments */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label
            className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
              options.stripComments
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
            }`}
          >
            <input
              type="checkbox"
              checked={options.stripComments}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...options, stripComments: e.target.checked })
              }
              className="rounded accent-[var(--foreground)]"
            />
            <EyeOff className="w-3.5 h-3.5 shrink-0" />
            <span>Strip Comments</span>
          </label>
        </div>

        {/* Add Line Numbers */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label
            className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
              options.addLineNumbers
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
            }`}
          >
            <input
              type="checkbox"
              checked={options.addLineNumbers}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...options, addLineNumbers: e.target.checked })
              }
              className="rounded accent-[var(--foreground)]"
            />
            <Hash className="w-3.5 h-3.5 shrink-0" />
            <span>Prepend Line Numbers</span>
          </label>
        </div>
      </div>
    </div>
  );
}
