import mammoth from "mammoth";
import JSZip from "jszip";
import type { DocumentIR, DocumentSection, DocumentSheet } from "../types";

export async function parseDocxDocument(file: File): Promise<DocumentIR> {
  const arrayBuffer = await file.arrayBuffer();
  const title = file.name.replace(/\.[^.]+$/, "");

  let html = "";
  let rawText = "";
  const sections: DocumentSection[] = [];
  const sheets: DocumentSheet[] = [];

  try {
    // 1. Mammoth HTML & raw text extraction
    const [htmlResult, textResult] = await Promise.all([
      mammoth.convertToHtml({ arrayBuffer }),
      mammoth.extractRawText({ arrayBuffer }),
    ]);

    html = htmlResult.value || "";
    rawText = textResult.value || "";

    // Parse HTML into DocumentSection nodes
    if (typeof window !== "undefined" && window.DOMParser) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      for (let i = 0; i < doc.body.children.length; i++) {
        const el = doc.body.children[i] as HTMLElement;
        const tag = el.tagName.toLowerCase();

        if (/^h[1-6]$/.test(tag)) {
          const level = parseInt(tag[1], 10) as 1 | 2 | 3 | 4 | 5 | 6;
          sections.push({ type: "heading", level, text: el.textContent?.trim() || "" });
        } else if (tag === "p") {
          if (el.textContent?.trim()) {
            sections.push({ type: "paragraph", text: el.textContent.trim(), html: el.innerHTML });
          }
        } else if (tag === "ul" || tag === "ol") {
          const items: string[] = [];
          el.querySelectorAll("li").forEach((li) => {
            if (li.textContent?.trim()) items.push(li.textContent.trim());
          });
          if (items.length > 0) {
            sections.push({ type: "list", items, ordered: tag === "ol" });
          }
        } else if (tag === "table") {
          const headers: string[] = [];
          const rows: string[][] = [];
          el.querySelectorAll("th").forEach((th) => headers.push(th.textContent?.trim() || ""));
          el.querySelectorAll("tr").forEach((tr, rIdx) => {
            const cells: string[] = [];
            tr.querySelectorAll("td").forEach((td) => cells.push(td.textContent?.trim() || ""));
            if (rIdx === 0 && headers.length === 0 && cells.length > 0) {
              headers.push(...cells);
            } else if (cells.length > 0) {
              rows.push(cells);
            }
          });
          if (headers.length > 0 || rows.length > 0) {
            sections.push({ type: "table", headers, rows });
          }
        } else if (tag === "blockquote") {
          sections.push({ type: "blockquote", text: el.textContent?.trim() || "" });
        }
      }
    }
  } catch {
    // Fallback: direct OpenXML JSZip text stream parsing
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXml = await zip.file("word/document.xml")?.async("string");
    if (docXml) {
      rawText = docXml
        .replace(/<w:p\b[^>]*>/gi, "\n")
        .replace(/<w:tab\/>/gi, "\t")
        .replace(/<[^>]+>/g, "")
        .replace(/\n\s*\n+/g, "\n\n")
        .trim();
      html = `<p>${rawText.replace(/\n\n+/g, "</p><p>")}</p>`;

      const paras = rawText.split("\n\n");
      for (const p of paras) {
        if (p.trim()) {
          sections.push({ type: "paragraph", text: p.trim() });
        }
      }
    }
  }

  const words = rawText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lineCount = rawText.split("\n").length;
  const pageCount = Math.max(1, Math.ceil(wordCount / 380));

  return {
    title,
    sections: sections.length > 0 ? sections : [{ type: "paragraph", text: rawText }],
    sheets,
    rawText,
    html,
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
