import type { ArchiveFormat } from "../archive-format-utils";

export interface ArchiveEntry {
  path: string;
  name: string;
  size: number;
  isDirectory: boolean;
}

export interface ArchiveMetadata {
  totalFiles: number;
  totalDirectories: number;
  uncompressedSize: number;
  compressedSize: number;
  compressionRatio: string;
  format: ArchiveFormat | "unknown";
  name: string;
  entries: ArchiveEntry[];
  rawFiles: Record<string, Uint8Array>;
}

export interface ArchiveConversionOptions {
  format: ArchiveFormat;
  compressionLevel: 0 | 1 | 6 | 9; // 0 = Store, 1 = Fast, 6 = Normal, 9 = Maximum
  stripRootFolder: boolean;
}

export interface ArchiveConversionResult {
  blob: Blob;
  mime: string;
  fileName: string;
  url: string;
  totalFiles: number;
  fileSizeBytes: number;
  uncompressedSize: number;
}
