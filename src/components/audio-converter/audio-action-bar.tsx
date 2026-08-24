"use client";

import { Download, Loader2, Play, RefreshCw, CheckCircle2 } from "lucide-react";
import type { AudioConversionResult } from "@/lib/audio-converter";

interface AudioActionBarProps {
  isConverting: boolean;
  progressText?: string;
  result: AudioConversionResult | null;
  onConvert: () => void;
  onReset: () => void;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function AudioActionBar({
  isConverting,
  progressText,
  result,
  onConvert,
  onReset,
  disabled = false,
}: AudioActionBarProps) {
  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full pt-4 border-t border-[var(--border)] space-y-3">
      {result ? (
        <div className="space-y-3">
          {/* Audio Player for converted output */}
          <div className="p-3 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--foreground)] truncate">
                  {result.fileName}
                </p>
                <p className="text-[11px] font-mono text-[var(--muted-foreground)]">
                  {formatBytes(result.fileSizeBytes)} • {result.channels === 1 ? "Mono" : "Stereo"} • {result.sampleRate / 1000} kHz
                </p>
              </div>
            </div>

            <audio
              controls
              src={result.url}
              className="h-8 max-w-full sm:max-w-xs focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Convert Another</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 rounded bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity text-xs font-mono font-medium cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {result.fileName}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-[var(--muted-foreground)]">
            {isConverting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {progressText || "Processing audio stream..."}
              </span>
            ) : (
              <span>100% Client-Side Web Audio DSP</span>
            )}
          </div>

          <button
            type="button"
            disabled={disabled || isConverting}
            onClick={onConvert}
            className="flex items-center gap-2 px-6 py-2 rounded bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-50 transition-all text-xs font-mono font-medium cursor-pointer"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Convert Audio</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
