import type { VectorFormat } from "../vector-format-utils";

export interface VectorMetadata {
  width: number;
  height: number;
  viewBox: string;
  pathCount: number;
  elementCount: number;
  fileSizeBytes: number;
  name: string;
  format: VectorFormat | "unknown";
  svgContent: string;
}

export interface VectorConversionOptions {
  format: VectorFormat;
  scale: 1 | 2 | 3 | 4 | 8;
  dpi: 72 | 150 | 300 | 600;
  background: "transparent" | "white" | "black";
  strokePrecision: number; // e.g. 2, 3, 4 decimal places
  optimizeSvg: boolean;
  dxfVersion: "R12" | "R2000";
}

export interface VectorConversionResult {
  blob: Blob;
  mime: string;
  fileName: string;
  url: string;
  svgPreviewText?: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}
