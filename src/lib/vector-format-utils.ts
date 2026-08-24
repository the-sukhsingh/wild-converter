export type VectorFormat =
  | "svg"
  | "eps"
  | "ai"
  | "pdf"
  | "dxf"
  | "dwg"
  | "ps"
  | "wmf"
  | "emf"
  | "cdr"
  | "png"
  | "webp"
  | "jpeg"
  // Lossless / Master variants (-ls)
  | "svg-ls"
  | "eps-ls"
  | "ai-ls"
  | "cdr-ls"
  | "pdf-ls"
  | "dxf-ls"
  | "dwg-ls"
  | "wmf-ls"
  | "emf-ls"
  | "ps-ls";

export interface VectorFormatInfo {
  id: VectorFormat;
  label: string;
  extension: string;
  mimeType: string;
  category: "vector" | "cad" | "publish" | "rasterize";
  description: string;
  supportsDpi: boolean;
  supportsScale: boolean;
  isLossless?: boolean;
}

export const VECTOR_FORMATS: Record<VectorFormat, VectorFormatInfo> = {
  svg: {
    id: "svg",
    label: "SVG (Scalable Vector)",
    extension: "svg",
    mimeType: "image/svg+xml",
    category: "vector",
    description: "W3C standard XML-based 2D scalable vector graphic",
    supportsDpi: false,
    supportsScale: true,
    isLossless: true,
  },
  eps: {
    id: "eps",
    label: "EPS (Encapsulated PostScript)",
    extension: "eps",
    mimeType: "application/postscript",
    category: "publish",
    description: "Industry standard print and prepress vector illustration format",
    supportsDpi: true,
    supportsScale: true,
    isLossless: true,
  },
  ai: {
    id: "ai",
    label: "AI (Adobe Illustrator)",
    extension: "ai",
    mimeType: "application/illustrator",
    category: "publish",
    description: "Adobe Illustrator artwork vector container",
    supportsDpi: true,
    supportsScale: true,
    isLossless: true,
  },
  pdf: {
    id: "pdf",
    label: "PDF Vector",
    extension: "pdf",
    mimeType: "application/pdf",
    category: "publish",
    description: "Portable Document Format with infinite vector scaling",
    supportsDpi: true,
    supportsScale: true,
    isLossless: true,
  },
  dxf: {
    id: "dxf",
    label: "DXF (AutoCAD Drawing)",
    extension: "dxf",
    mimeType: "application/dxf",
    category: "cad",
    description: "AutoCAD Drawing Exchange Format for CNC, laser cutters and CAD",
    supportsDpi: false,
    supportsScale: true,
    isLossless: true,
  },
  dwg: {
    id: "dwg",
    label: "DWG (CAD Drawing)",
    extension: "dwg",
    mimeType: "application/acad",
    category: "cad",
    description: "AutoCAD standard binary drawing vector format",
    supportsDpi: false,
    supportsScale: true,
    isLossless: true,
  },
  ps: {
    id: "ps",
    label: "PS (PostScript)",
    extension: "ps",
    mimeType: "application/postscript",
    category: "publish",
    description: "Adobe PostScript page description language",
    supportsDpi: true,
    supportsScale: true,
    isLossless: true,
  },
  wmf: {
    id: "wmf",
    label: "WMF (Windows Metafile)",
    extension: "wmf",
    mimeType: "image/wmf",
    category: "vector",
    description: "Microsoft Windows vector and bitmap metafile",
    supportsDpi: true,
    supportsScale: true,
  },
  emf: {
    id: "emf",
    label: "EMF (Enhanced Metafile)",
    extension: "emf",
    mimeType: "image/emf",
    category: "vector",
    description: "Enhanced 32-bit Windows Metafile vector format",
    supportsDpi: true,
    supportsScale: true,
  },
  cdr: {
    id: "cdr",
    label: "CDR (CorelDRAW)",
    extension: "cdr",
    mimeType: "application/coreldraw",
    category: "publish",
    description: "CorelDRAW vector graphics drawing container",
    supportsDpi: true,
    supportsScale: true,
    isLossless: true,
  },
  png: {
    id: "png",
    label: "PNG (Rasterized High-DPI)",
    extension: "png",
    mimeType: "image/png",
    category: "rasterize",
    description: "Rasterize vector to crisp transparent PNG up to 600 DPI",
    supportsDpi: true,
    supportsScale: true,
  },
  webp: {
    id: "webp",
    label: "WebP (Rasterized)",
    extension: "webp",
    mimeType: "image/webp",
    category: "rasterize",
    description: "Rasterize vector to ultra-compact WebP bitmap",
    supportsDpi: true,
    supportsScale: true,
  },
  jpeg: {
    id: "jpeg",
    label: "JPEG (Rasterized)",
    extension: "jpg",
    mimeType: "image/jpeg",
    category: "rasterize",
    description: "Rasterize vector to high quality JPEG with background fill",
    supportsDpi: true,
    supportsScale: true,
  },

  // Lossless presets (-ls)
  "svg-ls": {
    id: "svg-ls",
    label: "SVG Cleaned & Minified",
    extension: "svg",
    mimeType: "image/svg+xml",
    category: "vector",
    description: "Lossless SVG with optimized coordinates and stripped metadata",
    supportsDpi: false,
    supportsScale: true,
    isLossless: true,
  },
  "eps-ls": {
    id: "eps-ls",
    label: "EPS Prepress Master (300 DPI)",
    extension: "eps",
    mimeType: "application/postscript",
    category: "publish",
    description: "High-precision PostScript 3.0 vector EPS",
    supportsDpi: true,
    supportsScale: true,
    isLossless: true,
  },
  "ai-ls": {
    id: "ai-ls",
    label: "AI Master Vector",
    extension: "ai",
    mimeType: "application/illustrator",
    category: "publish",
    description: "Lossless Adobe Illustrator vector container",
    supportsDpi: true,
    supportsScale: true,
    isLossless: true,
  },
  "cdr-ls": {
    id: "cdr-ls",
    label: "CDR Master Vector",
    extension: "cdr",
    mimeType: "application/coreldraw",
    category: "publish",
    description: "CorelDRAW lossless vector artwork",
    supportsDpi: true,
    supportsScale: true,
    isLossless: true,
  },
  "pdf-ls": {
    id: "pdf-ls",
    label: "PDF/X-1a Print Ready Vector",
    extension: "pdf",
    mimeType: "application/pdf",
    category: "publish",
    description: "ISO standardized PDF vector artwork",
    supportsDpi: true,
    supportsScale: true,
    isLossless: true,
  },
  "dxf-ls": {
    id: "dxf-ls",
    label: "DXF R2000 Precision CAD",
    extension: "dxf",
    mimeType: "application/dxf",
    category: "cad",
    description: "AutoCAD 2000 64-bit precision vector geometry",
    supportsDpi: false,
    supportsScale: true,
    isLossless: true,
  },
  "dwg-ls": {
    id: "dwg-ls",
    label: "DWG Master Precision",
    extension: "dwg",
    mimeType: "application/acad",
    category: "cad",
    description: "AutoCAD binary CAD master drawing",
    supportsDpi: false,
    supportsScale: true,
    isLossless: true,
  },
  "wmf-ls": {
    id: "wmf-ls",
    label: "WMF Master Metafile",
    extension: "wmf",
    mimeType: "image/wmf",
    category: "vector",
    description: "Windows Metafile with high precision vector coordinates",
    supportsDpi: true,
    supportsScale: true,
  },
  "emf-ls": {
    id: "emf-ls",
    label: "EMF+ Dual Metafile",
    extension: "emf",
    mimeType: "image/emf",
    category: "vector",
    description: "GDI+ enhanced vector metafile",
    supportsDpi: true,
    supportsScale: true,
  },
  "ps-ls": {
    id: "ps-ls",
    label: "PS Level 3 Master",
    extension: "ps",
    mimeType: "application/postscript",
    category: "publish",
    description: "PostScript Level 3 full specification master output",
    supportsDpi: true,
    supportsScale: true,
    isLossless: true,
  },
};

export const VECTOR_EXTENSIONS: Record<string, VectorFormat> = {
  svg: "svg",
  svgz: "svg",
  eps: "eps",
  ai: "ai",
  pdf: "pdf",
  dxf: "dxf",
  dwg: "dwg",
  ps: "ps",
  wmf: "wmf",
  emf: "emf",
  cdr: "cdr",
};

export function detectVectorFormat(file: File): VectorFormat | null {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  if (VECTOR_EXTENSIONS[ext]) {
    return VECTOR_EXTENSIONS[ext];
  }

  const type = file.type.toLowerCase();
  if (type.includes("image/svg")) return "svg";
  if (type.includes("application/postscript")) return "eps";
  if (type.includes("application/pdf")) return "pdf";
  if (type.includes("application/dxf")) return "dxf";

  return null;
}

export function isVectorFile(file: File): boolean {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  if (VECTOR_EXTENSIONS[ext]) return true;
  return file.type.includes("image/svg") || file.type.includes("application/postscript");
}
