import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  Packer,
  BorderStyle,
  WidthType,
  ShadingType,
} from "docx";
import type { DocumentIR, DocumentConversionOptions } from "../types";

export async function generateDocx(
  doc: DocumentIR,
  options: DocumentConversionOptions = {}
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];
  const font = options.docxFontFamily === "serif" ? "Georgia" : options.docxFontFamily === "mono" ? "Courier New" : "Arial";

  // Document Title
  if (doc.title) {
    children.push(
      new Paragraph({
        text: doc.title,
        heading: HeadingLevel.TITLE,
        spacing: { after: 240 },
      })
    );
  }

  // Iterate over sections
  for (const section of doc.sections) {
    switch (section.type) {
      case "heading": {
        let headingLevel: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1;
        if (section.level === 2) headingLevel = HeadingLevel.HEADING_2;
        if (section.level === 3) headingLevel = HeadingLevel.HEADING_3;
        if (section.level >= 4) headingLevel = HeadingLevel.HEADING_4;

        children.push(
          new Paragraph({
            text: section.text,
            heading: headingLevel,
            spacing: { before: 240, after: 120 },
          })
        );
        break;
      }

      case "paragraph": {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.text,
                font,
                size: 22, // 11pt
              }),
            ],
            spacing: { after: 140, line: 276 },
          })
        );
        break;
      }

      case "list": {
        section.items.forEach((item, idx) => {
          const bullet = section.ordered ? `${idx + 1}. ` : "• ";
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: bullet,
                  bold: true,
                  font,
                  size: 22,
                }),
                new TextRun({
                  text: item,
                  font,
                  size: 22,
                }),
              ],
              indent: { left: 400 },
              spacing: { after: 80 },
            })
          );
        });
        break;
      }

      case "table": {
        if (section.headers.length === 0 && section.rows.length === 0) break;

        const tableRows: TableRow[] = [];

        // Header Row
        if (section.headers.length > 0) {
          tableRows.push(
            new TableRow({
              tableHeader: true,
              children: section.headers.map(
                (h) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: h,
                            bold: true,
                            font,
                            size: 20,
                            color: "0F172A",
                          }),
                        ],
                      }),
                    ],
                    shading: {
                      type: ShadingType.CLEAR,
                      fill: "F1F5F9",
                    },
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                  })
              ),
            })
          );
        }

        // Data Rows
        section.rows.forEach((row, rIdx) => {
          tableRows.push(
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: String(cell ?? ""),
                            font,
                            size: 20,
                            color: "334155",
                          }),
                        ],
                      }),
                    ],
                    shading:
                      rIdx % 2 === 1
                        ? {
                            type: ShadingType.CLEAR,
                            fill: "F8FAFC",
                          }
                        : undefined,
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                  })
              ),
            })
          );
        });

        children.push(
          new Table({
            rows: tableRows,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          })
        );
        children.push(new Paragraph({ spacing: { after: 180 } }));
        break;
      }

      case "code": {
        const lines = section.code.split("\n");
        children.push(
          new Paragraph({
            children: lines.map(
              (line, idx) =>
                new TextRun({
                  text: line,
                  font: "Courier New",
                  size: 19,
                  break: idx > 0 ? 1 : 0,
                })
            ),
            shading: {
              type: ShadingType.CLEAR,
              fill: "F1F5F9",
            },
            spacing: { before: 120, after: 160 },
          })
        );
        break;
      }

      case "blockquote": {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.text,
                italics: true,
                font,
                size: 22,
                color: "475569",
              }),
            ],
            indent: { left: 500 },
            border: {
              left: {
                color: "94A3B8",
                space: 12,
                style: BorderStyle.SINGLE,
                size: 16,
              },
            },
            spacing: { before: 120, after: 160 },
          })
        );
        break;
      }

      case "slide": {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.title,
                bold: true,
                font,
                size: 26,
              }),
            ],
            spacing: { before: 240, after: 120 },
          })
        );
        section.points.forEach((pt) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "• " + pt,
                  font,
                  size: 22,
                }),
              ],
              indent: { left: 400 },
              spacing: { after: 80 },
            })
          );
        });
        break;
      }

      case "divider": {
        children.push(
          new Paragraph({
            border: {
              bottom: {
                color: "E2E8F0",
                space: 8,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 160, after: 160 },
          })
        );
        break;
      }
    }
  }

  const docxDoc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(docxDoc);
  return blob.slice(
    0,
    blob.size,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}
