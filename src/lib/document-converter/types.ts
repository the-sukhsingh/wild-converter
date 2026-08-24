import type { DocumentFormat } from "../document-format-utils";

export interface DocumentTableSection {
  type: "table";
  headers: string[];
  rows: string[][];
}

export interface DocumentHeadingSection {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface DocumentParagraphSection {
  type: "paragraph";
  text: string;
  html?: string;
}

export interface DocumentListSection {
  type: "list";
  items: string[];
  ordered?: boolean;
}

export interface DocumentCodeSection {
  type: "code";
  code: string;
  lang?: string;
}

export interface DocumentBlockquoteSection {
  type: "blockquote";
  text: string;
}

export interface DocumentSlideSection {
  type: "slide";
  title: string;
  points: string[];
  notes?: string;
}

export interface DocumentDividerSection {
  type: "divider";
}

export type DocumentSection =
  | DocumentHeadingSection
  | DocumentParagraphSection
  | DocumentListSection
  | DocumentTableSection
  | DocumentCodeSection
  | DocumentBlockquoteSection
  | DocumentSlideSection
  | DocumentDividerSection;

export interface DocumentSheet {
  name: string;
  headers: string[];
  rows: (string | number | boolean | null)[][];
}

export interface DocumentMetadata {
  wordCount: number;
  lineCount: number;
  pageCount: number;
  sheetCount: number;
  author?: string;
  title?: string;
  creationDate?: string;
}

export interface DocumentIR {
  title: string;
  sections: DocumentSection[];
  sheets: DocumentSheet[];
  rawText: string;
  html: string;
  metadata: DocumentMetadata;
}

export interface DocumentConversionOptions {
  // PDF Options
  pdfPageSize?: "a4" | "letter" | "legal";
  pdfOrientation?: "portrait" | "landscape";
  pdfFontSize?: number;
  pdfMargins?: "compact" | "normal" | "wide";
  pdfPageNumbers?: boolean;
  pdfHeaderTitle?: boolean;

  // DOCX Options
  docxStylePreset?: "modern" | "minimal" | "academic";
  docxFontFamily?: "sans" | "serif" | "mono";

  // Spreadsheet / CSV Options
  csvDelimiter?: "," | ";" | "\t";
  csvIncludeHeaders?: boolean;
  sheetExportMode?: "all" | "first";

  // HTML / Markdown Options
  includeStyling?: boolean;
  headingAnchors?: boolean;

  // LaTeX Options
  latexClass?: "article" | "report" | "book";

  // Text Options
  lineWrapping?: boolean;
}

export interface DocumentConversionResult {
  blob: Blob;
  mime: string;
  fileName: string;
  textPreview: string;
  htmlPreview: string;
  metadata: DocumentMetadata;
}
