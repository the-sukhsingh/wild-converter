import {
  type DocumentFormat,
  DOCUMENT_FORMAT_META,
  buildDocumentOutputName,
} from "../document-format-utils";
import type {
  DocumentIR,
  DocumentConversionOptions,
  DocumentConversionResult,
} from "./types";
import { parseDocument } from "./parsers";
import { generatePdf } from "./generators/pdf-generator";
import { generateDocx } from "./generators/docx-generator";
import { generateSpreadsheet } from "./generators/spreadsheet-generator";
import { generateMarkup } from "./generators/markup-generator";
import { generatePresentation } from "./generators/presentation-generator";
import { generateText } from "./generators/text-generator";

export * from "./types";
export { parseDocument, parseDocument as probeDocument } from "./parsers";

/**
 * Universal client-side document conversion pipeline
 */
export async function convertDocument(
  file: File,
  targetFormat: DocumentFormat,
  options: DocumentConversionOptions = {},
  onProgress?: (progress: number, text: string) => void
): Promise<DocumentConversionResult> {
  const meta = DOCUMENT_FORMAT_META[targetFormat];
  if (!meta) {
    throw new Error(`Unsupported document format: ${targetFormat}`);
  }

  onProgress?.(15, `Parsing ${file.name} structure...`);
  // 1. Parse input file into Document Intermediate Representation (IR)
  const docIR: DocumentIR = await parseDocument(file, targetFormat);

  onProgress?.(50, `Compiling document into ${meta.label.split(" ")[0]}...`);
  // 2. Generate target format output blob
  let blob: Blob;

  switch (targetFormat) {
    case "pdf":
      blob = await generatePdf(docIR, options);
      break;

    case "docx":
    case "doc":
    case "wp":
    case "wps":
      blob = await generateDocx(docIR, options);
      break;

    case "xlsx":
    case "xls":
    case "csv":
    case "ods":
      blob = await generateSpreadsheet(docIR, targetFormat, options);
      break;

    case "pptx":
    case "ppt":
    case "odp":
      blob = await generatePresentation(
        docIR,
        targetFormat === "odp" ? "odp" : "pptx",
        options
      );
      break;

    case "html":
    case "htm":
    case "md":
    case "markdown":
    case "tex":
    case "rst":
    case "org":
      blob = await generateMarkup(docIR, targetFormat, options);
      break;

    case "txt":
    case "rtf":
    default:
      blob = generateText(docIR, options);
      break;
  }

  onProgress?.(90, "Finalizing document payload...");
  const fileName = buildDocumentOutputName(file.name, targetFormat);
  onProgress?.(100, "Done");

  return {
    blob,
    mime: meta.mime,
    fileName,
    textPreview: docIR.rawText.slice(0, 500),
    htmlPreview: docIR.html.slice(0, 1000),
    metadata: docIR.metadata,
  };
}
