"use client";

import type { DocumentFormat } from "@/lib/document-format-utils";
import type { DocumentConversionOptions } from "@/lib/document-converter/types";

interface DocumentOptionsProps {
  targetFormat: DocumentFormat;
  options: DocumentConversionOptions;
  onOptionsChange: (opts: DocumentConversionOptions) => void;
}

export function DocumentOptionsPanel({
  targetFormat,
  options,
  onOptionsChange,
}: DocumentOptionsProps) {
  const isPdf = targetFormat === "pdf";
  const isDocx = targetFormat === "docx" || targetFormat === "doc" || targetFormat === "odt";
  const isSpreadsheet =
    targetFormat === "xlsx" ||
    targetFormat === "xls" ||
    targetFormat === "csv" ||
    targetFormat === "ods";
  const isHtml = targetFormat === "html" || targetFormat === "htm";
  const isLatex = targetFormat === "tex";

  const pageSize = options.pdfPageSize || "a4";
  const orientation = options.pdfOrientation || "portrait";
  const margins = options.pdfMargins || "normal";
  const docxFont = options.docxFontFamily || "sans";
  const delimiter = options.csvDelimiter || ",";
  const latexClass = options.latexClass || "article";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-y border-[var(--border)]">
      {/* Column 1 */}
      {isPdf ? (
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
      ) : isDocx ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Typography Font</span>
            <span className="font-semibold text-[var(--foreground)] capitalize">
              {docxFont === "sans" ? "Sans (Arial)" : docxFont === "serif" ? "Serif (Georgia)" : "Mono"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {(["sans", "serif", "mono"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onOptionsChange({ ...options, docxFontFamily: f })}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-medium capitalize transition-all cursor-pointer ${
                  docxFont === f
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {f === "sans" ? "Sans (Arial)" : f === "serif" ? "Serif (Georgia)" : "Mono"}
              </button>
            ))}
          </div>
        </div>
      ) : isSpreadsheet ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Delimiter & Structure</span>
            <span className="font-semibold text-[var(--foreground)]">
              {targetFormat === "csv" ? (delimiter === "," ? "Comma (,)" : delimiter === ";" ? "Semicolon (;)" : "Tab") : "Multi-Sheet"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {targetFormat === "csv" ? (
              [
                { label: "Comma (,)", value: "," },
                { label: "Semicolon (;)", value: ";" },
                { label: "Tab (\\t)", value: "\t" },
              ].map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() =>
                    onOptionsChange({
                      ...options,
                      csvDelimiter: d.value as "," | ";" | "\t",
                    })
                  }
                  className={`h-7 px-2.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                    delimiter === d.value
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                      : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {d.label}
                </button>
              ))
            ) : (
              <span className="text-xs font-mono text-[var(--muted-foreground)]">
                Standard SheetJS workbook formatting with cell grid mapping.
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center gap-1 text-xs font-mono text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]">Standard Document Encoding</span>
          <span>Preserves document AST structure, headings, lists, tables, and code.</span>
        </div>
      )}

      {/* Column 2 */}
      {isPdf ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Layout Margins & Headers</span>
            <span className="font-semibold text-[var(--foreground)] capitalize">
              {margins} margins
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
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
            <span className="text-xs text-[var(--muted-foreground)] mx-1">•</span>
            <button
              type="button"
              onClick={() =>
                onOptionsChange({
                  ...options,
                  pdfPageNumbers: !(options.pdfPageNumbers ?? true),
                })
              }
              className={`h-7 px-2.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                options.pdfPageNumbers ?? true
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              Page Numbers: {options.pdfPageNumbers ?? true ? "On" : "Off"}
            </button>
          </div>
        </div>
      ) : isHtml ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Responsive Styling</span>
            <span className="font-semibold text-[var(--foreground)]">
              {options.includeStyling !== false ? "Embedded CSS" : "Plain HTML"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                onOptionsChange({
                  ...options,
                  includeStyling: !(options.includeStyling ?? true),
                })
              }
              className={`h-7 px-2.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                options.includeStyling !== false
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              Responsive Typography CSS: {options.includeStyling !== false ? "Included" : "None"}
            </button>
          </div>
        </div>
      ) : isLatex ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Document Class</span>
            <span className="font-semibold text-[var(--foreground)] capitalize">
              {latexClass}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {(["article", "report", "book"] as const).map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => onOptionsChange({ ...options, latexClass: cls })}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-medium capitalize transition-all cursor-pointer ${
                  latexClass === cls
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center gap-1 text-xs font-mono text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]">Zero Server Uploads</span>
          <span>100% processed in your browser client via WebAssembly.</span>
        </div>
      )}
    </div>
  );
}
