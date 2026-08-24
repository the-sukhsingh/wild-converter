import type { FontFormat } from "../font-format-utils";

export interface FontMetadata {
  familyName: string;
  styleName: string;
  designer?: string;
  version?: string;
  glyphCount: number;
  unitsPerEm: number;
  ascender: number;
  descender: number;
  fileSizeBytes: number;
  name: string;
  format: FontFormat | "unknown";
  sampleGlyphs: string[];
}

export interface FontConversionOptions {
  format: FontFormat;
  hinting: boolean;
  generateCssFace: boolean;
  customFontFamily?: string;
  subsetAsciiOnly: boolean;
}

export interface FontConversionResult {
  blob: Blob;
  mime: string;
  fileName: string;
  url: string;
  cssFontFaceCode?: string;
  glyphCount: number;
  fontFaceName: string;
  fileSizeBytes: number;
}
