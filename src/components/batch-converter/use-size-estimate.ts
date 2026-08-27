"use client";

import { useState, useEffect } from "react";
import type { BatchItem } from "@/lib/batch-converter/types";
import { estimateOutputSize, formatFileSize } from "@/lib/format-utils";
import type { ImageFormat } from "@/lib/format-utils";

// Heuristics for non-image formats: ratio multipliers relative to input size
const FORMAT_SIZE_RATIO: Record<string, number> = {
  // Documents
  pdf: 1.1,
  docx: 0.9,
  doc: 0.9,
  txt: 0.05,
  md: 0.06,
  html: 0.12,
  rtf: 0.9,
  odt: 0.85,
  // Audio
  mp3: 0.12,
  aac: 0.10,
  ogg: 0.11,
  flac: 0.70,
  wav: 1.8,
  m4a: 0.10,
  opus: 0.07,
  // Video
  mp4: 0.6,
  webm: 0.55,
  mkv: 0.95,
  avi: 1.1,
  mov: 0.7,
  // Fonts
  woff2: 0.4,
  woff: 0.6,
  ttf: 0.9,
  otf: 0.9,
  // Archives (compression ratios vary wildly; use neutral estimate)
  zip: 0.85,
  gz: 0.70,
  "7z": 0.55,
  tar: 0.95,
  // Vector
  svg: 0.65,
  eps: 0.90,
};

/**
 * Returns a rough pre-conversion size estimate string (e.g. "~240 KB") for idle items.
 * For image files, uses the canvas-based estimateOutputSize() utility.
 * For other file types, applies heuristic multipliers.
 */
export function useSizeEstimate(item: BatchItem): string | null {
  const [estimate, setEstimate] = useState<string | null>(null);

  useEffect(() => {
    // Only estimate for idle items that haven't been converted yet
    if (item.status !== "idle" || item.outputSize !== null) {
      setEstimate(null);
      return;
    }

    let cancelled = false;

    async function compute() {
      if (item.category === "images") {
        // Use canvas to read actual dimensions then apply format estimate
        try {
          const url = URL.createObjectURL(item.file);
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("load failed"));
            img.src = url;
          });
          URL.revokeObjectURL(url);

          if (cancelled) return;

          const bytes = estimateOutputSize(
            img.naturalWidth,
            img.naturalHeight,
            item.targetFormat as ImageFormat
          );
          setEstimate(`~${formatFileSize(bytes)}`);
        } catch {
          // Ignore if we can't load the image
          setEstimate(null);
        }
      } else {
        // Non-image: use a ratio multiplier
        const ratio = FORMAT_SIZE_RATIO[item.targetFormat] ?? 0.8;
        const bytes = Math.round(item.size * ratio);
        setEstimate(`~${formatFileSize(bytes)}`);
      }
    }

    compute();
    return () => { cancelled = true; };
  }, [item.file, item.category, item.targetFormat, item.status, item.size, item.outputSize]);

  return estimate;
}
