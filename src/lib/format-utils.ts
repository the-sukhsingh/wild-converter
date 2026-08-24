export type ImageFormat =
  | "jpeg"
  | "jpg"
  | "png"
  | "webp"
  | "avif"
  | "gif"
  | "svg"
  | "bmp"
  | "tiff"
  | "ico"
  | "tga"
  | "heic"
  | "heif"
  // Lossless variants
  | "jpeg-ls"
  | "png-ls"
  | "webp-ls"
  | "gif-ls"
  | "svg-ls"
  | "bmp-ls"
  | "tiff-ls"
  | "heic-ls"
  | "heif-ls"
  | "avif-ls";

export type FormatCategory = "popular" | "modern" | "lossless" | "icon" | "legacy";

export interface FormatMeta {
  id: ImageFormat;
  label: string;
  ext: string;
  mime: string;
  baseFormat: string;
  category: FormatCategory;
  lossy: boolean;
  supportsQuality: boolean;
  supportsAlpha: boolean;
  canOutput: boolean;
  description: string;
}

export const FORMAT_META: Record<ImageFormat, FormatMeta> = {
  // Popular / Standard
  webp: {
    id: "webp",
    label: "WebP",
    ext: "webp",
    mime: "image/webp",
    baseFormat: "webp",
    category: "popular",
    lossy: true,
    supportsQuality: true,
    supportsAlpha: true,
    canOutput: true,
    description: "Modern web standard. 30% smaller than JPEG.",
  },
  png: {
    id: "png",
    label: "PNG",
    ext: "png",
    mime: "image/png",
    baseFormat: "png",
    category: "popular",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "Lossless with full alpha transparency.",
  },
  jpeg: {
    id: "jpeg",
    label: "JPEG",
    ext: "jpg",
    mime: "image/jpeg",
    baseFormat: "jpeg",
    category: "popular",
    lossy: true,
    supportsQuality: true,
    supportsAlpha: false,
    canOutput: true,
    description: "Universal photographic compression.",
  },
  jpg: {
    id: "jpg",
    label: "JPG",
    ext: "jpg",
    mime: "image/jpeg",
    baseFormat: "jpeg",
    category: "popular",
    lossy: true,
    supportsQuality: true,
    supportsAlpha: false,
    canOutput: true,
    description: "Standard JPG format.",
  },
  avif: {
    id: "avif",
    label: "AVIF",
    ext: "avif",
    mime: "image/avif",
    baseFormat: "avif",
    category: "modern",
    lossy: true,
    supportsQuality: true,
    supportsAlpha: true,
    canOutput: true,
    description: "Next-gen AV1 compression. Ultra high efficiency.",
  },
  gif: {
    id: "gif",
    label: "GIF",
    ext: "gif",
    mime: "image/gif",
    baseFormat: "gif",
    category: "popular",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "8-bit indexed palette format.",
  },
  svg: {
    id: "svg",
    label: "SVG",
    ext: "svg",
    mime: "image/svg+xml",
    baseFormat: "svg",
    category: "modern",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "Scalable vector graphics container.",
  },
  tiff: {
    id: "tiff",
    label: "TIFF",
    ext: "tif",
    mime: "image/tiff",
    baseFormat: "tiff",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "Standard 6.0 archival publishing format.",
  },
  bmp: {
    id: "bmp",
    label: "BMP",
    ext: "bmp",
    mime: "image/bmp",
    baseFormat: "bmp",
    category: "legacy",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: false,
    canOutput: true,
    description: "Uncompressed Windows bitmap format.",
  },
  ico: {
    id: "ico",
    label: "ICO",
    ext: "ico",
    mime: "image/x-icon",
    baseFormat: "ico",
    category: "icon",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "Windows / Favicon icon file format.",
  },
  tga: {
    id: "tga",
    label: "TGA",
    ext: "tga",
    mime: "image/x-tga",
    baseFormat: "tga",
    category: "legacy",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "Truevision TARGA gaming / texture format.",
  },
  heic: {
    id: "heic",
    label: "HEIC",
    ext: "heic",
    mime: "image/heic",
    baseFormat: "heic",
    category: "modern",
    lossy: true,
    supportsQuality: true,
    supportsAlpha: true,
    canOutput: true,
    description: "High Efficiency Image Container.",
  },
  heif: {
    id: "heif",
    label: "HEIF",
    ext: "heif",
    mime: "image/heif",
    baseFormat: "heif",
    category: "modern",
    lossy: true,
    supportsQuality: true,
    supportsAlpha: true,
    canOutput: true,
    description: "High Efficiency Image Format.",
  },

  // Lossless variants (-ls)
  "webp-ls": {
    id: "webp-ls",
    label: "WebP-LS",
    ext: "webp",
    mime: "image/webp",
    baseFormat: "webp",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "WebP Lossless mode with zero visual degradation.",
  },
  "png-ls": {
    id: "png-ls",
    label: "PNG-LS",
    ext: "png",
    mime: "image/png",
    baseFormat: "png",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "Lossless PNG with maximum bit precision.",
  },
  "avif-ls": {
    id: "avif-ls",
    label: "AVIF-LS",
    ext: "avif",
    mime: "image/avif",
    baseFormat: "avif",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "AV1 Lossless encoding profile.",
  },
  "jpeg-ls": {
    id: "jpeg-ls",
    label: "JPEG-LS",
    ext: "jpg",
    mime: "image/jpeg",
    baseFormat: "jpeg",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: false,
    canOutput: true,
    description: "JPEG Near-Lossless / 100% Quality mode.",
  },
  "tiff-ls": {
    id: "tiff-ls",
    label: "TIFF-LS",
    ext: "tif",
    mime: "image/tiff",
    baseFormat: "tiff",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "32-bit RGBA uncompressed lossless TIFF.",
  },
  "bmp-ls": {
    id: "bmp-ls",
    label: "BMP-LS",
    ext: "bmp",
    mime: "image/bmp",
    baseFormat: "bmp",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: false,
    canOutput: true,
    description: "Lossless raw RGB raster bitmap.",
  },
  "gif-ls": {
    id: "gif-ls",
    label: "GIF-LS",
    ext: "gif",
    mime: "image/gif",
    baseFormat: "gif",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "Lossless exact palette GIF.",
  },
  "svg-ls": {
    id: "svg-ls",
    label: "SVG-LS",
    ext: "svg",
    mime: "image/svg+xml",
    baseFormat: "svg",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "High-fidelity lossless vector wrapper.",
  },
  "heic-ls": {
    id: "heic-ls",
    label: "HEIC-LS",
    ext: "heic",
    mime: "image/heic",
    baseFormat: "heic",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "HEIC Lossless profile compression.",
  },
  "heif-ls": {
    id: "heif-ls",
    label: "HEIF-LS",
    ext: "heif",
    mime: "image/heif",
    baseFormat: "heif",
    category: "lossless",
    lossy: false,
    supportsQuality: false,
    supportsAlpha: true,
    canOutput: true,
    description: "HEIF Lossless profile container.",
  },
};

export const ALL_FORMATS = Object.values(FORMAT_META);

/** Formats that can be used as OUTPUT targets */
export const OUTPUT_FORMATS = ALL_FORMATS.filter((f) => f.canOutput);

/** Primary format categories for clean filtering */
export const FORMAT_FILTER_CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All Formats" },
  { id: "popular", label: "Popular" },
  { id: "modern", label: "Modern Web" },
  { id: "lossless", label: "Lossless (-ls)" },
  { id: "icon", label: "Icons / Dev" },
];

/** Given a file's MIME type or name, detect the input format */
export function detectFormat(file: File): ImageFormat | null {
  const mime = file.type.toLowerCase();
  const entry = ALL_FORMATS.find((f) => f.mime === mime);
  if (entry) return entry.id;

  // Fallback by extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  const byExt = ALL_FORMATS.find(
    (f) => f.ext === ext || f.id === ext || (ext === "jpg" && f.id === "jpeg")
  );
  return byExt?.id ?? null;
}

/** File size formatted as human-readable string */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Output file name: input name with extension replaced */
export function buildOutputName(inputName: string, targetFormat: ImageFormat): string {
  const base = inputName.replace(/\.[^.]+$/, "");
  const ext = FORMAT_META[targetFormat]?.ext || "bin";
  return `${base}.${ext}`;
}

/**
 * Fast synchronous initial estimate while the exact background probe runs.
 */
export function estimateOutputSize(
  srcW: number,
  srcH: number,
  format: ImageFormat,
  opts: { quality?: number; width?: number; height?: number; lockAspect?: boolean } = {}
): number {
  let tw = opts.width || srcW;
  let th = opts.height || srcH;
  const lock = opts.lockAspect ?? true;

  if (lock) {
    if (opts.width && !opts.height) {
      th = Math.max(1, Math.round((srcH / srcW) * tw));
    } else if (opts.height && !opts.width) {
      tw = Math.max(1, Math.round((srcW / srcH) * th));
    } else if (opts.width && opts.height) {
      const scale = Math.min(tw / srcW, th / srcH);
      tw = Math.max(1, Math.round(srcW * scale));
      th = Math.max(1, Math.round(srcH * scale));
    }
  }

  const pixels = tw * th;
  const isLossless = format.endsWith("-ls");
  const q = isLossless ? 1.0 : Math.max(0.01, Math.min(1, opts.quality ?? 0.92));

  const meta = FORMAT_META[format];
  const base = meta?.baseFormat || format;

  switch (base) {
    case "bmp":
      return pixels * 3 + 54;
    case "tiff":
      return pixels * 4 + 256;
    case "tga":
      return pixels * 3 + 18;
    case "ico":
      return Math.round(pixels * 0.5) + 22;
    case "gif":
      return Math.round(pixels * 0.7);
    case "svg":
      return Math.round(pixels * 0.65);
    case "jpeg":
      return Math.round(pixels * (0.05 + 0.15 * q));
    case "webp":
      return isLossless ? Math.round(pixels * 0.4) : Math.round(pixels * (0.03 + 0.10 * q));
    case "avif":
      return isLossless ? Math.round(pixels * 0.3) : Math.round(pixels * (0.02 + 0.07 * q));
    case "png":
      return Math.round(pixels * 0.45);
    default:
      return Math.round(pixels * 0.3);
  }
}
