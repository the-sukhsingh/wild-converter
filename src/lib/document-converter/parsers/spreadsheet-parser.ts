import * as XLSX from "xlsx";
import type { DocumentIR, DocumentSection, DocumentSheet } from "../types";

export async function parseSpreadsheetDocument(file: File): Promise<DocumentIR> {
  const arrayBuffer = await file.arrayBuffer();
  const title = file.name.replace(/\.[^.]+$/, "");

  // Read workbook
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheets: DocumentSheet[] = [];
  const sections: DocumentSection[] = [];
  let html = "";
  let rawText = "";

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    // Convert to 2D array of rows
    const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (rawRows.length === 0) return;

    const headers: string[] = (rawRows[0] || []).map((cell: any) => String(cell ?? ""));
    const dataRows = rawRows.slice(1);

    sheets.push({
      name: sheetName,
      headers,
      rows: dataRows,
    });

    // Add as section
    sections.push({ type: "heading", level: 2, text: sheetName });
    sections.push({
      type: "table",
      headers,
      rows: dataRows.map((row) => row.map((c) => String(c ?? ""))),
    });

    // Build plain text representation
    rawText += `--- Sheet: ${sheetName} ---\n`;
    rawText += headers.join("\t") + "\n";
    dataRows.forEach((row) => {
      rawText += row.map((c) => String(c ?? "")).join("\t") + "\n";
    });
    rawText += "\n";

    // Build HTML representation
    html += `<div class="sheet-container"><h3>${sheetName}</h3><table border="1"><thead><tr>`;
    headers.forEach((h) => {
      html += `<th>${escapeHtml(h)}</th>`;
    });
    html += `</tr></thead><tbody>`;
    dataRows.forEach((row) => {
      html += `<tr>`;
      headers.forEach((_, idx) => {
        const val = String(row[idx] ?? "");
        html += `<td>${escapeHtml(val)}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table></div>`;
  });

  const words = rawText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lineCount = rawText.split("\n").length;
  const pageCount = Math.max(1, sheets.length);

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
