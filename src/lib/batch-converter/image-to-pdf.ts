import { jsPDF } from "jspdf";
import type { ImageToPdfItem, ImageToPdfConfig } from "./types";

const PAGE_DIMENSIONS_PT: Record<string, { w: number; h: number }> = {
  a4: { w: 595.28, h: 841.89 },
  letter: { w: 612.0, h: 792.0 },
  legal: { w: 612.0, h: 1008.0 },
  a3: { w: 841.89, h: 1190.55 },
  a5: { w: 419.53, h: 595.28 },
};

const MARGIN_PT: Record<string, number> = {
  none: 0,
  compact: 18,
  normal: 36,
  wide: 54,
};

const QUALITY_FACTOR: Record<string, number> = {
  lossless: 1.0,
  high: 0.92,
  medium: 0.78,
  low: 0.55,
};

/**
 * Prepares an image onto an HTML Canvas with rotation and scaling applied, returning a data URL or image element.
 */
async function renderRotatedImage(
  item: ImageToPdfItem,
  quality: number
): Promise<{ dataUrl: string; width: number; height: number; isJpeg: boolean }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(item.file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const rotationRad = (item.rotation * Math.PI) / 180;
      const is90or270 = item.rotation === 90 || item.rotation === 270;

      const canvas = document.createElement("canvas");
      const targetW = is90or270 ? img.naturalHeight : img.naturalWidth;
      const targetH = is90or270 ? img.naturalWidth : img.naturalHeight;

      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get 2D canvas context"));
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);

      ctx.save();
      ctx.translate(targetW / 2, targetH / 2);
      ctx.rotate(rotationRad);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      const isLossless = quality >= 0.99 && (item.file.type === "image/png" || item.file.name.endsWith(".png"));
      const mime = isLossless ? "image/png" : "image/jpeg";
      const dataUrl = canvas.toDataURL(mime, quality);

      resolve({
        dataUrl,
        width: targetW,
        height: targetH,
        isJpeg: mime === "image/jpeg",
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${item.name}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Generates a single merged multi-page PDF from ordered images.
 */
export async function generateMultiPagePdf(
  items: ImageToPdfItem[],
  config: ImageToPdfConfig,
  onProgress?: (percent: number, currentItem: string) => void
): Promise<Blob> {
  if (items.length === 0) {
    throw new Error("No images provided for PDF generation");
  }

  const qualityValue = QUALITY_FACTOR[config.quality] ?? 0.92;
  const marginPt = MARGIN_PT[config.margins] ?? 36;

  let pdf: jsPDF | null = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress?.(
      Math.round(((i + 1) / items.length) * 90),
      `Processing image ${i + 1} of ${items.length}: ${item.name}`
    );

    const { dataUrl, width: imgW, height: imgH, isJpeg } = await renderRotatedImage(
      item,
      qualityValue
    );

    let pageWidth = 595.28;
    let pageHeight = 841.89;
    let pageOrientation: "portrait" | "landscape" = "portrait";

    if (config.pageSize === "fit") {
      // 1px = 0.75pt (96 DPI standard)
      pageWidth = imgW * 0.75 + marginPt * 2;
      pageHeight = imgH * 0.75 + marginPt * 2;
      pageOrientation = pageWidth > pageHeight ? "landscape" : "portrait";
    } else {
      const stdDim = PAGE_DIMENSIONS_PT[config.pageSize] || PAGE_DIMENSIONS_PT.a4;
      if (config.orientation === "auto") {
        pageOrientation = imgW > imgH ? "landscape" : "portrait";
      } else {
        pageOrientation = config.orientation;
      }

      if (pageOrientation === "landscape") {
        pageWidth = Math.max(stdDim.w, stdDim.h);
        pageHeight = Math.min(stdDim.w, stdDim.h);
      } else {
        pageWidth = Math.min(stdDim.w, stdDim.h);
        pageHeight = Math.max(stdDim.w, stdDim.h);
      }
    }

    if (i === 0) {
      pdf = new jsPDF({
        orientation: pageOrientation,
        unit: "pt",
        format: config.pageSize === "fit" ? [pageWidth, pageHeight] : [pageWidth, pageHeight],
      });
    } else {
      pdf!.addPage([pageWidth, pageHeight], pageOrientation);
    }

    const printableW = pageWidth - marginPt * 2;
    const printableH = pageHeight - marginPt * 2;

    const scale = Math.min(printableW / imgW, printableH / imgH);
    const renderW = imgW * scale;
    const renderH = imgH * scale;

    const posX = marginPt + (printableW - renderW) / 2;
    const posY = marginPt + (printableH - renderH) / 2;

    pdf!.addImage(
      dataUrl,
      isJpeg ? "JPEG" : "PNG",
      posX,
      posY,
      renderW,
      renderH,
      undefined,
      "FAST"
    );

    // Optional page number
    if (config.includePageNumbers && items.length > 1) {
      pdf!.setFontSize(9);
      pdf!.setTextColor(120, 120, 120);
      const pageText = `${i + 1} / ${items.length}`;
      pdf!.text(pageText, pageWidth / 2, pageHeight - Math.max(12, marginPt / 2), {
        align: "center",
      });
    }
  }

  onProgress?.(100, "Finalizing PDF...");
  return pdf!.output("blob");
}

/**
 * Generates separate individual PDF blobs for each image.
 */
export async function generateSeparatePdfs(
  items: ImageToPdfItem[],
  config: ImageToPdfConfig,
  onProgress?: (percent: number, currentItem: string) => void
): Promise<{ fileName: string; blob: Blob }[]> {
  const results: { fileName: string; blob: Blob }[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress?.(
      Math.round(((i + 1) / items.length) * 100),
      `Rendering ${item.name} into PDF...`
    );

    const singleBlob = await generateMultiPagePdf([item], {
      ...config,
      includePageNumbers: false,
    });

    const baseName = item.name.replace(/\.[^.]+$/, "");
    results.push({
      fileName: `${baseName}.pdf`,
      blob: singleBlob,
    });
  }

  return results;
}
