import { marked } from "marked";
import type { DocumentIR, DocumentSection, DocumentSheet } from "../types";

/**
 * Parses markdown, plaintext, HTML, RTF, LaTeX, Org-mode, and RST into DocumentIR
 */
export async function parseMarkupDocument(
  file: File,
  format: string
): Promise<DocumentIR> {
  const text = await file.text();
  const title = file.name.replace(/\.[^.]+$/, "");

  let html = "";
  let rawText = text;
  const sections: DocumentSection[] = [];
  const sheets: DocumentSheet[] = [];

  switch (format) {
    case "md":
    case "markdown": {
      // Parse markdown to HTML
      html = (await marked.parse(text)) as string;
      parseMarkdownSections(text, sections);
      rawText = extractTextFromMarkdown(text);
      break;
    }

    case "html":
    case "htm": {
      html = text;
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      rawText = doc.body.textContent || text;
      parseHtmlSections(doc.body, sections);
      break;
    }

    case "rtf": {
      rawText = parseRtfToText(text);
      html = `<div class="rtf-content"><p>${rawText.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>")}</p></div>`;
      parsePlaintextSections(rawText, sections);
      break;
    }

    case "tex": {
      rawText = parseLatexToText(text);
      html = `<div class="latex-content"><pre>${escapeHtml(rawText)}</pre></div>`;
      parsePlaintextSections(rawText, sections);
      break;
    }

    case "org": {
      rawText = parseOrgToText(text);
      html = `<div class="org-content">${parseOrgToHtml(text)}</div>`;
      parseOrgSections(text, sections);
      break;
    }

    case "rst": {
      rawText = parseRstToText(text);
      html = `<div class="rst-content">${parseRstToHtml(text)}</div>`;
      parseRstSections(text, sections);
      break;
    }

    case "txt":
    default: {
      rawText = text;
      html = `<pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(text)}</pre>`;
      parsePlaintextSections(text, sections);
      break;
    }
  }

  // Calculate metadata
  const words = rawText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lineCount = rawText.split("\n").length;
  const pageCount = Math.max(1, Math.ceil(wordCount / 400));

  return {
    title,
    sections,
    sheets,
    rawText,
    html,
    metadata: {
      title,
      wordCount,
      lineCount,
      pageCount,
      sheetCount: sheets.length,
      creationDate: new Date(file.lastModified).toISOString(),
    },
  };
}

// ─── Section Parsers ───────────────────────────────────────────────────────────

function parseMarkdownSections(md: string, sections: DocumentSection[]): void {
  const lines = md.split("\n");
  let currentParagraph = "";
  let inCodeBlock = false;
  let codeBuffer = "";
  let codeLang = "";
  let listBuffer: string[] = [];
  let isOrderedList = false;

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      sections.push({ type: "paragraph", text: currentParagraph.trim() });
      currentParagraph = "";
    }
  };

  const flushList = () => {
    if (listBuffer.length > 0) {
      sections.push({ type: "list", items: [...listBuffer], ordered: isOrderedList });
      listBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        sections.push({ type: "code", code: codeBuffer.trimEnd(), lang: codeLang });
        codeBuffer = "";
        codeLang = "";
        inCodeBlock = false;
      } else {
        flushParagraph();
        flushList();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer += (codeBuffer ? "\n" : "") + line;
      continue;
    }

    // Markdown Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = Math.min(6, headingMatch[1].length) as 1 | 2 | 3 | 4 | 5 | 6;
      sections.push({ type: "heading", level, text: headingMatch[2].trim() });
      continue;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)\s*$/.test(line.trim())) {
      flushParagraph();
      flushList();
      sections.push({ type: "divider" });
      continue;
    }

    // Blockquote
    if (line.trim().startsWith(">")) {
      flushParagraph();
      flushList();
      sections.push({ type: "blockquote", text: line.replace(/^>\s*/, "").trim() });
      continue;
    }

    // Markdown Table Check
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushParagraph();
      flushList();
      const tableLines: string[] = [line];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("|")) {
        i++;
        tableLines.push(lines[i]);
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const rows: string[][] = [];
        // Skip separator row at index 1 if it contains ---
        const startIdx = tableLines[1].includes("---") ? 2 : 1;
        for (let r = startIdx; r < tableLines.length; r++) {
          const rowCells = tableLines[r]
            .split("|")
            .map((c) => c.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          rows.push(rowCells);
        }
        sections.push({ type: "table", headers, rows });
        continue;
      }
    }

    // Unordered List item
    const ulMatch = line.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      if (isOrderedList) flushList();
      isOrderedList = false;
      listBuffer.push(ulMatch[1].trim());
      continue;
    }

    // Ordered List item
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      if (!isOrderedList) flushList();
      isOrderedList = true;
      listBuffer.push(olMatch[1].trim());
      continue;
    }

    // Blank line
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    // Regular paragraph continuation
    flushList();
    currentParagraph += (currentParagraph ? " " : "") + line.trim();
  }

  flushParagraph();
  flushList();
}

function parseHtmlSections(container: HTMLElement, sections: DocumentSection[]): void {
  for (let i = 0; i < container.children.length; i++) {
    const el = container.children[i] as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1], 10) as 1 | 2 | 3 | 4 | 5 | 6;
      sections.push({ type: "heading", level, text: el.textContent || "" });
    } else if (tag === "p") {
      sections.push({ type: "paragraph", text: el.textContent || "", html: el.innerHTML });
    } else if (tag === "ul" || tag === "ol") {
      const items: string[] = [];
      el.querySelectorAll("li").forEach((li) => {
        if (li.textContent) items.push(li.textContent.trim());
      });
      sections.push({ type: "list", items, ordered: tag === "ol" });
    } else if (tag === "table") {
      const headers: string[] = [];
      const rows: string[][] = [];
      el.querySelectorAll("th").forEach((th) => headers.push(th.textContent?.trim() || ""));
      el.querySelectorAll("tbody tr, tr").forEach((tr) => {
        const cells: string[] = [];
        tr.querySelectorAll("td").forEach((td) => cells.push(td.textContent?.trim() || ""));
        if (cells.length > 0) rows.push(cells);
      });
      sections.push({ type: "table", headers, rows });
    } else if (tag === "pre" || tag === "code") {
      sections.push({ type: "code", code: el.textContent || "" });
    } else if (tag === "blockquote") {
      sections.push({ type: "blockquote", text: el.textContent || "" });
    } else if (tag === "hr") {
      sections.push({ type: "divider" });
    } else if (el.textContent?.trim()) {
      sections.push({ type: "paragraph", text: el.textContent.trim() });
    }
  }

  if (sections.length === 0 && container.textContent?.trim()) {
    sections.push({ type: "paragraph", text: container.textContent.trim() });
  }
}

function parsePlaintextSections(text: string, sections: DocumentSection[]): void {
  const paragraphs = text.split(/\n\s*\n+/);
  for (const para of paragraphs) {
    if (para.trim()) {
      sections.push({ type: "paragraph", text: para.trim() });
    }
  }
}

function parseOrgSections(text: string, sections: DocumentSection[]): void {
  const lines = text.split("\n");
  for (const line of lines) {
    const headingMatch = line.match(/^(\*+)\s+(.+)$/);
    if (headingMatch) {
      const level = Math.min(6, headingMatch[1].length) as 1 | 2 | 3 | 4 | 5 | 6;
      sections.push({ type: "heading", level, text: headingMatch[2].trim() });
    } else if (line.trim()) {
      sections.push({ type: "paragraph", text: line.trim() });
    }
  }
}

function parseRstSections(text: string, sections: DocumentSection[]): void {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i + 1 < lines.length && /^[=\-~`^#*]{3,}$/.test(lines[i + 1].trim()) && line.trim()) {
      sections.push({ type: "heading", level: 1, text: line.trim() });
      i++; // skip underline
    } else if (line.trim()) {
      sections.push({ type: "paragraph", text: line.trim() });
    }
  }
}

// ─── Format Translators ────────────────────────────────────────────────────────

function extractTextFromMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/^>\s*/gm, "");
}

function parseRtfToText(rtf: string): string {
  // Strip RTF control words and groups
  let str = rtf.replace(/\\par[d]?\b/gi, "\n");
  str = str.replace(/\\line\b/gi, "\n");
  str = str.replace(/\\tab\b/gi, "\t");
  str = str.replace(/\\'[0-9a-f]{2}/gi, (match) => {
    const hex = parseInt(match.slice(2), 16);
    return String.fromCharCode(hex);
  });
  str = str.replace(/\\u([0-9]{1,5})\??/gi, (_, charCode) => {
    return String.fromCharCode(parseInt(charCode, 10));
  });
  str = str.replace(/(\{\\fonttbl[\s\S]*?\}|\{\\colortbl[\s\S]*?\}|\{\\stylesheet[\s\S]*?\})/gi, "");
  str = str.replace(/\\([a-z]{1,32})(-?[0-9]{1,10})? ?/gi, "");
  str = str.replace(/[{}]/g, "");
  return str.trim();
}

function parseLatexToText(tex: string): string {
  let str = tex.replace(/\\(section|chapter|subsection|subsubsection)\*?\{([^}]+)\}/gi, "\n\n$2\n");
  str = str.replace(/\\(textbf|textit|emph|underline|texttt)\{([^}]+)\}/gi, "$2");
  str = str.replace(/\\begin\{document\}/gi, "");
  str = str.replace(/\\end\{document\}/gi, "");
  str = str.replace(/\\(item)\s+/gi, "• ");
  str = str.replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{([^}]*)\})?/gi, "$3");
  str = str.replace(/%.*$/gm, "");
  return str.trim();
}

function parseOrgToText(org: string): string {
  return org
    .replace(/^(\*+)\s+/gm, "")
    .replace(/#\+[A-Z_]+:.*$/gm, "")
    .replace(/\[\[([^\]]+)\]\[([^\]]+)\]\]/g, "$2");
}

function parseOrgToHtml(org: string): string {
  return org
    .split("\n")
    .map((line) => {
      if (line.startsWith("* ")) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
      if (line.startsWith("** ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      if (line.startsWith("*** ")) return `<h3>${escapeHtml(line.slice(4))}</h3>`;
      if (line.trim()) return `<p>${escapeHtml(line)}</p>`;
      return "";
    })
    .join("\n");
}

function parseRstToText(rst: string): string {
  return rst
    .replace(/^[=\-~`^#*]{3,}$/gm, "")
    .replace(/\.\. [a-zA-Z0-9_-]+::/g, "");
}

function parseRstToHtml(rst: string): string {
  const lines = rst.split("\n");
  const htmlParts: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i + 1 < lines.length && /^[=\-~`^#*]{3,}$/.test(lines[i + 1].trim()) && line.trim()) {
      htmlParts.push(`<h2>${escapeHtml(line.trim())}</h2>`);
      i++;
    } else if (line.trim()) {
      htmlParts.push(`<p>${escapeHtml(line)}</p>`);
    }
  }
  return htmlParts.join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
