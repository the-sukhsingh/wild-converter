import type { DocumentIR, DocumentConversionOptions } from "../types";

export function generateText(
  doc: DocumentIR,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: DocumentConversionOptions = {}
): Blob {
  const parts: string[] = [];

  if (doc.title) {
    parts.push(doc.title.toUpperCase());
    parts.push("=".repeat(doc.title.length));
    parts.push("");
  }

  for (const section of doc.sections) {
    switch (section.type) {
      case "heading": {
        const underlineChar = section.level === 1 ? "=" : "-";
        parts.push(section.text);
        parts.push(underlineChar.repeat(Math.max(3, section.text.length)));
        parts.push("");
        break;
      }
      case "paragraph": {
        parts.push(section.text);
        parts.push("");
        break;
      }
      case "list": {
        section.items.forEach((item, idx) => {
          const bullet = section.ordered ? `${idx + 1}. ` : "• ";
          parts.push(`  ${bullet}${item}`);
        });
        parts.push("");
        break;
      }
      case "table": {
        if (section.headers.length > 0 || section.rows.length > 0) {
          const allRows = [section.headers, ...section.rows];
          const colWidths: number[] = [];

          allRows.forEach((row) => {
            row.forEach((cell, idx) => {
              const len = String(cell ?? "").length;
              colWidths[idx] = Math.max(colWidths[idx] || 0, len);
            });
          });

          if (section.headers.length > 0) {
            const headerLine = section.headers
              .map((h, i) => h.padEnd(colWidths[i] || 10))
              .join(" | ");
            parts.push(headerLine);
            parts.push("-".repeat(headerLine.length));
          }

          section.rows.forEach((row) => {
            const rowLine = row
              .map((cell, i) => String(cell ?? "").padEnd(colWidths[i] || 10))
              .join(" | ");
            parts.push(rowLine);
          });
          parts.push("");
        }
        break;
      }
      case "code": {
        parts.push(section.code);
        parts.push("");
        break;
      }
      case "blockquote": {
        parts.push(`  | ${section.text.replace(/\n/g, "\n  | ")}`);
        parts.push("");
        break;
      }
      case "slide": {
        parts.push(`[ Slide: ${section.title} ]`);
        section.points.forEach((p) => parts.push(`  • ${p}`));
        parts.push("");
        break;
      }
      case "divider": {
        parts.push("----------------------------------------");
        parts.push("");
        break;
      }
      case "image": {
        parts.push(`[Image: ${section.alt || "Image"}]`);
        parts.push("");
        break;
      }
    }
  }

  const textContent = parts.join("\n").trimEnd() + "\n";
  return new Blob([textContent], { type: "text/plain;charset=utf-8;" });
}
