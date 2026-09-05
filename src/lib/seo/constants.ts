import type { ConverterCategory } from "./types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wild-converter.vercel.app";
export const SITE_NAME = "Wild Converter";
export const OG_IMAGE_PATH = "/og-image.png";

export interface CategoryInfo {
  id: ConverterCategory;
  name: string;
  shortLabel: string;
  tagline: string;
  description: string;
  route: string;
}

export const CATEGORY_INFO: Record<ConverterCategory, CategoryInfo> = {
  images: {
    id: "images",
    name: "Image Converter",
    shortLabel: "Images",
    tagline: "Ultra-fast WebAssembly raster & modern vector image converter",
    description: "Convert PNG, JPG, WebP, AVIF, HEIC, GIF, SVG, BMP, and TIFF entirely client-side with zero data loss and maximum browser privacy.",
    route: "/images",
  },
  documents: {
    id: "documents",
    name: "Document Converter",
    shortLabel: "Documents",
    tagline: "Zero-server PDF, Word, Spreadsheet, and Text converter",
    description: "Transform PDF, DOCX, ODT, RTF, TXT, HTML, Markdown, XLSX, CSV, and PPTX right in your browser with private client-side parsing.",
    route: "/documents",
  },
  audio: {
    id: "audio",
    name: "Audio Converter",
    shortLabel: "Audio",
    tagline: "High-fidelity Web Audio DSP and PCM audio transcoding",
    description: "Encode and transcode MP3, WAV, FLAC, OGG, AAC, M4A, OPUS, and lossless audio streams without uploading audio data to any cloud.",
    route: "/audio",
  },
  video: {
    id: "video",
    name: "Video Converter",
    shortLabel: "Video",
    tagline: "Browser-native video transcoding and audio extraction",
    description: "Transcode MP4, WebM, MKV, AVI, MOV, and extract MP3/WAV audio using client-side FFmpeg WebAssembly pipelines.",
    route: "/video",
  },
  vector: {
    id: "vector",
    name: "Vector Graphics Converter",
    shortLabel: "Vectors",
    tagline: "Scalable vector graphics, CAD, and PostScript compiler",
    description: "Convert SVG, EPS, AI, PDF, DXF, DWG, and PostScript files with exact vector geometry and DPI rasterization controls.",
    route: "/vector",
  },
  "3d": {
    id: "3d",
    name: "3D Model Converter",
    shortLabel: "3D",
    tagline: "WebGL 3D geometry buffer and mesh transformation",
    description: "Convert GLB, glTF, OBJ, STL, PLY, DAE, and 3MF 3D meshes for 3D printing, WebGL, AR, and game engine pipelines.",
    route: "/3d",
  },
  fonts: {
    id: "fonts",
    name: "Font Converter",
    shortLabel: "Fonts",
    tagline: "OpenType & WOFF2 Brotli WebAssembly font compiler",
    description: "Convert TTF, OTF, WOFF, WOFF2, and EOT web typography with full unicode glyph table and hinting preservation.",
    route: "/fonts",
  },
  archive: {
    id: "archive",
    name: "Archive & Zip Tool",
    shortLabel: "Archives",
    tagline: "In-memory streaming DEFLATE and Tar compression",
    description: "Extract, repackage, and compress ZIP, TAR, GZ, 7Z, BZ2, and ISO archive bundles client-side with zero size caps.",
    route: "/archive",
  },
  code: {
    id: "code",
    name: "Code & Markup Formatter",
    shortLabel: "Code",
    tagline: "Client-side syntax AST compiler and structural converter",
    description: "Convert and reformat JSON, YAML, XML, SQL, TypeScript, JavaScript, HTML, CSS, Markdown, and source code languages securely.",
    route: "/code",
  },
};

/**
 * Top Tier-1 high-volume conversions statically generated at build time.
 * This guarantees the fastest initial crawl while keeping the build under 15 seconds.
 * Any other valid pair is incrementally generated and cached on-demand via ISR (dynamicParams = true).
 */
export const TIER1_CONVERSION_PAIRS: { from: string; to: string }[] = [
  // Images
  { from: "png", to: "jpg" },
  { from: "jpg", to: "png" },
  { from: "png", to: "webp" },
  { from: "webp", to: "png" },
  { from: "heic", to: "jpg" },
  { from: "heic", to: "png" },
  { from: "jpg", to: "webp" },
  { from: "webp", to: "jpg" },
  { from: "png", to: "svg" },
  { from: "svg", to: "png" },
  { from: "avif", to: "png" },
  { from: "png", to: "avif" },
  { from: "jpg", to: "avif" },
  { from: "png", to: "ico" },
  { from: "png", to: "pdf" },
  { from: "jpg", to: "pdf" },
  { from: "gif", to: "png" },
  { from: "png", to: "gif" },
  { from: "bmp", to: "png" },
  { from: "tiff", to: "jpg" },

  // Documents
  { from: "pdf", to: "docx" },
  { from: "docx", to: "pdf" },
  { from: "pdf", to: "txt" },
  { from: "txt", to: "pdf" },
  { from: "md", to: "html" },
  { from: "html", to: "pdf" },
  { from: "docx", to: "txt" },
  { from: "odt", to: "pdf" },
  { from: "csv", to: "xlsx" },
  { from: "xlsx", to: "csv" },
  { from: "pptx", to: "pdf" },
  { from: "pdf", to: "png" },

  // Audio
  { from: "mp4", to: "mp3" },
  { from: "wav", to: "mp3" },
  { from: "mp3", to: "wav" },
  { from: "flac", to: "mp3" },
  { from: "mp3", to: "flac" },
  { from: "m4a", to: "mp3" },
  { from: "mp3", to: "ogg" },
  { from: "ogg", to: "mp3" },
  { from: "opus", to: "mp3" },
  { from: "aac", to: "mp3" },

  // Video
  { from: "mov", to: "mp4" },
  { from: "mkv", to: "mp4" },
  { from: "avi", to: "mp4" },
  { from: "webm", to: "mp4" },
  { from: "mp4", to: "webm" },
  { from: "mp4", to: "gif" },
  { from: "mov", to: "gif" },
  { from: "flv", to: "mp4" },
  { from: "wmv", to: "mp4" },

  // Vector
  { from: "svg", to: "eps" },
  { from: "eps", to: "svg" },
  { from: "ai", to: "svg" },
  { from: "dxf", to: "svg" },
  { from: "svg", to: "pdf" },

  // 3D
  { from: "obj", to: "stl" },
  { from: "stl", to: "obj" },
  { from: "gltf", to: "glb" },
  { from: "glb", to: "gltf" },
  { from: "fbx", to: "glb" },
  { from: "stl", to: "glb" },

  // Fonts
  { from: "ttf", to: "woff2" },
  { from: "otf", to: "woff2" },
  { from: "woff2", to: "ttf" },
  { from: "ttf", to: "otf" },
  { from: "woff", to: "woff2" },

  // Archive
  { from: "tar", to: "zip" },
  { from: "gz", to: "zip" },
  { from: "7z", to: "zip" },
  { from: "zip", to: "tar" },

  // Code
  { from: "json", to: "yaml" },
  { from: "yaml", to: "json" },
  { from: "json", to: "xml" },
  { from: "xml", to: "json" },
  { from: "sql", to: "json" },
];

/** Popular single formats for format hub pre-rendering */
export const TIER1_FORMAT_HUBS: string[] = [
  "png", "jpg", "webp", "heic", "avif", "gif", "svg", "pdf", "docx",
  "xlsx", "mp3", "wav", "flac", "m4a", "mp4", "webm", "mov", "mkv",
  "obj", "stl", "glb", "ttf", "woff2", "zip", "json", "yaml"
];
