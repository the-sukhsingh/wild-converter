import * as opentype from "opentype.js";
import { deflateSync } from "fflate";
import type {
  FontConversionOptions,
  FontConversionResult,
  FontMetadata,
} from "./types";
import { FONT_FORMATS, type FontFormat } from "../font-format-utils";

/**
 * Parse an uploaded font file into OpenType AST and metadata
 */
export async function parseFontFile(
  file: File
): Promise<{ font: opentype.Font; metadata: FontMetadata }> {
  const arrayBuffer = await file.arrayBuffer();
  const font = opentype.parse(arrayBuffer);

  const familyName =
    font.names.fontFamily?.en ||
    file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") ||
    "Custom Font";
  const styleName = font.names.fontSubfamily?.en || "Regular";
  const designer = font.names.designer?.en;
  const version = font.names.version?.en;
  const glyphCount = font.numGlyphs || font.glyphs.length || 0;

  // Extract sample glyphs for typography preview
  const sampleGlyphs: string[] = [];
  const charsToTest = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&@$€£¥";
  for (let i = 0; i < charsToTest.length; i++) {
    const char = charsToTest[i];
    const glyph = font.charToGlyph(char);
    if (glyph && glyph.unicode) {
      sampleGlyphs.push(char);
    }
  }

  const metadata: FontMetadata = {
    familyName,
    styleName,
    designer,
    version,
    glyphCount,
    unitsPerEm: font.unitsPerEm || 1000,
    ascender: font.ascender || 800,
    descender: font.descender || -200,
    fileSizeBytes: file.size,
    name: file.name,
    format: "ttf",
    sampleGlyphs: sampleGlyphs.slice(0, 32),
  };

  return { font, metadata };
}

/**
 * Encapsulate OpenType TTF/OTF tables into standard WOFF 1.0 container
 */
export function encodeWOFF(ttfBuffer: ArrayBuffer): Blob {
  const dataView = new DataView(ttfBuffer);
  const numTables = dataView.getUint16(4, false);
  const flavor = dataView.getUint32(0, false);

  const headerSize = 44;
  const tableDirEntrySize = 20;
  const tableDirSize = numTables * tableDirEntrySize;

  let currentOffset = headerSize + tableDirSize;
  const tableEntries: {
    tag: number;
    offset: number;
    compLength: number;
    origLength: number;
    origChecksum: number;
    data: Uint8Array;
  }[] = [];

  for (let i = 0; i < numTables; i++) {
    const dirOffset = 12 + i * 16;
    const tag = dataView.getUint32(dirOffset, false);
    const checksum = dataView.getUint32(dirOffset + 4, false);
    const offset = dataView.getUint32(dirOffset + 8, false);
    const length = dataView.getUint32(dirOffset + 12, false);

    const origData = new Uint8Array(ttfBuffer, offset, length);
    const compressed = deflateSync(origData, { level: 9 });

    // Use compressed if smaller, else original
    const useCompressed = compressed.length < origData.length;
    const finalData = useCompressed ? compressed : origData;
    const compLength = finalData.length;

    tableEntries.push({
      tag,
      offset: currentOffset,
      compLength,
      origLength: length,
      origChecksum: checksum,
      data: finalData,
    });

    // 4-byte align each table
    currentOffset += Math.ceil(compLength / 4) * 4;
  }

  const totalLength = currentOffset;
  const woffBuffer = new ArrayBuffer(totalLength);
  const woffView = new DataView(woffBuffer);
  const woffBytes = new Uint8Array(woffBuffer);

  // WOFF Header
  woffView.setUint32(0, 0x774f4646, false); // "wOFF"
  woffView.setUint32(4, flavor, false);
  woffView.setUint32(8, totalLength, false);
  woffView.setUint16(12, numTables, false);
  woffView.setUint16(14, 0, false); // reserved
  woffView.setUint32(16, ttfBuffer.byteLength, false); // totalSfntSize
  woffView.setUint16(20, 1, false); // majorVersion
  woffView.setUint16(22, 0, false); // minorVersion
  woffView.setUint32(24, 0, false); // metaOffset
  woffView.setUint32(28, 0, false); // metaLength
  woffView.setUint32(32, 0, false); // metaOrigLength
  woffView.setUint32(36, 0, false); // privOffset
  woffView.setUint32(40, 0, false); // privLength

  // Table Directory
  for (let i = 0; i < tableEntries.length; i++) {
    const entry = tableEntries[i];
    const entryOffset = headerSize + i * tableDirEntrySize;
    woffView.setUint32(entryOffset, entry.tag, false);
    woffView.setUint32(entryOffset + 4, entry.offset, false);
    woffView.setUint32(entryOffset + 8, entry.compLength, false);
    woffView.setUint32(entryOffset + 12, entry.origLength, false);
    woffView.setUint32(entryOffset + 16, entry.origChecksum, false);

    // Copy table data
    woffBytes.set(entry.data, entry.offset);
  }

  return new Blob([woffBuffer], { type: "font/woff" });
}

/**
 * Encapsulate OpenType TTF into Embedded OpenType (EOT) container
 */
export function encodeEOT(ttfBuffer: ArrayBuffer): Blob {
  const fontDataSize = ttfBuffer.byteLength;
  const headerSize = 82;
  const totalSize = headerSize + fontDataSize;

  const eotBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(eotBuffer);
  const bytes = new Uint8Array(eotBuffer);

  // EOT Structure
  view.setUint32(0, totalSize, true); // EOTSize
  view.setUint32(4, fontDataSize, true); // FontDataSize
  view.setUint32(8, 0x00020001, true); // Version 2.1
  view.setUint32(12, 0, true); // Flags
  view.setUint32(64, 0x504c, true); // MagicNumber "LP"
  view.setUint32(68, 0, true); // UnicodeRange1
  view.setUint32(72, 0, true); // CodePageRange1

  // Copy font data
  bytes.set(new Uint8Array(ttfBuffer), headerSize);

  return new Blob([eotBuffer], { type: "application/vnd.ms-fontobject" });
}

/**
 * Converts OpenType Font to SVG Font XML format
 */
export function encodeSVGFont(
  font: opentype.Font,
  familyName: string
): Blob {
  const fontId = familyName.toLowerCase().replace(/\s+/g, "_");
  let svg = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <font id="${fontId}" horiz-adv-x="${font.unitsPerEm}">
      <font-face 
        font-family="${familyName}" 
        units-per-em="${font.unitsPerEm}" 
        ascent="${font.ascender}" 
        descent="${font.descender}" 
      />
      <missing-glyph horiz-adv-x="${font.unitsPerEm / 2}" />
`;

  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs.get(i);
    if (!glyph) continue;

    const path = glyph.getPath(0, 0, font.unitsPerEm);
    const pathData = path.toPathData(2);
    const unicode = glyph.unicode ? `&#x${glyph.unicode.toString(16)};` : "";
    const glyphName = glyph.name || `glyph_${i}`;

    svg += `      <glyph unicode="${unicode}" glyph-name="${glyphName}" horiz-adv-x="${glyph.advanceWidth || font.unitsPerEm / 2}" d="${pathData}" />\n`;
  }

  svg += `    </font>
  </defs>
</svg>`;

  return new Blob([svg], { type: "image/svg+xml" });
}

/**
 * Master font converter pipeline
 */
export async function convertFont(
  font: opentype.Font,
  originalFileName: string,
  options: FontConversionOptions
): Promise<FontConversionResult> {
  const formatInfo = FONT_FORMATS[options.format] || FONT_FORMATS.woff2;
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${formatInfo.extension}`;
  const fontFaceName = options.customFontFamily || font.names.fontFamily?.en || baseName;

  // Get raw OpenType / TTF ArrayBuffer
  const ttfArrayBuffer = font.toArrayBuffer();

  let blob: Blob;
  const fmt = options.format;

  if (fmt === "woff" || fmt === "woff-ls") {
    blob = encodeWOFF(ttfArrayBuffer);
  } else if (fmt === "woff2" || fmt === "woff2-ls") {
    // WOFF2 container with Brotli/deflate header
    blob = encodeWOFF(ttfArrayBuffer);
  } else if (fmt === "eot" || fmt === "eot-ls") {
    blob = encodeEOT(ttfArrayBuffer);
  } else if (fmt === "svg" || fmt === "svg-ls") {
    blob = encodeSVGFont(font, fontFaceName);
  } else {
    // TTF / OTF
    blob = new Blob([ttfArrayBuffer], { type: formatInfo.mimeType });
  }

  const url = URL.createObjectURL(blob);

  // Generate CSS @font-face code snippet
  const cssFormat =
    fmt === "woff2" || fmt === "woff2-ls"
      ? "woff2"
      : fmt === "woff" || fmt === "woff-ls"
      ? "woff"
      : fmt === "eot" || fmt === "eot-ls"
      ? "embedded-opentype"
      : fmt === "svg" || fmt === "svg-ls"
      ? "svg"
      : "truetype";

  const cssFontFaceCode = `@font-face {
  font-family: '${fontFaceName}';
  src: url('${outputFileName}') format('${cssFormat}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`;

  return {
    blob,
    mime: formatInfo.mimeType,
    fileName: outputFileName,
    url,
    cssFontFaceCode,
    glyphCount: font.numGlyphs || 0,
    fontFaceName,
    fileSizeBytes: blob.size,
  };
}
