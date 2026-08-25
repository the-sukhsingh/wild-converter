import JSZip from "jszip";
import type { DocumentIR, DocumentConversionOptions } from "../types";

export async function generateMarkup(
  doc: DocumentIR,
  format: "md" | "markdown" | "html" | "htm" | "tex" | "rst" | "org" | "rtf" | "odt",
  options: DocumentConversionOptions = {}
): Promise<Blob> {
  switch (format) {
    case "md":
    case "markdown": {
      const md = buildMarkdown(doc);
      return new Blob([md], { type: "text/markdown;charset=utf-8;" });
    }

    case "html":
    case "htm": {
      const html = buildHtml(doc, options);
      return new Blob([html], { type: "text/html;charset=utf-8;" });
    }

    case "tex": {
      const tex = buildLatex(doc, options);
      return new Blob([tex], { type: "application/x-tex;charset=utf-8;" });
    }

    case "rst": {
      const rst = buildRst(doc);
      return new Blob([rst], { type: "text/x-rst;charset=utf-8;" });
    }

    case "org": {
      const org = buildOrg(doc);
      return new Blob([org], { type: "text/org;charset=utf-8;" });
    }

    case "rtf": {
      const rtf = buildRtf(doc);
      return new Blob([rtf], { type: "application/rtf;charset=utf-8;" });
    }

    case "odt": {
      const odtBlob = await buildOdtZip(doc);
      return odtBlob;
    }
  }
}

// ─── Markdown Builder ─────────────────────────────────────────────────────────

function buildMarkdown(doc: DocumentIR): string {
  const parts: string[] = [];

  if (doc.title) {
    parts.push(`# ${doc.title}\n`);
  }

  for (const section of doc.sections) {
    switch (section.type) {
      case "heading": {
        const hashes = "#".repeat(Math.min(6, Math.max(1, section.level)));
        parts.push(`${hashes} ${section.text}\n`);
        break;
      }
      case "paragraph": {
        parts.push(`${section.text}\n`);
        break;
      }
      case "list": {
        section.items.forEach((item, idx) => {
          const bullet = section.ordered ? `${idx + 1}.` : "-";
          parts.push(`${bullet} ${item}`);
        });
        parts.push("");
        break;
      }
      case "table": {
        if (section.headers.length > 0) {
          parts.push(`| ${section.headers.join(" | ")} |`);
          parts.push(`| ${section.headers.map(() => "---").join(" | ")} |`);
        }
        section.rows.forEach((row) => {
          parts.push(`| ${row.join(" | ")} |`);
        });
        parts.push("");
        break;
      }
      case "code": {
        parts.push(`\`\`\`${section.lang || ""}\n${section.code}\n\`\`\`\n`);
        break;
      }
      case "blockquote": {
        parts.push(`> ${section.text}\n`);
        break;
      }
      case "slide": {
        parts.push(`## ${section.title}\n`);
        section.points.forEach((p) => parts.push(`- ${p}`));
        parts.push("");
        break;
      }
      case "divider": {
        parts.push("---\n");
        break;
      }
      case "image": {
        parts.push(`![${section.alt || "image"}](${section.src})\n`);
        break;
      }
    }
  }

  return parts.join("\n");
}

// ─── HTML5 Builder ────────────────────────────────────────────────────────────

function buildHtml(doc: DocumentIR, options: DocumentConversionOptions): string {
  const bodyContent: string[] = [];

  if (doc.title) {
    bodyContent.push(`<h1>${escapeHtml(doc.title)}</h1>`);
  }

  for (const section of doc.sections) {
    switch (section.type) {
      case "image":
        bodyContent.push(`<div style="text-align: center; margin: 1.5em 0;"><img src="${section.src}" alt="${escapeHtml(section.alt || "Image")}" style="max-width: 100%; height: auto;" /></div>`);
        break;
      case "heading":
        bodyContent.push(`<h${section.level}>${escapeHtml(section.text)}</h${section.level}>`);
        break;
      case "paragraph":
        bodyContent.push(`<p>${section.html || escapeHtml(section.text)}</p>`);
        break;
      case "list": {
        const tag = section.ordered ? "ol" : "ul";
        bodyContent.push(`<${tag}>`);
        section.items.forEach((item) => bodyContent.push(`  <li>${escapeHtml(item)}</li>`));
        bodyContent.push(`</${tag}>`);
        break;
      }
      case "table": {
        bodyContent.push(`<table>`);
        if (section.headers.length > 0) {
          bodyContent.push(`  <thead><tr>`);
          section.headers.forEach((h) => bodyContent.push(`    <th>${escapeHtml(h)}</th>`));
          bodyContent.push(`  </tr></thead>`);
        }
        bodyContent.push(`  <tbody>`);
        section.rows.forEach((row) => {
          bodyContent.push(`    <tr>`);
          row.forEach((c) => bodyContent.push(`      <td>${escapeHtml(String(c ?? ""))}</td>`));
          bodyContent.push(`    </tr>`);
        });
        bodyContent.push(`  </tbody></table>`);
        break;
      }
      case "code":
        bodyContent.push(`<pre><code>${escapeHtml(section.code)}</code></pre>`);
        break;
      case "blockquote":
        bodyContent.push(`<blockquote><p>${escapeHtml(section.text)}</p></blockquote>`);
        break;
      case "slide":
        bodyContent.push(`<div class="slide"><h3>${escapeHtml(section.title)}</h3><ul>`);
        section.points.forEach((p) => bodyContent.push(`<li>${escapeHtml(p)}</li>`));
        bodyContent.push(`</ul></div>`);
        break;
      case "divider":
        bodyContent.push(`<hr />`);
        break;
    }
  }

  const css = options.includeStyling !== false
    ? `
    :root { color-scheme: light dark; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; background: #ffffff; }
    @media (prefers-color-scheme: dark) { body { color: #f8fafc; background: #09090b; } table th { background: #27272a; } tr:nth-child(even) { background: #18181b; } code, pre { background: #18181b; color: #f43f5e; } blockquote { border-left-color: #52525b; color: #a1a1aa; } }
    h1, h2, h3, h4 { line-height: 1.25; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    pre { background: #f1f5f9; padding: 12px 16px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 0.9em; }
    blockquote { margin: 1.5em 0; padding: 0 1em; color: #64748b; border-left: 4px solid #cbd5e1; font-style: italic; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 2em 0; }
  `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(doc.title || "Document")}</title>
  <style>${css}</style>
</head>
<body>
  ${bodyContent.join("\n  ")}
</body>
</html>`;
}

// ─── LaTeX Builder ────────────────────────────────────────────────────────────

function buildLatex(doc: DocumentIR, options: DocumentConversionOptions): string {
  const docClass = options.latexClass || "article";
  const body: string[] = [];

  for (const section of doc.sections) {
    switch (section.type) {
      case "heading": {
        const secTag = section.level === 1 ? "section" : section.level === 2 ? "subsection" : "subsubsection";
        body.push(`\\${secTag}{${escapeLatex(section.text)}}`);
        break;
      }
      case "paragraph":
        body.push(`${escapeLatex(section.text)}\n`);
        break;
      case "list": {
        const env = section.ordered ? "enumerate" : "itemize";
        body.push(`\\begin{${env}}`);
        section.items.forEach((item) => body.push(`  \\item ${escapeLatex(item)}`));
        body.push(`\\end{${env}}\n`);
        break;
      }
      case "table": {
        if (section.headers.length > 0 || section.rows.length > 0) {
          const colCount = Math.max(section.headers.length, ...section.rows.map((r) => r.length), 1);
          const colAlign = "l".repeat(colCount);
          body.push(`\\begin{table}[h!]`);
          body.push(`\\centering`);
          body.push(`\\begin{tabular}{${colAlign}}`);
          body.push(`\\hline`);
          if (section.headers.length > 0) {
            body.push(section.headers.map((h) => `\\textbf{${escapeLatex(h)}}`).join(" & ") + " \\\\");
            body.push(`\\hline`);
          }
          section.rows.forEach((row) => {
            body.push(row.map((c) => escapeLatex(String(c ?? ""))).join(" & ") + " \\\\");
          });
          body.push(`\\hline`);
          body.push(`\\end{tabular}`);
          body.push(`\\end{table}\n`);
        }
        break;
      }
      case "code":
        body.push(`\\begin{verbatim}\n${section.code}\n\\end{verbatim}\n`);
        break;
      case "blockquote":
        body.push(`\\begin{quote}\n${escapeLatex(section.text)}\n\\end{quote}\n`);
        break;
      case "divider":
        body.push(`\\noindent\\rule{\\textwidth}{0.5pt}\n`);
        break;
    }
  }

  return `\\documentclass{${docClass}}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{booktabs}

\\title{${escapeLatex(doc.title || "Document")}}
\\date{\\today}

\\begin{document}

\\maketitle

${body.join("\n\n")}

\\end{document}`;
}

// ─── RST Builder ──────────────────────────────────────────────────────────────

function buildRst(doc: DocumentIR): string {
  const parts: string[] = [];

  if (doc.title) {
    const underline = "=".repeat(doc.title.length);
    parts.push(`${underline}\n${doc.title}\n${underline}\n`);
  }

  for (const section of doc.sections) {
    switch (section.type) {
      case "heading": {
        const char = section.level === 1 ? "=" : section.level === 2 ? "-" : "~";
        const underline = char.repeat(Math.max(3, section.text.length));
        parts.push(`${section.text}\n${underline}\n`);
        break;
      }
      case "paragraph":
        parts.push(`${section.text}\n`);
        break;
      case "list":
        section.items.forEach((item, idx) => {
          const bullet = section.ordered ? `${idx + 1}.` : "*";
          parts.push(`${bullet} ${item}`);
        });
        parts.push("");
        break;
      case "code":
        parts.push(`.. code-block:: ${section.lang || "text"}\n\n  ${section.code.replace(/\n/g, "\n  ")}\n`);
        break;
      case "blockquote":
        parts.push(`  ${section.text.replace(/\n/g, "\n  ")}\n`);
        break;
      case "divider":
        parts.push("----\n");
        break;
    }
  }

  return parts.join("\n");
}

// ─── Org Builder ──────────────────────────────────────────────────────────────

function buildOrg(doc: DocumentIR): string {
  const parts: string[] = [];

  if (doc.title) {
    parts.push(`#+TITLE: ${doc.title}\n`);
  }

  for (const section of doc.sections) {
    switch (section.type) {
      case "heading": {
        const stars = "*".repeat(Math.min(6, Math.max(1, section.level)));
        parts.push(`${stars} ${section.text}`);
        break;
      }
      case "paragraph":
        parts.push(`${section.text}\n`);
        break;
      case "list":
        section.items.forEach((item, idx) => {
          const bullet = section.ordered ? `${idx + 1}.` : "-";
          parts.push(`${bullet} ${item}`);
        });
        parts.push("");
        break;
      case "table": {
        if (section.headers.length > 0) {
          parts.push(`| ${section.headers.join(" | ")} |`);
          parts.push(`|${section.headers.map(() => "---").join("+")}|`);
        }
        section.rows.forEach((row) => parts.push(`| ${row.join(" | ")} |`));
        parts.push("");
        break;
      }
      case "code":
        parts.push(`#+BEGIN_SRC ${section.lang || "text"}\n${section.code}\n#+END_SRC\n`);
        break;
      case "blockquote":
        parts.push(`#+BEGIN_QUOTE\n${section.text}\n#+END_QUOTE\n`);
        break;
    }
  }

  return parts.join("\n");
}

// ─── RTF Builder ──────────────────────────────────────────────────────────────

function buildRtf(doc: DocumentIR): string {
  const parts: string[] = [
    "{\\rtf1\\ansi\\deff0",
    "{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fnil\\fcharset0 Courier New;}}",
    "{\\colortbl ;\\red15\\green23\\blue42;\\red51\\green65\\blue85;\\red148\\green163\\blue184;}",
  ];

  if (doc.title) {
    parts.push(`\\fs36\\b\\cf1 ${escapeRtf(doc.title)}\\b0\\fs22\\cf2\\par\\par`);
  }

  for (const section of doc.sections) {
    switch (section.type) {
      case "heading": {
        const fs = section.level === 1 ? "\\fs32\\b" : "\\fs26\\b";
        parts.push(`${fs}\\cf1 ${escapeRtf(section.text)}\\b0\\fs22\\cf2\\par`);
        break;
      }
      case "paragraph":
        parts.push(`\\fs22\\cf2 ${escapeRtf(section.text)}\\par\\par`);
        break;
      case "list":
        section.items.forEach((item, idx) => {
          const bullet = section.ordered ? `${idx + 1}. ` : "\\bullet  ";
          parts.push(`\\fi-360\\li720 ${bullet}${escapeRtf(item)}\\par`);
        });
        parts.push("\\par");
        break;
      case "code":
        parts.push(`\\f1\\fs19\\cf1 ${escapeRtf(section.code).replace(/\\par/g, "\\par\\f1")}\\f0\\fs22\\cf2\\par\\par`);
        break;
      case "blockquote":
        parts.push(`\\i\\cf3\\li720 "${escapeRtf(section.text)}"\\i0\\cf2\\li0\\par\\par`);
        break;
      case "divider":
        parts.push("\\line\\par");
        break;
    }
  }

  parts.push("}");
  return parts.join("\n");
}

// ─── ODT Package Builder ──────────────────────────────────────────────────────

async function buildOdtZip(doc: DocumentIR): Promise<Blob> {
  const zip = new JSZip();

  // mimetype file must be uncompressed at start
  zip.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });

  let textXml = "";
  if (doc.title) {
    textXml += `<text:h text:outline-level="1">${escapeXml(doc.title)}</text:h>`;
  }

  for (const section of doc.sections) {
    if (section.type === "heading") {
      textXml += `<text:h text:outline-level="${section.level}">${escapeXml(section.text)}</text:h>`;
    } else if (section.type === "paragraph") {
      textXml += `<text:p>${escapeXml(section.text)}</text:p>`;
    } else if (section.type === "list") {
      textXml += `<text:list>`;
      section.items.forEach((item) => {
        textXml += `<text:list-item><text:p>${escapeXml(item)}</text:p></text:list-item>`;
      });
      textXml += `</text:list>`;
    }
  }

  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
  <office:body>
    <office:text>
      ${textXml}
    </office:text>
  </office:body>
</office:document-content>`;

  zip.file("content.xml", contentXml);

  const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

  zip.folder("META-INF")?.file("manifest.xml", manifestXml);

  return zip.generateAsync({ type: "blob", mimeType: "application/vnd.oasis.opendocument.text" });
}

// ─── Escape Helpers ───────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeLatex(str: string): string {
  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}~^])/g, "\\$1");
}

function escapeRtf(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\par ");
}
