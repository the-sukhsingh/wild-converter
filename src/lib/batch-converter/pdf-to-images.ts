import type { PdfToImageConfig, PdfRenderedPage } from "./types";

/**
 * Parses custom page range string like "1-3, 5, 8-10" into an array of 1-based page numbers.
 */
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr.trim()) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pagesSet = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(totalPages, Math.max(start, end));
        for (let p = from; p <= to; p++) {
          pagesSet.add(p);
        }
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        pagesSet.add(p);
      }
    }
  }

  const result = Array.from(pagesSet).sort((a, b) => a - b);
  return result.length > 0 ? result : Array.from({ length: totalPages }, (_, i) => i + 1);
}

/**
 * Renders PDF pages to individual image blobs with configurable scale and quality.
 */
export async function renderPdfToImages(
  file: File | Blob,
  fileName: string,
  config: PdfToImageConfig,
  onProgress?: (percent: number, text: string) => void
): Promise<PdfRenderedPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const baseName = fileName.replace(/\.[^.]+$/, "");

  onProgress?.(5, "Loading PDF engine...");

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.0.379"}/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  let targetPages: number[] = [];
  if (config.pageRange === "first") {
    targetPages = [1];
  } else if (config.pageRange === "custom") {
    targetPages = parsePageRangeString(config.customRange, totalPages);
  } else {
    targetPages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const renderedPages: PdfRenderedPage[] = [];
  const ext = config.targetFormat === "jpeg" ? "jpg" : config.targetFormat;
  const mimeType =
    config.targetFormat === "jpeg"
      ? "image/jpeg"
      : config.targetFormat === "webp"
      ? "image/webp"
      : config.targetFormat === "avif"
      ? "image/avif"
      : "image/png";

  for (let idx = 0; idx < targetPages.length; idx++) {
    const pageNum = targetPages[idx];
    const percent = Math.round(10 + ((idx + 1) / targetPages.length) * 85);
    onProgress?.(percent, `Rendering page ${pageNum} of ${totalPages}...`);

    const page = await pdf.getPage(pageNum);
    const scale = config.scale || 2.0;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Could not get canvas context for PDF rendering");

    // Handle background
    if (config.background === "white" || config.targetFormat === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (config.background === "black") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const renderContext = {
      canvasContext: ctx as any,
      canvas: canvas as any,
      viewport,
      background: config.background === "transparent" ? "rgba(0,0,0,0)" : undefined,
    };

    await (page as any).render(renderContext).promise;

    // Convert canvas to target format blob
    let blob: Blob;

    if (config.targetFormat === "webp") {
      try {
        const { encode } = await import("@jsquash/webp");
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const encoded = await encode(imgData, { quality: (config.quality || 0.9) * 100 });
        blob = new Blob([encoded], { type: "image/webp" });
      } catch {
        blob = await canvasToBlob(canvas, mimeType, config.quality);
      }
    } else if (config.targetFormat === "avif") {
      try {
        const { encode } = await import("@jsquash/avif");
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const encoded = await encode(imgData, { quality: (config.quality || 0.85) * 100 });
        blob = new Blob([encoded], { type: "image/avif" });
      } catch {
        blob = await canvasToBlob(canvas, mimeType, config.quality);
      }
    } else if (config.targetFormat === "jpeg") {
      try {
        const { encode } = await import("@jsquash/jpeg");
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const encoded = await encode(imgData, { quality: Math.round((config.quality || 0.9) * 100) });
        blob = new Blob([encoded], { type: "image/jpeg" });
      } catch {
        blob = await canvasToBlob(canvas, mimeType, config.quality);
      }
    } else {
      // PNG (lossless)
      blob = await canvasToBlob(canvas, "image/png");
    }

    const pageDataUrl = canvas.toDataURL("image/jpeg", 0.5); // Lightweight preview
    const outputFileName = `${baseName}_page_${String(pageNum).padStart(2, "0")}.${ext}`;

    renderedPages.push({
      pageNumber: pageNum,
      blob,
      dataUrl: pageDataUrl,
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
      name: outputFileName,
    });
  }

  onProgress?.(100, "Done");
  return renderedPages;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error(`Failed to encode canvas as ${mime}`));
      },
      mime,
      quality
    );
  });
}
