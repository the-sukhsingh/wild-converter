"use client";

import { ArrowRight, Download, Loader2 } from "lucide-react";
import { CODE_FORMATS, type CodeFormat } from "@/lib/code-format-utils";
import { formatFileSize } from "@/lib/format-utils";

interface CodeActionBarProps {
  targetFormat: string;
  exactProbedSize: number | null;
  sizeDiffPercent: number | null;
  isProbing: boolean;
  isConverting: boolean;
  progress?: number;
  progressText?: string;
  resultUrl: string | null;
  resultBlob: Blob | null;
  outputName: string;
  onConvert: () => void;
  onCancel?: () => void;
}

export function CodeActionBar({
  targetFormat,
  exactProbedSize,
  sizeDiffPercent,
  isProbing,
  isConverting,
  progress,
  progressText,
  resultUrl,
  resultBlob,
  outputName,
  onConvert,
  onCancel,
}: CodeActionBarProps) {
  const formatInfo = CODE_FORMATS[targetFormat as CodeFormat] || CODE_FORMATS.ts;

  return (
    <div className="flex flex-col gap-2 pt-1 min-h-[52px] justify-center w-full">
      {/* Live Conversion Progress Bar with zero layout shift transition */}
      <div
        className={`w-full flex flex-col gap-1 transition-all duration-200 ease-out overflow-hidden ${
          isConverting ? "max-h-12 opacity-100 py-1" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-md">
            <Loader2 className="w-3 h-3 animate-spin text-[var(--foreground)] shrink-0" />
            <span className="truncate">{progressText || "Transpiling code buffer..."}</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-[var(--foreground)] tabular-nums">
              {Math.round(progress ?? 0)}%
            </span>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-[11px] font-mono text-[var(--muted-foreground)] hover:text-destructive px-1.5 py-0.5 rounded hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Cancel conversion"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        <div className="w-full h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-150 ease-out rounded-full"
            style={{ width: `${Math.max(4, Math.min(100, progress ?? 0))}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Live Size Display */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden">
          <span className="text-sm sm:text-base md:text-lg font-mono font-semibold text-[var(--foreground)] tabular-nums shrink-0">
            {exactProbedSize ? formatFileSize(exactProbedSize) : "—"}
          </span>

          {sizeDiffPercent !== null && sizeDiffPercent !== 0 && (
            <span
              className={`text-[11px] sm:text-xs font-mono font-medium px-1.5 py-0.2 rounded-full tabular-nums shrink-0 ${
                sizeDiffPercent < 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              {sizeDiffPercent > 0 ? `+${sizeDiffPercent}%` : `${sizeDiffPercent}%`}
            </span>
          )}

          {isProbing && (
            <span className="text-[11px] sm:text-xs font-mono text-[var(--muted-foreground)] opacity-60 animate-pulse shrink-0">
              measuring…
            </span>
          )}
        </div>

        {/* Action Button: Convert or Download */}
        {resultUrl && resultBlob ? (
          <a
            href={resultUrl}
            download={outputName}
            className="h-9 sm:h-10 px-4 sm:px-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 sm:gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm shrink-0"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Download ({formatFileSize(resultBlob.size)})</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={onConvert}
            disabled={isConverting}
            className="h-9 sm:h-10 px-4 sm:px-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 sm:gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer shrink-0"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
                <span className="tabular-nums">{progress !== undefined ? `${Math.round(progress)}%` : "Converting…"}</span>
              </>
            ) : (
              <>
                <span className="truncate">Convert to {formatInfo.label}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
