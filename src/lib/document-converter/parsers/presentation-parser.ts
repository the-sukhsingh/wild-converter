import JSZip from "jszip";
import type { DocumentIR, DocumentSection, DocumentSlideSection, DocumentSheet } from "../types";
import { parseBinaryPptRecords } from "./ppt-binary-parser";

export async function parsePresentationDocument(
  file: File,
  format: string
): Promise<DocumentIR> {
  const arrayBuffer = await file.arrayBuffer();
  const title = file.name.replace(/\.[^.]+$/, "");

  const sections: DocumentSection[] = [];
  const sheets: DocumentSheet[] = [];
  let rawText = "";
  let html = "";
  let slideCount = 0;

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);

    if (format === "pptx") {
      // Find all slide XML files
      const slideFiles = Object.keys(zip.files)
        .filter((name) => name.startsWith("ppt/slides/slide") && name.endsWith(".xml"))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/[^0-9]/g, "") || "0", 10);
          const numB = parseInt(b.replace(/[^0-9]/g, "") || "0", 10);
          return numA - numB;
        });

      slideCount = slideFiles.length;

      for (let i = 0; i < slideFiles.length; i++) {
        const slideXml = await zip.files[slideFiles[i]].async("string");
        const slideNum = i + 1;

        // Extract slide text runs
        const textMatches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
        const texts: string[] = textMatches.map((m) => m.replace(/<[^>]+>/g, "").trim()).filter(Boolean);

        const slideTitle = texts[0] || `Slide ${slideNum}`;
        const points = texts.slice(1);

        const slideSection: DocumentSlideSection = {
          type: "slide",
          title: slideTitle,
          points,
        };

        sections.push(slideSection);

        rawText += `=== Slide ${slideNum}: ${slideTitle} ===\n`;
        points.forEach((p) => {
          rawText += `• ${p}\n`;
        });
        rawText += "\n";

        html += `<div class="slide-card"><h4>Slide ${slideNum}: ${escapeHtml(slideTitle)}</h4><ul>`;
        points.forEach((p) => {
          html += `<li>${escapeHtml(p)}</li>`;
        });
        html += `</ul></div>`;
      }
    } else if (format === "odp") {
      // OpenDocument Presentation content.xml
      const contentXml = await zip.file("content.xml")?.async("string");
      if (contentXml) {
        const textMatches = contentXml.match(/<text:p[^>]*>(.*?)<\/text:p>/gi) || [];
        const texts = textMatches.map((m) => m.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
        slideCount = Math.max(1, Math.ceil(texts.length / 4));

        for (let i = 0; i < texts.length; i += 4) {
          const chunk = texts.slice(i, i + 4);
          const slideNum = Math.floor(i / 4) + 1;
          const slideTitle = chunk[0] || `Slide ${slideNum}`;
          const points = chunk.slice(1);

          sections.push({
            type: "slide",
            title: slideTitle,
            points,
          });

          rawText += `=== Slide ${slideNum}: ${slideTitle} ===\n`;
          points.forEach((p) => (rawText += `• ${p}\n`));
          rawText += "\n";
        }
      }
    }
  } catch {
    // If ZIP parsing fails or format is legacy binary .ppt, use the specialized binary PPT parser
    const { slides: binarySlides, allText: binaryText } = parseBinaryPptRecords(arrayBuffer);
    if (binarySlides.length > 0) {
      sections.push(...binarySlides);
      rawText = binaryText;
      slideCount = binarySlides.length;
      binarySlides.forEach((s, idx) => {
        html += `<div class="slide-card"><h4>Slide ${idx + 1}: ${escapeHtml(s.title)}</h4><ul>`;
        s.points.forEach((p) => {
          html += `<li>${escapeHtml(p)}</li>`;
        });
        html += `</ul></div>`;
      });
    } else {
      sections.push({ type: "paragraph", text: title });
      rawText = title;
      slideCount = 1;
    }
  }

  const words = rawText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lineCount = rawText.split("\n").length;

  return {
    title,
    sections,
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
      pageCount: Math.max(1, slideCount),
      sheetCount: 0,
      creationDate: new Date(file.lastModified).toISOString(),
    },
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
