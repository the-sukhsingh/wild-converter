"use client";

import { CODE_FORMATS } from "@/lib/code-format-utils";
import type { CodeConversionOptions, CodeMetadata } from "@/lib/code-converter";

interface CodeOptionsProps {
  targetFormat: string;
  options: CodeConversionOptions;
  metadata: CodeMetadata | null;
  onOptionsChange: (options: CodeConversionOptions) => void;
}

export function CodeOptionsPanel({
  targetFormat,
  options,
  metadata,
  onOptionsChange,
}: CodeOptionsProps) {
  const formatInfo = CODE_FORMATS[options.format] || CODE_FORMATS.ts;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-3 border-y border-(--border) min-h-20.5 items-center">
      {/* Indentation */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-(--muted-foreground)">
          <span>Indentation</span>
          <span className="font-semibold text-(--foreground)">
            {options.indentation === "tab" ? "Tab (\\t)" : `${options.indentation} Spaces`}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-(--card) p-0.5 rounded-md h-8 items-center text-center">
          <button
            type="button"
            disabled={options.minify}
            onClick={() => onOptionsChange({ ...options, indentation: 2 })}
            className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer disabled:opacity-30 ${
              options.indentation === 2 && !options.minify
                ? "bg-(--foreground) text-(--background) font-medium"
                : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >
            2 sp
          </button>
          <button
            type="button"
            disabled={options.minify}
            onClick={() => onOptionsChange({ ...options, indentation: 4 })}
            className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer disabled:opacity-30 ${
              options.indentation === 4 && !options.minify
                ? "bg-(--foreground) text-(--background) font-medium"
                : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >
            4 sp
          </button>
          <button
            type="button"
            disabled={options.minify}
            onClick={() => onOptionsChange({ ...options, indentation: "tab" })}
            className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer disabled:opacity-30 ${
              options.indentation === "tab" && !options.minify
                ? "bg-(--foreground) text-(--background) font-medium"
                : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >
            Tab
          </button>
        </div>
      </div>

      {/* Minify Code Toggle */}
      <div className="flex flex-col justify-end">
        <label
          className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
            options.minify
              ? "bg-(--primary) text-(--primary-foreground) font-medium"
              : "bg-(--card) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)"
          }`}
        >
          <input
            type="checkbox"
            checked={options.minify}
            onChange={(e) =>
              onOptionsChange({ ...options, minify: e.target.checked })
            }
            className="rounded accent-(--foreground) sr-only"
          />
          <span>Minify & Compress Source</span>
        </label>
      </div>

      {/* Strip Comments Toggle */}
      <div className="flex flex-col justify-end">
        <label
          className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
            options.stripComments
              ? "bg-(--primary) text-(--primary-foreground) font-medium"
              : "bg-(--card) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)"
          }`}
        >
          <input
            type="checkbox"
            checked={options.stripComments}
            onChange={(e) =>
              onOptionsChange({ ...options, stripComments: e.target.checked })
            }
            className="rounded accent-(--foreground) sr-only"
          />
          <span>Strip Code Comments</span>
        </label>
      </div>

      {/* Add Line Numbers Toggle */}
      <div className="flex flex-col justify-end">
        <label
          className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
            options.addLineNumbers
              ? "bg-(--primary) text-(--primary-foreground) font-medium"
              : "bg-(--card) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)"
          }`}
        >
          <input
            type="checkbox"
            checked={options.addLineNumbers}
            onChange={(e) =>
              onOptionsChange({ ...options, addLineNumbers: e.target.checked })
            }
            className="rounded accent-(--foreground) sr-only"
          />
          <span>Prepend Line Numbers</span>
        </label>
      </div>
    </div>
  );
}
