export type DocumentFormat =
  | "doc"
  | "docx"
  | "pdf"
  | "txt"
  | "rtf"
  | "html"
  | "htm"
  | "md"
  | "markdown"
  | "odt"
  | "org"
  | "rst"
  | "tex"
  | "wp"
  | "wps"
  | "xls"
  | "xlsx"
  | "csv"
  | "ods"
  | "odp"
  | "ppt"
  | "pptx";

export type DocumentCategory = "word-text" | "spreadsheet" | "presentation" | "markup";

export interface DocumentFormatMeta {
  id: DocumentFormat;
  label: string;
  ext: string;
  mime: string;
  category: DocumentCategory;
  canOutput: boolean;
  isSpreadsheet?: boolean;
  isPresentation?: boolean;
  isMarkup?: boolean;
  description: string;
}

export const DOCUMENT_FORMAT_META: Record<DocumentFormat, DocumentFormatMeta> = {
  // Word & Rich Text Documents
  pdf: {
    id: "pdf",
    label: "PDF",
    ext: "pdf",
    mime: "application/pdf",
    category: "word-text",
    canOutput: true,
    description: "Adobe Portable Document Format. Universal publishing layout.",
  },
  docx: {
    id: "docx",
    label: "DOCX",
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    category: "word-text",
    canOutput: true,
    description: "Microsoft Word OpenXML Document with full rich styling.",
  },
  doc: {
    id: "doc",
    label: "DOC",
    ext: "doc",
    mime: "application/msword",
    category: "word-text",
    canOutput: false, // Legacy format: input parsing supported, modern output targets DOCX/PDF
    description: "Legacy Microsoft Word 97-2004 Document.",
  },
  odt: {
    id: "odt",
    label: "ODT",
    ext: "odt",
    mime: "application/vnd.oasis.opendocument.text",
    category: "word-text",
    canOutput: true,
    description: "OpenDocument Text standard for LibreOffice & OpenOffice.",
  },
  rtf: {
    id: "rtf",
    label: "RTF",
    ext: "rtf",
    mime: "application/rtf",
    category: "word-text",
    canOutput: true,
    description: "Rich Text Format with styled typography and formatting.",
  },
  txt: {
    id: "txt",
    label: "TXT",
    ext: "txt",
    mime: "text/plain",
    category: "word-text",
    canOutput: true,
    description: "Clean UTF-8 unformatted plain text.",
  },
  wp: {
    id: "wp",
    label: "WP",
    ext: "wp",
    mime: "application/wordperfect",
    category: "word-text",
    canOutput: false,
    description: "Corel WordPerfect Document.",
  },
  wps: {
    id: "wps",
    label: "WPS",
    ext: "wps",
    mime: "application/vnd.ms-works",
    category: "word-text",
    canOutput: false,
    description: "WPS Office / Microsoft Works Document.",
  },

  // Markup & Code Docs
  md: {
    id: "md",
    label: "MD",
    ext: "md",
    mime: "text/markdown",
    category: "markup",
    canOutput: true,
    isMarkup: true,
    description: "GitHub Flavored Markdown with headings, tables, and code.",
  },
  markdown: {
    id: "markdown",
    label: "MARKDOWN",
    ext: "markdown",
    mime: "text/markdown",
    category: "markup",
    canOutput: true,
    isMarkup: true,
    description: "Standard Markdown format.",
  },
  html: {
    id: "html",
    label: "HTML",
    ext: "html",
    mime: "text/html",
    category: "markup",
    canOutput: true,
    isMarkup: true,
    description: "Standalone HTML5 document with responsive typography.",
  },
  htm: {
    id: "htm",
    label: "HTM",
    ext: "htm",
    mime: "text/html",
    category: "markup",
    canOutput: true,
    isMarkup: true,
    description: "Standard HTM Web Document.",
  },
  tex: {
    id: "tex",
    label: "LaTeX (TEX)",
    ext: "tex",
    mime: "application/x-tex",
    category: "markup",
    canOutput: true,
    isMarkup: true,
    description: "LaTeX Scientific and Academic Document Source.",
  },
  rst: {
    id: "rst",
    label: "RST",
    ext: "rst",
    mime: "text/x-rst",
    category: "markup",
    canOutput: true,
    isMarkup: true,
    description: "reStructuredText documentation format.",
  },
  org: {
    id: "org",
    label: "ORG",
    ext: "org",
    mime: "text/org",
    category: "markup",
    canOutput: true,
    isMarkup: true,
    description: "Emacs Org-Mode structured document and notes format.",
  },

  // Spreadsheets & Data
  xlsx: {
    id: "xlsx",
    label: "XLSX",
    ext: "xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    category: "spreadsheet",
    canOutput: true,
    isSpreadsheet: true,
    description: "Microsoft Excel OpenXML Workbook.",
  },
  xls: {
    id: "xls",
    label: "XLS",
    ext: "xls",
    mime: "application/vnd.ms-excel",
    category: "spreadsheet",
    canOutput: true,
    isSpreadsheet: true,
    description: "Microsoft Excel 97-2004 Workbook.",
  },
  csv: {
    id: "csv",
    label: "CSV",
    ext: "csv",
    mime: "text/csv",
    category: "spreadsheet",
    canOutput: true,
    isSpreadsheet: true,
    description: "Comma-Separated Values tabular data.",
  },
  ods: {
    id: "ods",
    label: "ODS",
    ext: "ods",
    mime: "application/vnd.oasis.opendocument.spreadsheet",
    category: "spreadsheet",
    canOutput: true,
    isSpreadsheet: true,
    description: "OpenDocument Spreadsheet for LibreOffice & Excel.",
  },

  // Presentations
  pptx: {
    id: "pptx",
    label: "PPTX",
    ext: "pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    category: "presentation",
    canOutput: true,
    isPresentation: true,
    description: "Microsoft PowerPoint OpenXML Presentation deck.",
  },
  ppt: {
    id: "ppt",
    label: "PPT",
    ext: "ppt",
    mime: "application/vnd.ms-powerpoint",
    category: "presentation",
    canOutput: false,
    isPresentation: true,
    description: "Legacy Microsoft PowerPoint 97-2004 Presentation.",
  },
  odp: {
    id: "odp",
    label: "ODP",
    ext: "odp",
    mime: "application/vnd.oasis.opendocument.presentation",
    category: "presentation",
    canOutput: true,
    isPresentation: true,
    description: "OpenDocument Presentation standard.",
  },
};

export const ALL_DOCUMENT_FORMATS = Object.values(DOCUMENT_FORMAT_META);

export const OUTPUT_DOCUMENT_FORMATS = ALL_DOCUMENT_FORMATS.filter((f) => f.canOutput);

export const DOCUMENT_FILTER_CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All Formats" },
  { id: "word-text", label: "Word & PDF" },
  { id: "markup", label: "Markup & Web" },
  { id: "spreadsheet", label: "Spreadsheets" },
  { id: "presentation", label: "Presentations" },
];

/** Detect document format from file */
export function detectDocumentFormat(file: File): DocumentFormat | null {
  const mime = file.type.toLowerCase();
  const byMime = ALL_DOCUMENT_FORMATS.find((f) => f.mime === mime);
  if (byMime) return byMime.id;

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext) return null;

  const byExt = ALL_DOCUMENT_FORMATS.find(
    (f) => f.ext === ext || f.id === ext
  );
  return byExt?.id ?? null;
}

/** Check whether a file is a document or an image */
export function detectFileMainCategory(file: File): "image" | "document" | "other" {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  const docExts = new Set([
    "doc", "docx", "pdf", "txt", "rtf", "html", "htm", "md", "markdown",
    "odt", "org", "rst", "tex", "wp", "wps", "xls", "xlsx", "csv", "ods",
    "odp", "ppt", "pptx"
  ]);

  if (
    docExts.has(ext) ||
    file.type.startsWith("text/") ||
    file.type.includes("pdf") ||
    file.type.includes("document") ||
    file.type.includes("sheet") ||
    file.type.includes("presentation") ||
    file.type.includes("opendocument")
  ) {
    return "document";
  }

  const imgExts = new Set([
    "jpeg", "jpg", "png", "webp", "avif", "gif", "svg", "bmp", "tiff", "tif",
    "ico", "tga", "heic", "heif"
  ]);

  if (imgExts.has(ext) || file.type.startsWith("image/")) {
    return "image";
  }

  return "other";
}

/** Build converted output file name */
export function buildDocumentOutputName(inputName: string, targetFormat: DocumentFormat): string {
  const base = inputName.replace(/\.[^.]+$/, "");
  const ext = DOCUMENT_FORMAT_META[targetFormat]?.ext || "txt";
  return `${base}.${ext}`;
}

/** Format file size in human-readable notation */
export function formatDocumentSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Fast estimate of output size for documents */
export function estimateDocumentOutputSize(
  inputSize: number,
  targetFormat: DocumentFormat
): number {
  switch (targetFormat) {
    case "pdf":
      return Math.max(1024, Math.round(inputSize * 1.4) + 2048);
    case "docx":
      return Math.max(2048, Math.round(inputSize * 1.2) + 4096);
    case "odt":
    case "ods":
    case "odp":
    case "pptx":
    case "xlsx":
      return Math.max(2048, Math.round(inputSize * 1.1) + 3000);
    case "txt":
      return Math.max(100, Math.round(inputSize * 0.5));
    case "md":
    case "markdown":
    case "rst":
    case "org":
      return Math.max(200, Math.round(inputSize * 0.65));
    case "html":
    case "htm":
    case "rtf":
    case "tex":
      return Math.max(500, Math.round(inputSize * 0.9) + 800);
    case "csv":
      return Math.max(100, Math.round(inputSize * 0.6));
    default:
      return inputSize;
  }
}
