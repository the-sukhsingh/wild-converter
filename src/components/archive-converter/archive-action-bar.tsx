"use client";

import { ArrowRight, Download, Loader2 } from "lucide-react";
import { ARCHIVE_FORMATS, type ArchiveFormat } from "@/lib/archive-format-utils";
import { formatFileSize } from "@/lib/format-utils";

interface ArchiveActionBarProps {
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

export function ArchiveActionBar({
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
}: ArchiveActionBarProps) {
  const formatInfo = ARCHIVE_FORMATS[targetFormat as ArchiveFormat] || ARCHIVE_FORMATS.zip;

  return (
    <div className="flex flex-col gap-2 pt-1 min-h-[52px] justify-center">
      {/* Live Conversion Progress Bar with zero layout shift transition */}
      <div
        className={`w-full flex flex-col gap-1 transition-all duration-200 ease-out overflow-hidden ${
          isConverting ? "max-h-12 opacity-100 py-1" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5 truncate max-w-md">
            <Loader2 className="w-3 h-3 animate-spin text-[var(--foreground)] shrink-0" />
            <span>{progressText || "Packing archive volume..."}</span>
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

      <div className="flex items-center justify-between gap-4">
        {/* Live Size Display */}
        <div className="flex items-baseline gap-2 min-w-[140px]">
          <span className="text-base md:text-lg font-mono font-semibold text-[var(--foreground)] tabular-nums">
            {exactProbedSize ? formatFileSize(exactProbedSize) : "—"}
          </span>

          {sizeDiffPercent !== null && sizeDiffPercent !== 0 && (
            <span
              className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded-full tabular-nums ${
                sizeDiffPercent < 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              {sizeDiffPercent > 0 ? `+${sizeDiffPercent}%` : `${sizeDiffPercent}%`}
            </span>
          )}

          {isProbing && (
            <span className="text-xs font-mono text-[var(--muted-foreground)] opacity-60 animate-pulse">
              measuring…
            </span>
          )}
        </div>

        {/* Action Button: Convert or Download */}
        {resultUrl && resultBlob ? (
          <a
            href={resultUrl}
            download={outputName}
            className="h-10 px-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs md:text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download {formatInfo.label} ({formatFileSize(resultBlob.size)})</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={onConvert}
            disabled={isConverting}
            className="h-10 px-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs md:text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer shrink-0"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="tabular-nums">{progress !== undefined ? `${Math.round(progress)}%` : "Converting…"}</span>
              </>
            ) : (
              <>
                <span>Convert to {formatInfo.label}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
