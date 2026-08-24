export type FontFormat =
  | "ttf"
  | "otf"
  | "woff"
  | "woff2"
  | "eot"
  | "svg"
  // Lossless / Master variants (-ls)
  | "ttf-ls"
  | "otf-ls"
  | "woff-ls"
  | "woff2-ls"
  | "eot-ls"
  | "svg-ls";

export interface FontFormatInfo {
  id: FontFormat;
  label: string;
  extension: string;
  mimeType: string;
  category: "web" | "desktop" | "legacy";
  description: string;
  supportsHinting: boolean;
  isLossless?: boolean;
}

export const FONT_FORMATS: Record<FontFormat, FontFormatInfo> = {
  woff2: {
    id: "woff2",
    label: "WOFF2 (Web Open Font 2)",
    extension: "woff2",
    mimeType: "font/woff2",
    category: "web",
    description: "Modern web font standard with Brotli compression (~30% smaller than WOFF)",
    supportsHinting: true,
    isLossless: true,
  },
  woff: {
    id: "woff",
    label: "WOFF (Web Open Font)",
    extension: "woff",
    mimeType: "font/woff",
    category: "web",
    description: "Universal web font standard with zlib compression for all browsers",
    supportsHinting: true,
    isLossless: true,
  },
  ttf: {
    id: "ttf",
    label: "TTF (TrueType Font)",
    extension: "ttf",
    mimeType: "font/ttf",
    category: "desktop",
    description: "Universal desktop font standard developed by Apple and Microsoft",
    supportsHinting: true,
    isLossless: true,
  },
  otf: {
    id: "otf",
    label: "OTF (OpenType Font)",
    extension: "otf",
    mimeType: "font/otf",
    category: "desktop",
    description: "PostScript CFF typography standard with advanced typographic features",
    supportsHinting: true,
    isLossless: true,
  },
  eot: {
    id: "eot",
    label: "EOT (Embedded OpenType)",
    extension: "eot",
    mimeType: "application/vnd.ms-fontobject",
    category: "legacy",
    description: "Microsoft Internet Explorer embedded font container",
    supportsHinting: true,
  },
  svg: {
    id: "svg",
    label: "SVG Font",
    extension: "svg",
    mimeType: "image/svg+xml",
    category: "legacy",
    description: "Vector glyph font container using SVG path definitions",
    supportsHinting: false,
    isLossless: true,
  },

  // Lossless presets (-ls)
  "woff2-ls": {
    id: "woff2-ls",
    label: "WOFF2 Maximum Compression",
    extension: "woff2",
    mimeType: "font/woff2",
    category: "web",
    description: "WOFF2 with full OpenType feature tables preserved",
    supportsHinting: true,
    isLossless: true,
  },
  "woff-ls": {
    id: "woff-ls",
    label: "WOFF Master Archive",
    extension: "woff",
    mimeType: "font/woff",
    category: "web",
    description: "Uncompromised WOFF web container",
    supportsHinting: true,
    isLossless: true,
  },
  "ttf-ls": {
    id: "ttf-ls",
    label: "TTF Studio Master",
    extension: "ttf",
    mimeType: "font/ttf",
    category: "desktop",
    description: "High-precision TrueType curves and kerning pairs",
    supportsHinting: true,
    isLossless: true,
  },
  "otf-ls": {
    id: "otf-ls",
    label: "OTF CFF Master",
    extension: "otf",
    mimeType: "font/otf",
    category: "desktop",
    description: "PostScript CFF outline table with complete character mappings",
    supportsHinting: true,
    isLossless: true,
  },
  "eot-ls": {
    id: "eot-ls",
    label: "EOT Master Microtype",
    extension: "eot",
    mimeType: "application/vnd.ms-fontobject",
    category: "legacy",
    description: "Full precision Embedded OpenType wrapper",
    supportsHinting: true,
  },
  "svg-ls": {
    id: "svg-ls",
    label: "SVG Font Master XML",
    extension: "svg",
    mimeType: "image/svg+xml",
    category: "legacy",
    description: "Precise SVG font glyph vector coordinate table",
    supportsHinting: false,
    isLossless: true,
  },
};

export const FONT_EXTENSIONS: Record<string, FontFormat> = {
  ttf: "ttf",
  otf: "otf",
  woff: "woff",
  woff2: "woff2",
  eot: "eot",
  svg: "svg",
  ttc: "ttf",
  dfont: "ttf",
};

export function detectFontFormat(file: File): FontFormat | null {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  if (FONT_EXTENSIONS[ext]) {
    return FONT_EXTENSIONS[ext];
  }

  const type = file.type.toLowerCase();
  if (type.includes("font/woff2")) return "woff2";
  if (type.includes("font/woff")) return "woff";
  if (type.includes("font/ttf") || type.includes("font/truetype")) return "ttf";
  if (type.includes("font/otf") || type.includes("font/opentype")) return "otf";
  if (type.includes("ms-fontobject")) return "eot";

  return null;
}

export function isFontFile(file: File): boolean {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  return Boolean(FONT_EXTENSIONS[ext]);
}
