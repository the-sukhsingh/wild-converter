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

  // 1. Load the source image into ImageBitmap or HTMLImageElement
  let srcW = 0;
  let srcH = 0;
  let drawSource: ImageBitmap | HTMLImageElement;

  try {
    const bitmap = await createImageBitmap(file);
    srcW = bitmap.width;
    srcH = bitmap.height;
    drawSource = bitmap;
  } catch {
    // Fallback using HTMLImageElement (e.g. for SVGs or special image types)
    const img = await loadImageElement(file);
    srcW = img.naturalWidth || img.width || 800;
    srcH = img.naturalHeight || img.height || 600;
    drawSource = img;
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
  ctx.drawImage(drawSource, 0, 0, targetW, targetH);

  if ("close" in drawSource && typeof drawSource.close === "function") {
    drawSource.close();
  }

  const isLosslessVariant = targetFormat.endsWith("-ls");
  const rawQuality = options.quality ?? 0.92;
  const quality = isLosslessVariant ? 1.0 : Math.max(0.01, Math.min(1.0, rawQuality));

  // 4. Encode according to format family
  switch (meta.baseFormat) {
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
