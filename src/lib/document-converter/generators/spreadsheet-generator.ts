import * as XLSX from "xlsx";
import type { DocumentIR, DocumentConversionOptions } from "../types";

export async function generateSpreadsheet(
  doc: DocumentIR,
  format: "xlsx" | "xls" | "csv" | "ods",
  options: DocumentConversionOptions = {}
): Promise<Blob> {
  const workbook = XLSX.utils.book_new();

  if (doc.sheets && doc.sheets.length > 0) {
    // Export sheets
    doc.sheets.forEach((sheet, idx) => {
      const data: any[][] = [];
      if (sheet.headers && sheet.headers.length > 0 && options.csvIncludeHeaders !== false) {
        data.push(sheet.headers);
      }
      sheet.rows.forEach((r) => data.push(r));

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const name = sheet.name || `Sheet${idx + 1}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, name.slice(0, 31));
    });
  } else {
    // Collect tables or paragraphs from doc.sections
    const data: any[][] = [];
    let hasTables = false;

    doc.sections.forEach((section) => {
      if (section.type === "table") {
        hasTables = true;
        if (section.headers.length > 0 && options.csvIncludeHeaders !== false) {
          data.push(section.headers);
        }
        section.rows.forEach((r) => data.push(r));
        data.push([]); // blank separator row
      }
    });

    if (!hasTables) {
      // Fallback: line-by-line / paragraph-by-paragraph
      data.push(["Content", "Type"]);
      doc.sections.forEach((section) => {
        if (section.type === "heading") {
          data.push([section.text, `Heading ${section.level}`]);
        } else if (section.type === "paragraph") {
          data.push([section.text, "Paragraph"]);
        } else if (section.type === "list") {
          section.items.forEach((item) => data.push([item, "List Item"]));
        }
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  }

  let bookType: XLSX.BookType = "xlsx";
  let mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  switch (format) {
    case "csv": {
      bookType = "csv";
      mime = "text/csv";
      const firstSheetName = workbook.SheetNames[0] || "Sheet1";
      const firstSheet = workbook.Sheets[firstSheetName];
      const csvStr = XLSX.utils.sheet_to_csv(firstSheet, {
        FS: options.csvDelimiter || ",",
      });
      return new Blob([csvStr], { type: `${mime};charset=utf-8;` });
    }

    case "xls":
      bookType = "biff8";
      mime = "application/vnd.ms-excel";
      break;

    case "ods":
      bookType = "ods";
      mime = "application/vnd.oasis.opendocument.spreadsheet";
      break;

    case "xlsx":
    default:
      bookType = "xlsx";
      mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      break;
  }

  const outBuffer = XLSX.write(workbook, {
    bookType,
    type: "array",
  });

  return new Blob([outBuffer], { type: mime });
}
