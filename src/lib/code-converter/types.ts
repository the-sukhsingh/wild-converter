import type { CodeFormat } from "../code-format-utils";

export interface CodeMetadata {
  lineCount: number;
  charCount: number;
  wordCount: number;
  detectedLanguage: string;
  fileSizeBytes: number;
  name: string;
  format: CodeFormat | "unknown";
  rawCode: string;
  snippet: string;
}

export interface CodeConversionOptions {
  format: CodeFormat;
  indentation: 2 | 4 | "tab";
  minify: boolean;
  stripComments: boolean;
  addLineNumbers: boolean;
}

export interface CodeConversionResult {
  blob: Blob;
  mime: string;
  fileName: string;
  url: string;
  formattedCode: string;
  lineCount: number;
  fileSizeBytes: number;
}
