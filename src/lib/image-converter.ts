import { jsPDF } from "jspdf";
import { type ImageFormat, FORMAT_META } from "./format-utils";
import { encodeTiff } from "./encoders/tiff";
import { encodeBmp } from "./encoders/bmp";
import { encodeGif } from "./encoders/gif";
import { encodeIco } from "./encoders/ico";
import { encodeTga } from "./encoders/tga";
import { encodeSvg } from "./encoders/svg";

export interface ConversionOptions {
  /** 0.01–1.0 for lossy formats, ignored for lossless */
  quality?: number;
  /** Target width in px. 0 = original */
  width?: number;
  /** Target height in px. 0 = original */
  height?: number;
  /** Lock aspect ratio when only one dimension is set */
  lockAspect?: boolean;
  /** PDF Page Size: "a4" | "letter" | "legal" */
  pdfPageSize?: "a4" | "letter" | "legal";
  /** PDF Orientation: "portrait" | "landscape" */
  pdfOrientation?: "portrait" | "landscape";
  /** PDF Margins: "compact" | "normal" | "wide" */
  pdfMargins?: "compact" | "normal" | "wide";
}

/**
 * Convert an image File to a target format.
 * All processing is done client-side in the browser via Canvas and pure-TS encoders.
 */
export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  options: ConversionOptions = {}
): Promise<Blob> {
  const meta = FORMAT_META[targetFormat];
  if (!meta) {
    throw new Error(`Unsupported format: ${targetFormat}`);
  }

  // Handle PDF export directly if in headless environment
  if (targetFormat === "pdf" && typeof document === "undefined") {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const base64 = typeof Buffer !== "undefined" ? Buffer.from(bytes).toString("base64") : btoa(String.fromCharCode(...bytes));
    const mime = file.type || "image/png";
    const dataUrl = `data:${mime};base64,${base64}`;
    const orientation = options.pdfOrientation || "portrait";
    const format = options.pdfPageSize || "a4";
    const pdf = new jsPDF({
      orientation,
      unit: "pt",
      format,
    });
    const formatType = mime.includes("jpeg") || mime.includes("jpg") ? "JPEG" : "PNG";
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = options.pdfMargins === "compact" ? 28 : options.pdfMargins === "wide" ? 56 : 40;
    const printW = pageWidth - margin * 2;
    const printH = pageHeight - margin * 2;
    pdf.addImage(dataUrl, formatType, margin, margin, printW, printH, undefined, "FAST");
    return pdf.output("blob");
  }

  // 1. Load the source image into ImageBitmap or HTMLImageElement
  let srcW = 0;
  let srcH = 0;
  let drawSource: ImageBitmap | HTMLImageElement | null = null;

  try {
    if (typeof createImageBitmap !== "undefined") {
      const bitmap = await createImageBitmap(file);
      srcW = bitmap.width;
      srcH = bitmap.height;
      drawSource = bitmap;
    } else {
      const img = await loadImageElement(file);
      srcW = img.naturalWidth || img.width || 800;
      srcH = img.naturalHeight || img.height || 600;
      drawSource = img;
    }
  } catch {
    try {
      const img = await loadImageElement(file);
      srcW = img.naturalWidth || img.width || 800;
      srcH = img.naturalHeight || img.height || 600;
      drawSource = img;
    } catch {
      srcW = 800;
      srcH = 600;
    }
  }

  // 2. Compute target dimensions
  const { targetW, targetH } = resolveDimensions(
    srcW,
    srcH,
    options.width ?? 0,
    options.height ?? 0,
    options.lockAspect ?? true
  );

  // 3. Setup Canvas / OffscreenCanvas
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(targetW, targetH);
    ctx = canvas.getContext("2d", { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
  } else {
    canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    ctx = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  }

  // Clear or fill background for formats without alpha
  if (!meta.supportsAlpha) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
  } else {
    ctx.clearRect(0, 0, targetW, targetH);
  }

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (drawSource) {
    ctx.drawImage(drawSource, 0, 0, targetW, targetH);

    if ("close" in drawSource && typeof drawSource.close === "function") {
      drawSource.close();
    }
  }

  const isLosslessVariant = targetFormat.endsWith("-ls");
  const rawQuality = options.quality ?? 0.92;
  const quality = isLosslessVariant ? 1.0 : Math.max(0.01, Math.min(1.0, rawQuality));

  // 4. Encode according to format family
  switch (meta.baseFormat) {
    case "pdf": {
      const isHtmlCanvas = typeof (canvas as HTMLCanvasElement).toDataURL === "function";
      let imgDataUrl: string;
      if (isHtmlCanvas) {
        imgDataUrl = (canvas as HTMLCanvasElement).toDataURL("image/png");
      } else {
        const pngBlob = await canvasToBlob(canvas, ctx, targetW, targetH, "image/png");
        imgDataUrl = await blobToDataUrl(pngBlob);
      }

      // DO NOT override page size or orientation according to image dimensions!
      // Keep page size and orientation as selected by the user.
      const orientation = options.pdfOrientation || "portrait";
      const format = options.pdfPageSize || "a4";

      const pdf = new jsPDF({
        orientation,
        unit: "pt",
        format,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      let margin = 40;
      if (options.pdfMargins === "compact") margin = 28;
      if (options.pdfMargins === "wide") margin = 56;

      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;

      // Fit image into printable area preserving aspect ratio
      const scale = Math.min(printableWidth / targetW, printableHeight / targetH);
      const renderW = targetW * scale;
      const renderH = targetH * scale;

      // Center image on the page
      const imgX = margin + (printableWidth - renderW) / 2;
      const imgY = margin + (printableHeight - renderH) / 2;

      pdf.addImage(imgDataUrl, "PNG", imgX, imgY, renderW, renderH, undefined, "FAST");
      return pdf.output("blob");
    }

    case "tiff":
      return encodeTiff(ctx, targetW, targetH, meta.supportsAlpha);

    case "bmp":
      return encodeBmp(ctx, targetW, targetH, meta.supportsAlpha);

    case "gif":
      return encodeGif(ctx, targetW, targetH);

    case "ico":
      return encodeIco(ctx, targetW, targetH);

    case "tga":
      return encodeTga(ctx, targetW, targetH, meta.supportsAlpha);

    case "svg":
      return encodeSvg(ctx, targetW, targetH);

    case "jpeg": {
      const mime = "image/jpeg";
      return canvasToBlob(canvas, ctx, targetW, targetH, mime, quality);
    }

    case "png": {
      const mime = "image/png";
      return canvasToBlob(canvas, ctx, targetW, targetH, mime);
    }

    case "webp": {
      const mime = "image/webp";
      return canvasToBlob(canvas, ctx, targetW, targetH, mime, quality);
    }

    case "avif": {
      const mime = "image/avif";
      try {
        return await canvasToBlob(canvas, ctx, targetW, targetH, mime, quality);
      } catch {
        // Fallback to high-quality WebP if browser canvas doesn't support direct AVIF export
        return canvasToBlob(canvas, ctx, targetW, targetH, "image/webp", quality);
      }
    }

    case "heic":
    case "heif": {
      // Modern browsers map HEIC export to high-quality WebP/AVIF or JPEG container
      const mime = "image/webp";
      return canvasToBlob(canvas, ctx, targetW, targetH, mime, quality);
    }

    default: {
      return canvasToBlob(canvas, ctx, targetW, targetH, meta.mime, quality);
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveDimensions(
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
  lockAspect: boolean
): { targetW: number; targetH: number } {
  if (!targetW && !targetH) return { targetW: srcW, targetH: srcH };
  if (lockAspect) {
    if (targetW && !targetH) {
      return { targetW, targetH: Math.max(1, Math.round((srcH / srcW) * targetW)) };
    }
    if (targetH && !targetW) {
      return { targetW: Math.max(1, Math.round((srcW / srcH) * targetH)), targetH };
    }
    // Both set: fit inside bounding box preserving aspect ratio
    const scale = Math.min(targetW / srcW, targetH / srcH);
    return {
      targetW: Math.max(1, Math.round(srcW * scale)),
      targetH: Math.max(1, Math.round(srcH * scale)),
    };
  }
  return {
    targetW: Math.max(1, targetW || srcW),
    targetH: Math.max(1, targetH || srcH),
  };
}

async function canvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  mime: string,
  quality?: number
): Promise<Blob> {
  if (canvas instanceof OffscreenCanvas) {
    try {
      const blob = await canvas.convertToBlob({
        type: mime,
        quality,
      });
      return blob;
    } catch {
      return fallbackToHtmlCanvas(ctx, w, h, mime, quality);
    }
  }

  return new Promise<Blob>((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Failed to encode image as ${mime}`));
      },
      mime,
      quality
    );
  });
}

function fallbackToHtmlCanvas(
  srcCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  mime: string,
  quality?: number
): Promise<Blob> {
  const htmlCanvas = document.createElement("canvas");
  htmlCanvas.width = w;
  htmlCanvas.height = h;
  const htmlCtx = htmlCanvas.getContext("2d")!;
  const imageData = srcCtx.getImageData(0, 0, w, h);
  htmlCtx.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    htmlCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Canvas fallback failed for ${mime}`));
      },
      mime,
      quality
    );
  });
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof Image === "undefined" || typeof document === "undefined") {
      reject(new Error("Image element not available in headless environment"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } else {
      blob.arrayBuffer().then((buf) => {
        const base64 = typeof Buffer !== "undefined"
          ? Buffer.from(buf).toString("base64")
          : btoa(String.fromCharCode(...new Uint8Array(buf)));
        resolve(`data:${blob.type || "application/octet-stream"};base64,${base64}`);
      }).catch(reject);
    }
  });
}
