"use client";

import { useState, useEffect, useRef } from "react";
import type { PdfToImageConfig, PdfRenderedPage } from "@/lib/batch-converter/types";
import { renderPdfToImages } from "@/lib/batch-converter/pdf-to-images";
import { createZipArchive, downloadBlob } from "@/lib/batch-converter/zip-builder";
import { formatFileSize } from "@/lib/format-utils";
import {
  ArrowLeft,
  Download,
  FileStack,
  Loader2,
  CheckCircle2,
  Sliders,
  Images,
  Maximize2,
  X,
  FileText,
} from "lucide-react";

interface PdfToImageWorkspaceProps {
  pdfFile: File;
  onBack?: () => void;
}

export function PdfToImageWorkspace({
  pdfFile,
  onBack,
}: PdfToImageWorkspaceProps) {
  const [config, setConfig] = useState<PdfToImageConfig>({
    targetFormat: "png",
    scale: 2.0, // 150 DPI
    quality: 0.92,
    pageRange: "all",
    customRange: "",
    background: "white",
  });

  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [renderedPages, setRenderedPages] = useState<PdfRenderedPage[]>([]);
  const [previewPage, setPreviewPage] = useState<PdfRenderedPage | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Auto-render initial preview when mounted
  useEffect(() => {
    let active = true;

    async function initialRender() {
      setIsExtracting(true);
      setProgress(10);
      setStatusText("Parsing PDF pages...");
      try {
        const pages = await renderPdfToImages(pdfFile, pdfFile.name, config, (p, text) => {
          if (active) {
            setProgress(p);
            setStatusText(text);
          }
        });
        if (active) {
          setRenderedPages(pages);
          setProgress(100);
        }
      } catch (err) {
        if (active) {
          console.error("PDF Extraction error:", err);
          setStatusText(err instanceof Error ? err.message : "Failed to parse PDF");
        }
      } finally {
        if (active) setIsExtracting(false);
      }
    }

    initialRender();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfFile]);

  const handleExtract = async () => {
    setIsExtracting(true);
    setProgress(10);
    setStatusText("Rendering pages with updated settings...");
    setRenderedPages([]);

    try {
      const pages = await renderPdfToImages(pdfFile, pdfFile.name, config, (p, text) => {
        setProgress(p);
        setStatusText(text);
      });
      setRenderedPages(pages);
      setProgress(100);
    } catch (err) {
      console.error("PDF Extraction error:", err);
      setStatusText(err instanceof Error ? err.message : "Failed to parse PDF");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadSingle = (page: PdfRenderedPage) => {
    downloadBlob(page.blob, page.name);
  };

  const handleDownloadZip = async () => {
    if (renderedPages.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);

    try {
      const baseName = pdfFile.name.replace(/\.[^.]+$/, "");
      const zipBlob = await createZipArchive(
        renderedPages.map((p) => ({ name: p.name, blob: p.blob })),
        (percent) => setZipProgress(percent)
      );
      downloadBlob(zipBlob, `${baseName}_pages_${config.targetFormat}.zip`);
    } catch (err) {
      console.error("Zip generation error:", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full w-full max-w-5xl mx-auto px-4 md:px-8 py-4 overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="shrink-0 flex items-center justify-between border-b border-(--border) pb-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-md hover:bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) transition-colors"
              title="Back to batch table"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold font-mono text-(--foreground) flex items-center gap-2">
              <FileStack className="w-4 h-4 text-blue-500" />
              <span>PDF to Image Extractor</span>
            </h2>
            <span className="text-xs font-mono text-(--muted-foreground) truncate max-w-sm">
              {pdfFile.name} ({formatFileSize(pdfFile.size)})
            </span>
          </div>
        </div>

        {/* Global ZIP Download */}
        {renderedPages.length > 0 && (
          <button
            type="button"
            disabled={isZipping || isExtracting}
            onClick={handleDownloadZip}
            className="px-3.5 py-1.5 text-xs font-mono font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Zipping {zipProgress}%</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download All as ZIP ({renderedPages.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Middle: Config + Page Grid ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 py-3 sm:py-4 overflow-y-auto lg:overflow-hidden">
        {/* Left: Configuration Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 p-4 rounded-xl bg-(--card)/30 border border-(--border)/40 lg:overflow-y-auto">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-(--muted-foreground)" />
            <h3 className="font-mono text-xs font-semibold text-(--foreground) uppercase tracking-wider">
              Image Configuration
            </h3>
          </div>

          {/* Target Format */}
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <span className="text-(--muted-foreground)">Output Format:</span>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-(--background) border border-(--border)">
              {(["png", "jpeg", "webp", "avif"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setConfig({ ...config, targetFormat: fmt })}
                  className={`py-1.5 px-2 rounded-md font-medium text-[11px] uppercase transition-colors ${
                    config.targetFormat === fmt
                      ? "bg-(--foreground) text-(--background)"
                      : "text-(--muted-foreground) hover:text-(--foreground)"
                  }`}
                >
                  {fmt === "jpeg" ? "JPEG" : fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Scale / DPI */}
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <span className="text-(--muted-foreground)">Resolution / DPI:</span>
            <select
              value={config.scale}
              onChange={(e) =>
                setConfig({ ...config, scale: parseFloat(e.target.value) })
              }
              className="w-full h-8 px-2.5 rounded-md bg-(--background) border border-(--border) text-(--foreground)"
            >
              <option value={1.0}>1x Standard (72 DPI - Fast & Light)</option>
              <option value={1.5}>1.5x Medium (110 DPI)</option>
              <option value={2.0}>2x High Definition (150 DPI - Recommended)</option>
              <option value={3.0}>3x Print Quality (220 DPI)</option>
              <option value={4.0}>4x Ultra HD (300 DPI - Maximum Fidelity)</option>
            </select>
          </div>

          {/* Quality Slider (Lossy formats) */}
          {config.targetFormat !== "png" && (
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-(--muted-foreground)">Quality:</span>
                <span className="font-semibold text-(--foreground)">
                  {Math.round(config.quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={config.quality}
                onChange={(e) =>
                  setConfig({ ...config, quality: parseFloat(e.target.value) })
                }
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          )}

          {/* Page Range Selector */}
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <span className="text-(--muted-foreground)">Page Range:</span>
            <select
              value={config.pageRange}
              onChange={(e) =>
                setConfig({ ...config, pageRange: e.target.value as any })
              }
              className="w-full h-8 px-2.5 rounded-md bg-(--background) border border-(--border) text-(--foreground) capitalize"
            >
              <option value="all">All Pages</option>
              <option value="first">First Page Only</option>
              <option value="custom">Custom Range (e.g. 1-3, 5)</option>
            </select>
          </div>

          {config.pageRange === "custom" && (
            <div className="flex flex-col gap-1 text-xs font-mono">
              <span className="text-(--muted-foreground)">Enter page numbers:</span>
              <input
                type="text"
                placeholder="e.g. 1-3, 5, 8"
                value={config.customRange}
                onChange={(e) => setConfig({ ...config, customRange: e.target.value })}
                className="px-2.5 py-1.5 rounded-md bg-(--background) border border-(--border) text-(--foreground)"
              />
            </div>
          )}

          {/* Background */}
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <span className="text-(--muted-foreground)">Background:</span>
            <select
              value={config.background}
              onChange={(e) =>
                setConfig({ ...config, background: e.target.value as any })
              }
              className="w-full h-8 px-2.5 rounded-md bg-(--background) border border-(--border) text-(--foreground) capitalize"
            >
              <option value="white">Solid White</option>
              {config.targetFormat !== "jpeg" && (
                <option value="transparent">Transparent Alpha</option>
              )}
              <option value="black">Solid Black</option>
            </select>
          </div>

          {/* Re-render CTA */}
          <button
            type="button"
            disabled={isExtracting}
            onClick={handleExtract}
            className="mt-2 w-full py-2 px-3 text-xs font-mono font-medium rounded-md bg-(--foreground) text-(--background) hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <Images className="w-3.5 h-3.5" />
                <span>Update Extraction</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Rendered Page Gallery (8 cols) */}
        <div className="lg:col-span-8 flex flex-col min-h-0 h-full overflow-y-auto pr-1">
          {isExtracting && renderedPages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="font-mono text-xs text-(--foreground) font-medium">
                {statusText || `Extracting pages (${progress}%)...`}
              </p>
            </div>
          ) : renderedPages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-(--border) rounded-xl text-center">
              <FileText className="w-8 h-8 text-(--muted-foreground) mb-2" />
              <p className="font-mono text-xs text-(--foreground) font-medium">
                No pages extracted
              </p>
              <p className="font-mono text-[11px] text-(--muted-foreground) mt-1">
                Adjust page range or click &quot;Update Extraction&quot; to render pages
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {renderedPages.map((page) => (
                <div
                  key={page.pageNumber}
                  className="group relative flex flex-col rounded-lg border border-(--border)/60 hover:border-(--border) bg-(--card)/40 hover:bg-(--card)/80 p-2.5 transition-all"
                >
                  {/* Top: Page badge & Zoom button */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-(--foreground) text-(--background)">
                      Page {page.pageNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewPage(page)}
                      title="Enlarge preview"
                      className="p-1 rounded text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted) opacity-60 group-hover:opacity-100"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div
                    onClick={() => setPreviewPage(page)}
                    className="relative aspect-3/4 w-full rounded bg-(--background) border border-(--border)/30 overflow-hidden flex items-center justify-center cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={page.dataUrl}
                      alt={page.name}
                      className="max-h-full max-w-full object-contain pointer-events-none"
                    />
                  </div>

                  {/* Info: dimensions & size */}
                  <div className="flex flex-col mt-2 min-w-0">
                    <span
                      className="font-mono text-xs font-medium text-(--foreground) truncate"
                      title={page.name}
                    >
                      {page.name}
                    </span>
                    <span className="font-mono text-[10px] text-(--muted-foreground)">
                      {formatFileSize(page.size)} • {page.width}×{page.height}
                    </span>
                  </div>

                  {/* Single Page Download Button */}
                  <div className="border-t border-(--border)/40 pt-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(page)}
                      className="w-full py-1 px-2 text-[11px] font-mono font-medium rounded bg-(--foreground)/10 hover:bg-(--foreground)/20 text-(--foreground) transition-colors flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Image</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox Modal for Page Preview ── */}
      {previewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setPreviewPage(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPage.dataUrl}
              alt={previewPage.name}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl bg-white"
            />
            <div className="flex items-center gap-3 font-mono text-xs text-white">
              <span>
                {previewPage.name} ({previewPage.width}×{previewPage.height} •{" "}
                {formatFileSize(previewPage.size)})
              </span>
              <button
                type="button"
                onClick={() => handleDownloadSingle(previewPage)}
                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
