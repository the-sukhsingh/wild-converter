import type { DocumentIR, DocumentSection, DocumentSheet } from "../types";

export async function parsePdfDocument(file: File): Promise<DocumentIR> {
  const arrayBuffer = await file.arrayBuffer();
  const title = file.name.replace(/\.[^.]+$/, "");

  let rawText = "";
  const sections: DocumentSection[] = [];
  const sheets: DocumentSheet[] = [];
  let pageCount = 1;

  try {
    // Dynamic import for pdfjs-dist in browser
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    
    // Configure worker if in browser
    if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.0.379"}/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    pageCount = pdf.numPages;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let pageStr = "";
      let lastY: number | null = null;

      for (const item of textContent.items) {
        if ("str" in item) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageStr += "\n";
          } else if (pageStr.length > 0 && !pageStr.endsWith(" ") && !pageStr.endsWith("\n")) {
            pageStr += " ";
          }
          pageStr += item.str;
          lastY = item.transform[5];
        }
      }

      if (pdf.numPages > 1) {
        sections.push({ type: "heading", level: 3, text: `Page ${pageNum}` });
      }

      const paragraphs = pageStr.split(/\n\s*\n+/);
      for (const p of paragraphs) {
        if (p.trim()) {
          sections.push({ type: "paragraph", text: p.trim() });
        }
      }

      rawText += pageStr + "\n\n";
    }
  } catch {
    // Fallback: Binary string stream decoder to extract text objects
    const bytes = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder("latin1");
    const fullBinaryStr = textDecoder.decode(bytes);

    // Extract text in parentheses between BT and ET
    const textMatches = fullBinaryStr.matchAll(/BT[\s\S]*?ET/g);
    let extracted = "";

    for (const match of textMatches) {
      const block = match[0];
      const strMatches = block.matchAll(/\((.*?)\)\s*Tj/g);
      for (const s of strMatches) {
        extracted += s[1] + " ";
      }
      extracted += "\n";
    }

    rawText = extracted.trim() || "Extracted content from PDF document.";
    const paras = rawText.split("\n\n");
    for (const p of paras) {
      if (p.trim()) {
        sections.push({ type: "paragraph", text: p.trim() });
      }
    }
  }

  const html = `<div class="pdf-extracted"><p>${rawText.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>")}</p></div>`;
  const words = rawText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lineCount = rawText.split("\n").length;

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
