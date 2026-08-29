import type { DocumentIR, DocumentSection, DocumentSheet } from "../types";

export async function parseLegacyDocument(
  file: File,
  format: string
): Promise<DocumentIR> {
  const arrayBuffer = await file.arrayBuffer();
  const title = file.name.replace(/\.[^.]+$/, "");

  const sections: DocumentSection[] = [];
  const sheets: DocumentSheet[] = [];

  // Decode binary data extracting readable strings
  const uint8 = new Uint8Array(arrayBuffer);
  let rawText = "";

  // 1. Try UTF-16LE text extraction (common in Microsoft binary DOC/PPT/XLS)
  const utf16Decoder = new TextDecoder("utf-16le", { fatal: false });
  const utf16Str = utf16Decoder.decode(uint8);
  const utf16Matches = utf16Str.match(/[\w\s.,;:!?'"()\-\n\r]{6,}/g) || [];

  // 2. Try UTF-8 / Latin1 extraction
  const utf8Decoder = new TextDecoder("utf-8", { fatal: false });
  const utf8Str = utf8Decoder.decode(uint8);
  const utf8Matches = utf8Str.match(/[\w\s.,;:!?'"()\-\n\r]{6,}/g) || [];

  const combinedStrings = [
    ...utf16Matches.filter((s) => s.trim().length > 10),
    ...utf8Matches.filter((s) => s.trim().length > 10),
  ];

  // Clean and deduplicate extracted strings
  const cleanedParagraphs = Array.from(
    new Set(
      combinedStrings
        .map((s) => s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ").trim())
        .filter((s) => s.length > 5 && !/^[0-9a-fA-F\s]{10,}$/.test(s))
    )
  );

  rawText = cleanedParagraphs.join("\n\n");
  if (!rawText.trim()) {
    rawText = `Extracted text from legacy ${format.toUpperCase()} document (${file.name}).`;
  }

  cleanedParagraphs.forEach((p) => {
    sections.push({ type: "paragraph", text: p });
  });

  const html = `<div class="legacy-doc"><p>${rawText.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>")}</p></div>`;
  const words = rawText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lineCount = rawText.split("\n").length;
  const pageCount = Math.max(1, Math.ceil(wordCount / 350));

  return {
    title,
    sections: sections.length > 0 ? sections : [{ type: "paragraph", text: rawText }],
    sheets,
    rawText,
    html,
    rawBuffer: arrayBuffer,
    originalFile: file,
    sourceFormat: format,
    metadata: {
      title,
      wordCount,
      lineCount,
      pageCount,
      sheetCount: 0,
      creationDate: new Date(file.lastModified).toISOString(),
    },
  };
}
