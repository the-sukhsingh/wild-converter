import { jsPDF } from "jspdf";
import type { DocumentIR, DocumentConversionOptions } from "../types";

export async function generatePdf(
  doc: DocumentIR,
  options: DocumentConversionOptions = {}
): Promise<Blob> {
  const orientation = options.pdfOrientation || "portrait";
  const format = options.pdfPageSize || "a4";
  const baseFontSize = options.pdfFontSize || 11;
  const showPageNumbers = options.pdfPageNumbers ?? true;
  const showHeader = options.pdfHeaderTitle ?? true;

  // Initialize jsPDF
  const pdf = new jsPDF({
    orientation,
    unit: "pt",
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Margins
  let margin = 40;
  if (options.pdfMargins === "compact") margin = 28;
  if (options.pdfMargins === "wide") margin = 56;

  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - margin - (showPageNumbers ? 20 : 0);

  let currentY = margin + (showHeader ? 15 : 0);

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > bottomLimit) {
      pdf.addPage();
      currentY = margin + (showHeader ? 15 : 0);
      return true;
    }
    return false;
  };

  // Set default text styling
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(30, 30, 30);

  // Render Document Title if available
  if (doc.title) {
    checkPageBreak(40);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(baseFontSize + 9);
    pdf.setTextColor(15, 23, 42); // slate-900
    const titleLines = pdf.splitTextToSize(doc.title, contentWidth);
    pdf.text(titleLines, margin, currentY);
    currentY += titleLines.length * (baseFontSize + 11) + 12;

    // Hairline divider under title
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.setLineWidth(0.75);
    pdf.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 16;
  }

  // Iterate over sections
  for (const section of doc.sections) {
    switch (section.type) {
      case "heading": {
        const sizeIncrement = Math.max(1, 7 - section.level * 1.5);
        const headingSize = baseFontSize + sizeIncrement;
        checkPageBreak(headingSize * 2.2 + 10);

        currentY += 6;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(headingSize);
        pdf.setTextColor(30, 41, 59); // slate-800

        const headingLines = pdf.splitTextToSize(section.text, contentWidth);
        pdf.text(headingLines, margin, currentY);
        currentY += headingLines.length * (headingSize + 4) + 6;
        break;
      }

      case "paragraph": {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize);
        pdf.setTextColor(51, 65, 85); // slate-700

        const lineHeight = baseFontSize * 1.45;
        const paraLines = pdf.splitTextToSize(section.text, contentWidth);

        for (const line of paraLines) {
          checkPageBreak(lineHeight);
          pdf.text(line, margin, currentY);
          currentY += lineHeight;
        }
        currentY += 6;
        break;
      }

      case "list": {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize);
        pdf.setTextColor(51, 65, 85);

        const lineHeight = baseFontSize * 1.4;
        const bulletIndent = 16;

        section.items.forEach((item, idx) => {
          const bullet = section.ordered ? `${idx + 1}.` : "•";
          const itemLines = pdf.splitTextToSize(item, contentWidth - bulletIndent);

          checkPageBreak(lineHeight * itemLines.length + 2);

          // Draw bullet
          pdf.setFont("helvetica", "bold");
          pdf.text(bullet, margin + 4, currentY);
          pdf.setFont("helvetica", "normal");

          // Draw text
          pdf.text(itemLines, margin + bulletIndent, currentY);
          currentY += itemLines.length * lineHeight + 3;
        });
        currentY += 4;
        break;
      }

      case "table": {
        if (section.headers.length === 0 && section.rows.length === 0) break;

        const colCount = Math.max(
          section.headers.length,
          ...section.rows.map((r) => r.length),
          1
        );
        const colWidth = contentWidth / colCount;
        const cellPadding = 5;
        const rowHeight = baseFontSize * 1.6 + 6;

        // Check if table header fits
        checkPageBreak(rowHeight * 2);

        // Header Row
        if (section.headers.length > 0) {
          pdf.setFillColor(241, 245, 249); // slate-100
          pdf.rect(margin, currentY, contentWidth, rowHeight, "F");

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(baseFontSize - 1);
          pdf.setTextColor(15, 23, 42);

          section.headers.forEach((h, colIdx) => {
            const x = margin + colIdx * colWidth + cellPadding;
            const text = pdf.splitTextToSize(h, colWidth - cellPadding * 2)[0] || "";
            pdf.text(text, x, currentY + rowHeight / 2 + (baseFontSize - 1) / 3);
          });

          // Header border
          pdf.setDrawColor(203, 213, 225);
          pdf.setLineWidth(0.75);
          pdf.rect(margin, currentY, contentWidth, rowHeight);
          currentY += rowHeight;
        }

        // Data Rows
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize - 1);
        pdf.setTextColor(51, 65, 85);

        section.rows.forEach((row, rIdx) => {
          checkPageBreak(rowHeight);

          if (rIdx % 2 === 1) {
            pdf.setFillColor(248, 250, 252); // slate-50
            pdf.rect(margin, currentY, contentWidth, rowHeight, "F");
          }

          row.forEach((cell, colIdx) => {
            if (colIdx >= colCount) return;
            const x = margin + colIdx * colWidth + cellPadding;
            const text = pdf.splitTextToSize(String(cell ?? ""), colWidth - cellPadding * 2)[0] || "";
            pdf.text(text, x, currentY + rowHeight / 2 + (baseFontSize - 1) / 3);
          });

          pdf.setDrawColor(226, 232, 240);
          pdf.setLineWidth(0.5);
          pdf.rect(margin, currentY, contentWidth, rowHeight);
          currentY += rowHeight;
        });

        currentY += 10;
        break;
      }

      case "code": {
        const codeLines = section.code.split("\n");
        const lineHeight = (baseFontSize - 1.5) * 1.35;
        const blockHeight = codeLines.length * lineHeight + 12;

        checkPageBreak(Math.min(blockHeight, 100));

        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(margin, currentY, contentWidth, blockHeight, 3, 3, "F");

        pdf.setFont("courier", "normal");
        pdf.setFontSize(baseFontSize - 1.5);
        pdf.setTextColor(30, 41, 59);

        let codeY = currentY + 10;
        for (const line of codeLines) {
          pdf.text(line.slice(0, 95), margin + 8, codeY);
          codeY += lineHeight;
        }

        currentY += blockHeight + 10;
        break;
      }

      case "blockquote": {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(baseFontSize);
        pdf.setTextColor(71, 85, 105);

        const quoteLines = pdf.splitTextToSize(section.text, contentWidth - 18);
        const quoteHeight = quoteLines.length * (baseFontSize * 1.4) + 6;

        checkPageBreak(quoteHeight);

        // Quote bar
        pdf.setDrawColor(148, 163, 184); // slate-400
        pdf.setLineWidth(2.5);
        pdf.line(margin + 2, currentY, margin + 2, currentY + quoteHeight - 4);

        pdf.text(quoteLines, margin + 14, currentY + baseFontSize);
        currentY += quoteHeight + 8;
        break;
      }

      case "slide": {
        checkPageBreak(70);

        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, currentY, contentWidth, 30, 3, 3, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(baseFontSize + 2);
        pdf.setTextColor(15, 23, 42);
        pdf.text(section.title, margin + 10, currentY + 19);
        currentY += 36;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize);
        pdf.setTextColor(51, 65, 85);

        section.points.forEach((pt) => {
          checkPageBreak(baseFontSize * 1.5);
          pdf.text(`•  ${pt}`, margin + 12, currentY);
          currentY += baseFontSize * 1.5;
        });

        currentY += 10;
        break;
      }

      case "divider": {
        checkPageBreak(16);
        currentY += 6;
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.75);
        pdf.line(margin, currentY, margin + contentWidth, currentY);
        currentY += 12;
        break;
      }
    }
  }

  // Draw Header / Footer across all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(148, 163, 184); // slate-400

    // Running Header
    if (showHeader && doc.title) {
      pdf.text(doc.title, margin, margin - 10);
      pdf.setDrawColor(241, 245, 249);
      pdf.setLineWidth(0.5);
      pdf.line(margin, margin - 5, margin + contentWidth, margin - 5);
    }

    // Page Number Footer
    if (showPageNumbers) {
      const footerText = `${i} / ${totalPages}`;
      const textWidth = pdf.getTextWidth(footerText);
      pdf.text(footerText, margin + contentWidth - textWidth, pageHeight - margin + 14);
      pdf.text("wild · client-side wasm engine", margin, pageHeight - margin + 14);
    }
  }

  return pdf.output("blob");
}
