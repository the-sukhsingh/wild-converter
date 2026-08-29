import type { DocumentFormat } from "../../document-format-utils";
import type { DocumentIR } from "../types";
import { parseMarkupDocument } from "./markup-parser";
import { parseDocxDocument } from "./docx-parser";
import { parseSpreadsheetDocument } from "./spreadsheet-parser";
import { parsePdfDocument } from "./pdf-parser";
import { parsePresentationDocument } from "./presentation-parser";
import { parseLegacyDocument } from "./legacy-parser";
import { parseImageDocument } from "./image-parser";

/**
 * Universal client-side document parser converting any supported format into DocumentIR
 */
export async function parseDocument(
  file: File,
  detectedFormat: DocumentFormat | null = null
): Promise<DocumentIR> {
  const ext = (file.name.split(".").pop()?.toLowerCase() || detectedFormat || "txt") as string;

  switch (ext) {
    case "docx":
      return parseDocxDocument(file);

    case "pdf":
      return parsePdfDocument(file);

    case "xlsx":
    case "xls":
    case "csv":
    case "ods":
      return parseSpreadsheetDocument(file);

    case "pptx":
    case "ppt":
    case "odp":
      return parsePresentationDocument(file, ext);

    case "doc":
    case "wp":
    case "wps":
      return parseLegacyDocument(file, ext);

    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
    case "gif":
    case "bmp":
    case "svg":
    case "tiff":
    case "tif":
    case "avif":
    case "heic":
    case "heif":
    case "ico":
    case "tga":
      return parseImageDocument(file, ext);

    case "md":
    case "markdown":
    case "html":
    case "htm":
    case "rtf":
    case "tex":
    case "rst":
    case "org":
    case "txt":
    default:
      return parseMarkupDocument(file, ext);
  }
}
