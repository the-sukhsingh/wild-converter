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
    // 1. Mammoth HTML & raw text extraction with embedded image support and rich style maps
    const [htmlResult, textResult] = await Promise.all([
      mammoth.convertToHtml(
        { arrayBuffer },
        {
          convertImage: mammoth.images.imgElement((image) =>
            image.read("base64").then((imageBuffer) => ({
              src: "data:" + image.contentType + ";base64," + imageBuffer,
            }))
          ),
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='Heading 5'] => h5:fresh",
            "p[style-name='Heading 6'] => h6:fresh",
            "p[style-name='Title'] => h1.doc-title:fresh",
            "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
            "r[style-name='Strong'] => strong",
            "r[style-name='Emphasis'] => em",
            "u => u",
            "strike => del",
            "table => table.docx-table",
          ],
          includeDefaultStyleMap: true,
        }
      ),
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
          const img = el.querySelector("img");
          if (img && img.getAttribute("src")) {
            sections.push({
              type: "image",
              src: img.getAttribute("src") || "",
              alt: img.getAttribute("alt") || "Embedded Document Image",
            });
          } else if (el.textContent?.trim()) {
            sections.push({ type: "paragraph", text: el.textContent.trim(), html: el.innerHTML });
          }
        } else if (tag === "img") {
          const src = el.getAttribute("src");
          if (src) {
            sections.push({
              type: "image",
              src,
              alt: el.getAttribute("alt") || "Embedded Document Image",
            });
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
    rawBuffer: arrayBuffer,
    originalFile: file,
    sourceFormat: "docx",
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
