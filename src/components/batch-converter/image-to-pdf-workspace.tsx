"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ImageToPdfItem, ImageToPdfConfig } from "@/lib/batch-converter/types";
import {
  generateMultiPagePdf,
  generateSeparatePdfs,
} from "@/lib/batch-converter/image-to-pdf";
import { createZipArchive, downloadBlob } from "@/lib/batch-converter/zip-builder";
import { formatFileSize } from "@/lib/format-utils";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Trash2,
  Download,
  Plus,
  FileCheck,
  Loader2,
  FileText,
  GripVertical,
  CheckCircle2,
  Layers,
} from "lucide-react";

interface ImageToPdfWorkspaceProps {
  initialFiles: File[];
  onBack?: () => void;
}

export function ImageToPdfWorkspace({
  initialFiles,
  onBack,
}: ImageToPdfWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ImageToPdfItem[]>([]);
  const [config, setConfig] = useState<ImageToPdfConfig>({
    mergeMode: "single-pdf",
    pageSize: "a4",
    orientation: "auto",
    margins: "compact",
    quality: "high",
    includePageNumbers: true,
    title: "Document",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [separatePdfs, setSeparatePdfs] = useState<{ fileName: string; blob: Blob }[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Load initial files into items with thumbnail previews
  useEffect(() => {
    let active = true;

    async function loadFiles(files: File[]) {
      const loaded: ImageToPdfItem[] = [];

      for (const file of files) {
        const url = URL.createObjectURL(file);
        let w = 800;
        let h = 600;

        try {
          if (typeof createImageBitmap !== "undefined") {
            const bmp = await createImageBitmap(file);
            w = bmp.width;
            h = bmp.height;
            bmp.close();
          }
        } catch {
          // fallback dimensions
        }

        loaded.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          thumbnailUrl: url,
          rotation: 0,
          width: w,
          height: h,
          name: file.name,
          size: file.size,
        });
      }

      if (active) {
        setItems(loaded);
      }
    }

    if (initialFiles && initialFiles.length > 0) {
      loadFiles(initialFiles);
    }

    return () => {
      active = false;
    };
  }, [initialFiles]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      items.forEach((i) => URL.revokeObjectURL(i.thumbnailUrl));
    };
  }, [resultUrl, items]);

  const handleAddFiles = useCallback(async (newFiles: File[]) => {
    const loaded: ImageToPdfItem[] = [];
    for (const file of newFiles) {
      const url = URL.createObjectURL(file);
      let w = 800;
      let h = 600;
      try {
        if (typeof createImageBitmap !== "undefined") {
          const bmp = await createImageBitmap(file);
          w = bmp.width;
          h = bmp.height;
          bmp.close();
        }
      } catch {}
      loaded.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        thumbnailUrl: url,
        rotation: 0,
        width: w,
        height: h,
        name: file.name,
        size: file.size,
      });
    }
    setItems((prev) => [...prev, ...loaded]);
  }, []);

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    setItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  };

  const rotateItem = (idx: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        rotation: (copy[idx].rotation + 90) % 360,
      };
      return copy;
    });
  };

  const removeItem = (idx: number) => {
    setItems((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].thumbnailUrl);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const handleGenerate = async () => {
    if (items.length === 0) return;
    setIsGenerating(true);
    setProgress(10);
    setStatusText("Initializing PDF compiler...");
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setSeparatePdfs([]);

    try {
      if (config.mergeMode === "single-pdf") {
        const blob = await generateMultiPagePdf(items, config, (p, text) => {
          setProgress(p);
          setStatusText(text);
        });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setProgress(100);
      } else {
        const pdfs = await generateSeparatePdfs(items, config, (p, text) => {
          setProgress(p);
          setStatusText(text);
        });
        setSeparatePdfs(pdfs);
        setProgress(100);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      setStatusText(err instanceof Error ? err.message : "PDF Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCombined = () => {
    if (!resultBlob) return;
    const baseName = items[0]?.name.replace(/\.[^.]+$/, "") || "document";
    downloadBlob(resultBlob, `${baseName}_merged.pdf`);
  };

  const handleDownloadZipSeparate = async () => {
    if (separatePdfs.length === 0) return;
    const zipBlob = await createZipArchive(
      separatePdfs.map((p) => ({ name: p.fileName, blob: p.blob }))
    );
    downloadBlob(zipBlob, "converted_pdfs.zip");
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full w-full max-w-5xl mx-auto px-4 md:px-8 py-4 overflow-hidden">
      {/* ── Top Header Bar ── */}
      <div className="shrink-0 flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-md hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              title="Back to batch table"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold font-mono text-[var(--foreground)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Image to PDF Assembly</span>
            </h2>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              {items.length} {items.length === 1 ? "image" : "images"} · Drag or use arrows to reorder pages
            </span>
          </div>
        </div>

        {/* Add More Images */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleAddFiles(Array.from(e.target.files));
                e.target.value = "";
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Images</span>
          </button>
        </div>
      </div>

      {/* ── Middle: Reorderable Image Gallery & Settings ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 py-4 overflow-hidden">
        {/* Left / Main: Visual Thumbnail Grid (8 cols) */}
        <div className="lg:col-span-8 flex flex-col min-h-0 h-full overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-[var(--border)] rounded-xl text-center">
              <FileText className="w-8 h-8 text-[var(--muted-foreground)] mb-2" />
              <p className="font-mono text-xs text-[var(--foreground)] font-medium">
                No images added yet
              </p>
              <p className="font-mono text-[11px] text-[var(--muted-foreground)] mt-1">
                Add images to combine into a multi-page PDF document
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggedIdx(idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIdx !== null && draggedIdx !== idx) {
                      moveItem(draggedIdx, idx);
                      setDraggedIdx(null);
                    }
                  }}
                  className={`group relative flex flex-col rounded-lg border border-[var(--border)]/60 hover:border-[var(--border)] bg-[var(--card)]/40 hover:bg-[var(--card)]/80 p-2.5 transition-all select-none ${
                    draggedIdx === idx ? "opacity-40 border-primary" : ""
                  }`}
                >
                  {/* Top row: Page number & Grip */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--foreground)] text-[var(--background)]">
                      Page {idx + 1}
                    </span>
                    <GripVertical className="w-3.5 h-3.5 text-[var(--muted-foreground)] opacity-40 group-hover:opacity-100 cursor-grab" />
                  </div>

                  {/* Thumbnail Preview with rotation applied */}
                  <div className="relative aspect-[4/3] w-full rounded bg-[var(--background)] border border-[var(--border)]/30 overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      style={{
                        transform: `rotate(${item.rotation}deg)`,
                        transition: "transform 150ms ease",
                      }}
                      className="max-h-full max-w-full object-contain pointer-events-none"
                    />
                  </div>

                  {/* Filename & size */}
                  <div className="flex flex-col mt-2 min-w-0">
                    <span
                      className="font-mono text-xs font-medium text-[var(--foreground)] truncate"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                      {formatFileSize(item.size)} • {item.width}×{item.height}
                    </span>
                  </div>

                  {/* Card Actions: Reorder & Rotate & Delete */}
                  <div className="flex items-center justify-between border-t border-[var(--border)]/40 pt-2 mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, idx - 1)}
                        title="Move left / up"
                        className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-20"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() => moveItem(idx, idx + 1)}
                        title="Move right / down"
                        className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-20"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => rotateItem(idx)}
                        title="Rotate 90° clockwise"
                        className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        title="Remove page"
                        className="p-1 rounded text-[var(--muted-foreground)] hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: PDF Settings & Layout Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 p-4 rounded-xl bg-[var(--card)]/30 border border-[var(--border)]/40 overflow-y-auto">
          <h3 className="font-mono text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
            PDF Document Settings
          </h3>

          {/* Merge Mode */}
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <span className="text-[var(--muted-foreground)]">Output Mode:</span>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setConfig({ ...config, mergeMode: "single-pdf" })}
                className={`py-1.5 px-2 rounded-md font-medium text-[11px] transition-colors ${
                  config.mergeMode === "single-pdf"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Merge 1 PDF
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, mergeMode: "separate-pdfs" })}
                className={`py-1.5 px-2 rounded-md font-medium text-[11px] transition-colors ${
                  config.mergeMode === "separate-pdfs"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Separate PDFs
              </button>
            </div>
          </div>

          {/* Page Size */}
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <span className="text-[var(--muted-foreground)]">Page Format:</span>
            <select
              value={config.pageSize}
              onChange={(e) =>
                setConfig({ ...config, pageSize: e.target.value as any })
              }
              className="w-full h-8 px-2.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]"
            >
              <option value="fit">Fit to Image (No White Borders)</option>
              <option value="a4">A4 Standard (210 × 297 mm)</option>
              <option value="letter">US Letter (8.5 × 11 in)</option>
              <option value="legal">Legal (8.5 × 14 in)</option>
              <option value="a3">A3 Large (297 × 420 mm)</option>
              <option value="a5">A5 Compact (148 × 210 mm)</option>
            </select>
          </div>

          {/* Orientation */}
          {config.pageSize !== "fit" && (
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <span className="text-[var(--muted-foreground)]">Orientation:</span>
              <select
                value={config.orientation}
                onChange={(e) =>
                  setConfig({ ...config, orientation: e.target.value as any })
                }
                className="w-full h-8 px-2.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] capitalize"
              >
                <option value="auto">Auto (Match Image)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          )}

          {/* Margins */}
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <span className="text-[var(--muted-foreground)]">Margins:</span>
            <select
              value={config.margins}
              onChange={(e) =>
                setConfig({ ...config, margins: e.target.value as any })
              }
              className="w-full h-8 px-2.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] capitalize"
            >
              <option value="none">None (Full Bleed)</option>
              <option value="compact">Compact (Small)</option>
              <option value="normal">Normal (Standard)</option>
              <option value="wide">Wide (Large)</option>
            </select>
          </div>

          {/* Quality */}
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <span className="text-[var(--muted-foreground)]">Image Quality:</span>
            <select
              value={config.quality}
              onChange={(e) =>
                setConfig({ ...config, quality: e.target.value as any })
              }
              className="w-full h-8 px-2.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] capitalize"
            >
              <option value="lossless">Lossless / Original</option>
              <option value="high">High Quality (92%)</option>
              <option value="medium">Medium (Compressed)</option>
              <option value="low">Low (Smallest File)</option>
            </select>
          </div>

          {/* Page numbers checkbox */}
          <div className="flex items-center gap-2 pt-1 text-xs font-mono">
            <input
              type="checkbox"
              id="cfg-page-numbers"
              checked={config.includePageNumbers}
              onChange={(e) =>
                setConfig({ ...config, includePageNumbers: e.target.checked })
              }
              className="rounded border-[var(--border)] accent-primary cursor-pointer"
            />
            <label
              htmlFor="cfg-page-numbers"
              className="text-[var(--foreground)] cursor-pointer select-none"
            >
              Include page numbers (e.g. 1/5)
            </label>
          </div>
        </div>
      </div>

      {/* ── Bottom: Progress & Execution Bar ── */}
      <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-[var(--border)] pt-3 bg-[var(--background)]">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)] w-full md:w-auto">
          {isGenerating ? (
            <div className="flex items-center gap-2 text-primary font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{statusText || `Generating PDF (${progress}%)...`}</span>
            </div>
          ) : resultBlob ? (
            <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>PDF ready ({formatFileSize(resultBlob.size)})</span>
            </div>
          ) : separatePdfs.length > 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{separatePdfs.length} PDFs generated</span>
            </div>
          ) : (
            <span>Ready to compile {items.length} pages</span>
          )}
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Download Combined PDF */}
          {resultBlob && (
            <button
              type="button"
              onClick={handleDownloadCombined}
              className="px-4 py-2 text-xs font-mono font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          )}

          {/* Download Separate PDFs ZIP */}
          {separatePdfs.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadZipSeparate}
              className="px-4 py-2 text-xs font-mono font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP ({separatePdfs.length} PDFs)</span>
            </button>
          )}

          {/* Generate Button */}
          <button
            type="button"
            disabled={isGenerating || items.length === 0}
            onClick={handleGenerate}
            className="px-4 py-2 text-xs font-mono font-semibold rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-3.5 h-3.5" />
                <span>{config.mergeMode === "single-pdf" ? "Compile & Create PDF" : "Generate Separate PDFs"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
