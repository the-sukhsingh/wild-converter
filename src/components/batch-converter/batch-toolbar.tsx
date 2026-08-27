"use client";

import { useMemo, useRef } from "react";
import type { BatchItem } from "@/lib/batch-converter/types";
import { formatFileSize } from "@/lib/format-utils";
import {
  Play,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  FileStack,
  Images,
  Loader2,
  Layers,
} from "lucide-react";

interface BatchToolbarProps {
  items: BatchItem[];
  isConvertingAll: boolean;
  isZipping: boolean;
  zipProgress: number;
  onConvertAll: () => void;
  onDownloadZip: () => void;
  onAddFiles: (files: File[]) => void;
  onClearAll: () => void;
  onClearDone: () => void;
  onApplyGlobalFormat: (format: string) => void;
  onOpenImageToPdf?: () => void;
  onOpenPdfToImage?: (pdfFile: File) => void;
}

export function BatchToolbar({
  items,
  isConvertingAll,
  isZipping,
  zipProgress,
  onConvertAll,
  onDownloadZip,
  onAddFiles,
  onClearAll,
  onClearDone,
  onApplyGlobalFormat,
  onOpenImageToPdf,
  onOpenPdfToImage,
}: BatchToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doneCount = items.filter((i) => i.status === "done").length;
  const idleCount = items.filter((i) => i.status === "idle" || i.status === "error").length;
  const imageCount = items.filter((i) => i.category === "images").length;
  const pdfItem = items.find(
    (i) => i.category === "documents" && (i.detectedInputFormat === "pdf" || i.name.toLowerCase().endsWith(".pdf"))
  );

  const totalInputBytes = useMemo(
    () => items.reduce((acc, curr) => acc + curr.size, 0),
    [items]
  );

  const totalOutputBytes = useMemo(
    () =>
      items.reduce(
        (acc, curr) => acc + (curr.outputSize !== null ? curr.outputSize : curr.size),
        0
      ),
    [items]
  );

  const savedBytes = totalInputBytes - totalOutputBytes;
  const savedPercent =
    totalInputBytes > 0 && doneCount > 0
      ? Math.round((savedBytes / totalInputBytes) * 100)
      : null;

  return (
    <div className="flex flex-col gap-3 py-3 border-b border-[var(--border)] bg-[var(--background)]">
      {/* ── Top Bar: Statistics & Quick Mode Triggers ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--foreground)]">
            <Layers className="w-4 h-4 text-[var(--muted-foreground)]" />
            <span>
              {doneCount}/{items.length} converted
            </span>
          </div>

          {doneCount > 0 && savedBytes > 0 && (
            <span className="hidden sm:inline font-mono text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
              saved {formatFileSize(savedBytes)} ({savedPercent}%)
            </span>
          )}
        </div>

        {/* Specialized mode triggers */}
        <div className="flex items-center gap-2">
          {imageCount >= 2 && onOpenImageToPdf && (
            <button
              type="button"
              onClick={onOpenImageToPdf}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors flex items-center gap-1.5"
            >
              <Images className="w-3.5 h-3.5 text-emerald-500" />
              <span>Image to PDF (Reorder)</span>
            </button>
          )}

          {pdfItem && onOpenPdfToImage && (
            <button
              type="button"
              onClick={() => onOpenPdfToImage(pdfItem.file)}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors flex items-center gap-1.5"
            >
              <FileStack className="w-3.5 h-3.5 text-blue-500" />
              <span>PDF to Images</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Bottom Bar: Actions & Bulk Format ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Global Format Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--muted-foreground)] shrink-0">
            Convert all to:
          </span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                onApplyGlobalFormat(e.target.value);
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="h-8 px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer"
          >
            <option value="" disabled>
              Select format...
            </option>
            <optgroup label="Images">
              <option value="webp">WebP (High efficiency)</option>
              <option value="png">PNG (Lossless)</option>
              <option value="jpeg">JPEG (Photo)</option>
              <option value="avif">AVIF (Next-gen)</option>
              <option value="pdf">PDF Document</option>
            </optgroup>
            <optgroup label="Documents">
              <option value="pdf">PDF Document</option>
              <option value="docx">DOCX (Word)</option>
              <option value="txt">TXT (Plain Text)</option>
              <option value="html">HTML</option>
              <option value="md">Markdown</option>
            </optgroup>
            <optgroup label="Audio">
              <option value="mp3">MP3</option>
              <option value="wav">WAV</option>
              <option value="flac">FLAC</option>
            </optgroup>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Add more files */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAddFiles(Array.from(e.target.files));
                e.target.value = "";
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 text-xs font-mono font-medium rounded-md border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Files</span>
          </button>

          {/* Download All as ZIP */}
          {doneCount > 0 && (
            <button
              type="button"
              disabled={isZipping}
              onClick={onDownloadZip}
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Zipping {zipProgress}%</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP ({doneCount})</span>
                </>
              )}
            </button>
          )}

          {/* Convert All */}
          {idleCount > 0 && (
            <button
              type="button"
              disabled={isConvertingAll}
              onClick={onConvertAll}
              className="px-3.5 py-1.5 text-xs font-mono font-medium rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isConvertingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Convert All ({idleCount})</span>
                </>
              )}
            </button>
          )}

          {/* Clear Actions */}
          {doneCount > 0 && (
            <button
              type="button"
              onClick={onClearDone}
              title="Clear converted files"
              className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors text-xs font-mono"
            >
              Clear Done
            </button>
          )}

          <button
            type="button"
            onClick={onClearAll}
            title="Clear entire batch"
            className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
