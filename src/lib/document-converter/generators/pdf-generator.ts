import { jsPDF } from "jspdf";
import type { DocumentIR, DocumentConversionOptions } from "../types";

function sanitizeClonedDoc(clonedDoc: Document) {
  const styleTags = clonedDoc.querySelectorAll("style, link[rel='stylesheet']");
  styleTags.forEach((tag) => {
    if (tag.textContent && (tag.textContent.includes("lab(") || tag.textContent.includes("oklch(") || tag.textContent.includes("oklab("))) {
      tag.textContent = tag.textContent
        .replace(/lab\([^)]+\)/gi, "rgb(15, 23, 42)")
        .replace(/oklch\([^)]+\)/gi, "rgb(15, 23, 42)")
        .replace(/oklab\([^)]+\)/gi, "rgb(15, 23, 42)");
    }
  });
}

let cachedDocxWasmModule: WebAssembly.Module | null = null;

/**
 * Fetch and compile the docx-to-pdf.wasm binary once and cache the WebAssembly.Module
 */
export async function getDocxToPdfWasmModule(): Promise<WebAssembly.Module | null> {
  if (cachedDocxWasmModule) return cachedDocxWasmModule;
  try {
    if (typeof window !== "undefined") {
      const resp = await fetch("/docx-to-pdf.wasm");
      if (resp.ok) {
        const buf = await resp.arrayBuffer();
        cachedDocxWasmModule = await WebAssembly.compile(buf);
        return cachedDocxWasmModule;
      }
    } else {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const wasmPath = path.join(process.cwd(), "public", "docx-to-pdf.wasm");
      const buf = await fs.readFile(wasmPath);
      cachedDocxWasmModule = await WebAssembly.compile(buf);
      return cachedDocxWasmModule;
    }
  } catch (err) {
    console.warn("Could not load / compile docx-to-pdf.wasm:", err);
  }
  return null;
}

/**
 * Pure client-side WASM DOCX to PDF conversion using docx-to-pdf-wasm
 */
export async function convertDocxToPdfWasm(
  rawBuffer: ArrayBuffer
): Promise<Blob | null> {
  try {
    const wasmModule = await getDocxToPdfWasmModule();
    if (!wasmModule) return null;

    const { convertToPdf } = await import("docx-to-pdf-wasm");
    const pdfBytes = await convertToPdf(wasmModule, new Uint8Array(rawBuffer));
    if (pdfBytes && pdfBytes.length > 0) {
      return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    }
  } catch (err) {
    console.warn("docx-to-pdf-wasm conversion error, falling back to DOM / IR renderer:", err);
  }
  return null;
}

/**
 * High-fidelity client-side DOCX rendering via docx-preview + html2canvas
 * Captures all Microsoft Word typography, tables, borders, colors, and layout directly.
 */
async function renderDocxToPdfViaDom(
  rawBuffer: ArrayBuffer,
  options: DocumentConversionOptions
): Promise<Blob | null> {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return null;
  }

  try {
    const docx = await import("docx-preview");
    const html2canvas = (await import("html2canvas")).default;

    // Create an isolated container attached to DOM with visible rendering properties for canvas
    const wrapper = document.createElement("div");
    wrapper.id = "docx-pdf-render-wrapper";
    wrapper.style.position = "fixed";
    wrapper.style.left = "0px";
    wrapper.style.top = "0px";
    wrapper.style.width = "900px";
    wrapper.style.background = "#ffffff";
    wrapper.style.zIndex = "-9999";
    wrapper.style.pointerEvents = "none";
    wrapper.style.opacity = "1";
    wrapper.style.overflow = "visible";

    const styleOverride = document.createElement("style");
    styleOverride.textContent = `
      #docx-pdf-render-wrapper .docx-wrapper { background: #ffffff !important; padding: 0 !important; }
      #docx-pdf-render-wrapper section.docx { box-shadow: none !important; margin: 0 auto 40px auto !important; background: #ffffff !important; }
      #docx-pdf-render-wrapper table { border-collapse: collapse !important; }
    `;
    wrapper.appendChild(styleOverride);

    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.background = "#ffffff";
    wrapper.appendChild(container);

    document.body.appendChild(wrapper);

    try {
      await docx.renderAsync(rawBuffer, container, undefined, {
        className: "docx",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        experimental: true,
        trimXmlDeclaration: true,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        useBase64URL: true,
      });

      // Wait a microtick for fonts and layout geometry to compute
      await new Promise((resolve) => setTimeout(resolve, 120));

      const pageElements = container.querySelectorAll<HTMLElement>("section.docx, .docx-wrapper > section");

      const orientation = options.pdfOrientation || "portrait";
      const format = options.pdfPageSize || "a4";

      if (pageElements.length > 0) {
        const pdf = new jsPDF({
          orientation,
          unit: "pt",
          format,
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < pageElements.length; i++) {
          const pageEl = pageElements[i];
          if (i > 0) {
            pdf.addPage();
          }

          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            onclone: (clonedDoc) => {
              sanitizeClonedDoc(clonedDoc);
              // Copy all generated stylesheet rules into cloned document so styles are 100% retained
              const styles = container.querySelectorAll("style");
              styles.forEach((st) => clonedDoc.head.appendChild(st.cloneNode(true)));
              const parentStyles = wrapper.querySelectorAll("style");
              parentStyles.forEach((st) => clonedDoc.head.appendChild(st.cloneNode(true)));
            },
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.98);
          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
        }

        return pdf.output("blob");
      }
    } finally {
      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
    }
  } catch (err) {
    console.warn("docx-preview DOM rendering error, falling back to rich HTML rendering:", err);
  }
  return null;
}
/**
 * High-fidelity rich HTML to PDF renderer preserving styles, bold, italic, tables, colors, and layout
 */
async function renderHtmlToPdf(
  html: string,
  docTitle: string,
  options: DocumentConversionOptions
): Promise<Blob | null> {
  if (typeof document === "undefined" || typeof window === "undefined" || !html.trim()) {
    return null;
  }

  try {
    const html2canvas = (await import("html2canvas")).default;

    const orientation = options.pdfOrientation || "portrait";
    const format = options.pdfPageSize || "a4";
    const pdf = new jsPDF({
      orientation,
      unit: "pt",
      format,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = options.pdfMargins === "compact" ? 24 : options.pdfMargins === "wide" ? 48 : 36;
    const printWidth = pdfWidth - margin * 2;

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "0px";
    wrapper.style.top = "0px";
    wrapper.style.width = `${Math.round(printWidth * (96 / 72))}px`;
    wrapper.style.background = "#ffffff";
    wrapper.style.color = "#0f172a";
    wrapper.style.zIndex = "-9999";
    wrapper.style.pointerEvents = "none";
    wrapper.style.opacity = "1";
    wrapper.style.padding = "10px";
    wrapper.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    wrapper.style.fontSize = "14px";
    wrapper.style.lineHeight = "1.6";

    wrapper.innerHTML = `
      <style>
        h1, h2, h3, h4, h5, h6 { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; color: #0f172a; margin-top: 1.2em; margin-bottom: 0.5em; line-height: 1.3; }
        h1 { font-size: 24px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px; }
        h2 { font-size: 19px; }
        h3 { font-size: 16px; }
        h4 { font-size: 14px; }
        p { margin-bottom: 0.8em; color: #334155; }
        strong, b { font-weight: 700; color: #0f172a; }
        em, i { font-style: italic; }
        u { text-decoration: underline; }
        s, strike, del { text-decoration: line-through; }
        table { width: 100%; border-collapse: collapse; margin: 1.2em 0; font-size: 13px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; vertical-align: top; }
        th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
        tr:nth-child(even) { background: #f8fafc; }
        ul, ol { margin: 0.8em 0; padding-left: 24px; color: #334155; }
        li { margin-bottom: 0.3em; }
        blockquote { border-left: 4px solid #94a3b8; padding: 4px 0 4px 14px; color: #475569; font-style: italic; margin: 1.2em 0; }
        code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; background: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-size: 12px; color: #e11d48; }
        pre { background: #f1f5f9; padding: 12px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 12px; }
        img { max-width: 100%; height: auto; margin: 1em auto; display: block; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0; }
      </style>
      ${html}
    `;

    document.body.appendChild(wrapper);

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));

      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => sanitizeClonedDoc(clonedDoc),
      });

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      const renderW = printWidth;
      const renderH = (imgHeightPx * renderW) / imgWidthPx;
      const printHeight = pdfHeight - margin * 2;

      let yPos = 0;
      let pageNum = 0;

      while (yPos < renderH) {
        if (pageNum > 0) {
          pdf.addPage();
        }

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = imgWidthPx;
        const sliceHeightPx = Math.min(
          imgHeightPx - (yPos / renderH) * imgHeightPx,
          (printHeight / renderW) * imgWidthPx
        );
        sliceCanvas.height = sliceHeightPx;
        const sCtx = sliceCanvas.getContext("2d")!;
        sCtx.drawImage(
          canvas,
          0,
          (yPos / renderH) * imgHeightPx,
          imgWidthPx,
          sliceHeightPx,
          0,
          0,
          imgWidthPx,
          sliceHeightPx
        );

        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.98);
        const sliceRenderH = (sliceHeightPx * renderW) / imgWidthPx;

        pdf.addImage(sliceData, "JPEG", margin, margin, renderW, sliceRenderH, undefined, "FAST");

        yPos += printHeight;
        pageNum++;
      }

      return pdf.output("blob");
    } finally {
      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
    }
  } catch (err) {
    console.warn("renderHtmlToPdf error:", err);
    return null;
  }
}

/**
 * Standard IR-based PDF generator with support for text, images, tables, lists, codes, headers & footers
 */
function generatePdfFromIR(
  doc: DocumentIR,
  options: DocumentConversionOptions = {}
): Blob {
  const orientation = options.pdfOrientation || "portrait";
  const format = options.pdfPageSize || "a4";
  const baseFontSize = options.pdfFontSize || 11;
  const showPageNumbers = options.pdfPageNumbers ?? false;
  const showHeader = options.pdfHeaderTitle ?? true;

  const pdf = new jsPDF({
    orientation,
    unit: "pt",
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

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

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(30, 30, 30);

  // Render Document Title
  if (doc.title) {
    checkPageBreak(40);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(baseFontSize + 9);
    pdf.setTextColor(15, 23, 42);
    const titleLines = pdf.splitTextToSize(doc.title, contentWidth);
    pdf.text(titleLines, margin, currentY);
    currentY += titleLines.length * (baseFontSize + 11) + 12;

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.75);
    pdf.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 16;
  }

  // Iterate over sections
  for (const section of doc.sections) {
    switch (section.type) {
      case "image": {
        if (section.src) {
          const maxW = contentWidth;
          const maxH = pageHeight - margin * 2.5;
          const imgW = section.width || 800;
          const imgH = section.height || 600;
          const scale = Math.min(maxW / imgW, maxH / imgH);
          const renderW = imgW * scale;
          const renderH = imgH * scale;

          checkPageBreak(renderH + 10);
          const imgX = margin + (contentWidth - renderW) / 2;
          try {
            const format = section.src.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
            pdf.addImage(section.src, format, imgX, currentY, renderW, renderH, undefined, "FAST");
            currentY += renderH + 12;
          } catch {
            pdf.text(`[Image: ${section.alt || "Embedded Image"}]`, margin, currentY + 12);
            currentY += 24;
          }
        }
        break;
      }

      case "heading": {
        const sizeIncrement = Math.max(1, 7 - section.level * 1.5);
        const headingSize = baseFontSize + sizeIncrement;
        checkPageBreak(headingSize * 2.2 + 10);

        currentY += 6;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(headingSize);
        pdf.setTextColor(30, 41, 59);

        const headingLines = pdf.splitTextToSize(section.text, contentWidth);
        pdf.text(headingLines, margin, currentY);
        currentY += headingLines.length * (headingSize + 4) + 6;
        break;
      }

      case "paragraph": {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(baseFontSize);
        pdf.setTextColor(51, 65, 85);

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

          pdf.setFont("helvetica", "bold");
          pdf.text(bullet, margin + 4, currentY);
          pdf.setFont("helvetica", "normal");

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

        checkPageBreak(rowHeight * 2);

        // Header Row
        if (section.headers.length > 0) {
          pdf.setFillColor(241, 245, 249);
          pdf.rect(margin, currentY, contentWidth, rowHeight, "F");

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(baseFontSize - 1);
          pdf.setTextColor(15, 23, 42);

          section.headers.forEach((h, colIdx) => {
            const x = margin + colIdx * colWidth + cellPadding;
            const text = pdf.splitTextToSize(h, colWidth - cellPadding * 2)[0] || "";
            pdf.text(text, x, currentY + rowHeight / 2 + (baseFontSize - 1) / 3);
          });

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
            pdf.setFillColor(248, 250, 252);
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

        pdf.setDrawColor(148, 163, 184);
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
    pdf.setTextColor(148, 163, 184);

    if (showHeader && doc.title) {
      pdf.text(doc.title, margin, margin - 10);
      pdf.setDrawColor(241, 245, 249);
      pdf.setLineWidth(0.5);
      pdf.line(margin, margin - 5, margin + contentWidth, margin - 5);
    }

    if (showPageNumbers) {
      const footerText = `${i} / ${totalPages}`;
      const textWidth = pdf.getTextWidth(footerText);
      pdf.text(footerText, margin + contentWidth - textWidth, pageHeight - margin + 14);
      pdf.text("wild · client-side wasm engine", margin, pageHeight - margin + 14);
    }
  }

  return pdf.output("blob");
}

export async function generatePdf(
  doc: DocumentIR,
  options: DocumentConversionOptions = {}
): Promise<Blob> {
  // 1. If DOCX document with rawBuffer, convert using docx-to-pdf-wasm WASM engine!
  if (doc.sourceFormat === "docx" && doc.rawBuffer) {
    const wasmPdfBlob = await convertDocxToPdfWasm(doc.rawBuffer);
    if (wasmPdfBlob) return wasmPdfBlob;
  }

  // 2. If DOCX document with rawBuffer and DOM available, use docx-preview rendering
  if (doc.sourceFormat === "docx" && doc.rawBuffer && typeof document !== "undefined") {
    const domPdfBlob = await renderDocxToPdfViaDom(doc.rawBuffer, options);
    if (domPdfBlob) return domPdfBlob;
  }

  // 2. If DOCX or rich document has HTML and DOM available, use rich HTML capture
  if (doc.html && doc.html.length > 50 && typeof document !== "undefined") {
    const htmlPdfBlob = await renderHtmlToPdf(doc.html, doc.title, options);
    if (htmlPdfBlob) return htmlPdfBlob;
  }

  // 3. If single image document, produce fitted image PDF on the SELECTED page size and orientation
  const singleImageSection = doc.sections.length === 1 && doc.sections[0].type === "image" ? doc.sections[0] : null;
  if (singleImageSection && singleImageSection.src) {
    const orientation = options.pdfOrientation || "portrait";
    const format = options.pdfPageSize || "a4";
    const pdf = new jsPDF({
      orientation,
      unit: "pt",
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let margin = 40;
    if (options.pdfMargins === "compact") margin = 28;
    if (options.pdfMargins === "wide") margin = 56;

    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    const imgW = singleImageSection.width || 800;
    const imgH = singleImageSection.height || 600;

    const scale = Math.min(printableWidth / imgW, printableHeight / imgH);
    const renderW = imgW * scale;
    const renderH = imgH * scale;

    const imgX = margin + (printableWidth - renderW) / 2;
    const imgY = margin + (printableHeight - renderH) / 2;
    try {
      if (!singleImageSection.src.startsWith("data:image/svg")) {
        const formatType = singleImageSection.src.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
        pdf.addImage(singleImageSection.src, formatType, imgX, imgY, renderW, renderH, undefined, "FAST");
        return pdf.output("blob");
      }
    } catch { }
  }

  return generatePdfFromIR(doc, options);
}
