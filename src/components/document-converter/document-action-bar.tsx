"use client";

import { ArrowRight, Download, Loader2 } from "lucide-react";
import {
  type DocumentFormat,
  DOCUMENT_FORMAT_META,
  formatDocumentSize,
} from "@/lib/document-format-utils";

interface DocumentActionBarProps {
  targetFormat: DocumentFormat;
  exactProbedSize: number | null;
  sizeDiffPercent: number | null;
  isProbing: boolean;
  isConverting: boolean;
  actualOutputBlob: Blob | null;
  outputName: string;
  onConvert: () => void;
}

export function DocumentActionBar({
  targetFormat,
  exactProbedSize,
  sizeDiffPercent,
  isProbing,
  isConverting,
  actualOutputBlob,
  outputName,
  onConvert,
}: DocumentActionBarProps) {
  const targetMeta = DOCUMENT_FORMAT_META[targetFormat];

  const handleDownload = () => {
    if (!actualOutputBlob) return;
    const url = URL.createObjectURL(actualOutputBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const displaySize = actualOutputBlob
    ? formatDocumentSize(actualOutputBlob.size)
    : exactProbedSize
    ? formatDocumentSize(exactProbedSize)
    : "—";

  return (
    <div className="flex items-center justify-between gap-4 pt-1">
      {/* Live Size Display */}
      <div className="flex items-baseline gap-2">
        <span className="text-base md:text-lg font-mono font-semibold text-[var(--foreground)]">
          {displaySize}
        </span>

        {sizeDiffPercent !== null && sizeDiffPercent !== 0 && (
          <span
            className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded-full ${
              sizeDiffPercent < 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {sizeDiffPercent > 0 ? `+${sizeDiffPercent}%` : `${sizeDiffPercent}%`}
          </span>
        )}

        {isProbing && (
          <span className="text-xs font-mono text-[var(--muted-foreground)] opacity-60">
            measuring…
          </span>
        )}
      </div>

      {/* Action Button: Convert or Download */}
      {actualOutputBlob ? (
        <button
          type="button"
          onClick={handleDownload}
          className="h-10 px-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs md:text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>
            Download {targetMeta?.label} ({formatDocumentSize(actualOutputBlob.size)})
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onConvert}
          disabled={isConverting}
          className="h-10 px-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs md:text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
        >
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Converting…</span>
            </>
          ) : (
            <>
              <span>Convert to {targetMeta?.label}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
