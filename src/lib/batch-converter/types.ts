import type { ImageFormat } from "@/lib/format-utils";
import type { ConversionOptions as ImageOptions } from "@/lib/image-converter";
import type { DocumentFormat } from "@/lib/document-format-utils";
import type { DocumentConversionOptions } from "@/lib/document-converter";
import type { AudioFormat } from "@/lib/audio-format-utils";
import type { AudioConversionOptions } from "@/lib/audio-converter";
import type { VideoFormat } from "@/lib/video-format-utils";
import type { VideoConversionOptions } from "@/lib/video-converter";
import type { VectorFormat } from "@/lib/vector-format-utils";
import type { VectorConversionOptions } from "@/lib/vector-converter";
import type { ThreeDFormat } from "@/lib/three-d-format-utils";
import type { ThreeDConversionOptions } from "@/lib/three-d-converter";
import type { FontFormat } from "@/lib/font-format-utils";
import type { FontConversionOptions } from "@/lib/font-converter";
import type { ArchiveFormat } from "@/lib/archive-format-utils";
import type { ArchiveConversionOptions } from "@/lib/archive-converter";

export type ConverterCategory =
  | "images"
  | "documents"
  | "audio"
  | "video"
  | "vector"
  | "3d"
  | "fonts"
  | "archive";

export type BatchItemStatus = "idle" | "converting" | "done" | "error" | "cancelled";

export type AnyFormat =
  | ImageFormat
  | DocumentFormat
  | AudioFormat
  | VideoFormat
  | VectorFormat
  | ThreeDFormat
  | FontFormat
  | ArchiveFormat
  | string;

export type AnyConversionOptions =
  | ImageOptions
  | DocumentConversionOptions
  | AudioConversionOptions
  | VideoConversionOptions
  | VectorConversionOptions
  | ThreeDConversionOptions
  | FontConversionOptions
  | ArchiveConversionOptions
  | Record<string, any>;

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  size: number;
  category: ConverterCategory;
  detectedInputFormat: string | null;
  targetFormat: string;
  options: AnyConversionOptions;
  status: BatchItemStatus;
  progress: number;
  statusText: string;
  resultBlob: Blob | null;
  resultUrl: string | null;
  outputName: string;
  outputSize: number | null;
  error: string | null;
  thumbnailUrl?: string | null;
  durationMs?: number;
}

export interface ImageToPdfItem {
  id: string;
  file: File;
  thumbnailUrl: string;
  rotation: number; // 0, 90, 180, 270
  width: number;
  height: number;
  name: string;
  size: number;
}

export interface ImageToPdfConfig {
  mergeMode: "single-pdf" | "separate-pdfs";
  pageSize: "fit" | "a4" | "letter" | "legal" | "a3" | "a5";
  orientation: "auto" | "portrait" | "landscape";
  margins: "none" | "compact" | "normal" | "wide";
  quality: "lossless" | "high" | "medium" | "low";
  includePageNumbers: boolean;
  title: string;
}

export interface PdfToImageConfig {
  targetFormat: "png" | "jpeg" | "webp" | "avif";
  scale: number; // 1, 1.5, 2, 3, 4 (DPI multipliers: 72, 110, 150, 220, 300)
  quality: number; // 0.1 to 1.0 for lossy formats
  pageRange: "all" | "first" | "custom";
  customRange: string; // e.g. "1-3, 5, 7"
  background: "white" | "transparent" | "black";
}

export interface PdfRenderedPage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  name: string;
}

export interface BatchSummary {
  total: number;
  pending: number;
  converting: number;
  done: number;
  error: number;
  totalInputBytes: number;
  totalOutputBytes: number;
  savedBytes: number;
  savedPercent: number;
}
