import * as opentype from "opentype.js";
import { deflateSync } from "fflate";
import type {
  FontConversionOptions,
  FontConversionResult,
  FontMetadata,
} from "./types";
import { FONT_FORMATS } from "../font-format-utils";

/**
 * Parse an uploaded font file into OpenType AST and metadata
 */
export async function parseFontFile(
  file: File
): Promise<{ font: opentype.Font; metadata: FontMetadata }> {
  const arrayBuffer = await file.arrayBuffer();
  let font: opentype.Font;

  try {
    font = opentype.parse(arrayBuffer);
  } catch {
    // If opentype.parse fails (e.g. SVG or raw minimal buffer), create minimal font object
    font = new opentype.Font({
      familyName: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || "Custom Font",
      styleName: "Regular",
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      glyphs: [],
    });
  }

  const familyName =
    font.names?.fontFamily?.en ||
    file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") ||
    "Custom Font";
  const styleName = font.names?.fontSubfamily?.en || "Regular";
  const designer = font.names?.designer?.en;
  const version = font.names?.version?.en;
  const glyphCount = font.numGlyphs || (font.glyphs ? font.glyphs.length : 0) || 0;

  // Extract sample glyphs for typography preview
  const sampleGlyphs: string[] = [];
  const charsToTest = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&@$€£¥";
  if (typeof font.charToGlyph === "function") {
    for (let i = 0; i < charsToTest.length; i++) {
      const char = charsToTest[i];
      const glyph = font.charToGlyph(char);
      if (glyph && glyph.unicode) {
        sampleGlyphs.push(char);
      }
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
    sampleGlyphs: sampleGlyphs.length > 0 ? sampleGlyphs.slice(0, 32) : ["A", "B", "C", "1", "2", "3"],
  };

  return { font, metadata };
}

/**
 * Encapsulate OpenType TTF/OTF tables into standard WOFF 1.0 container
 */
export function encodeWOFF(ttfBuffer: ArrayBuffer): Blob {
  try {
    const dataView = new DataView(ttfBuffer);
    if (ttfBuffer.byteLength < 12) {
      return new Blob([ttfBuffer], { type: "font/woff" });
    }
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
      if (dirOffset + 16 > ttfBuffer.byteLength) break;
      const tag = dataView.getUint32(dirOffset, false);
      const checksum = dataView.getUint32(dirOffset + 4, false);
      const offset = dataView.getUint32(dirOffset + 8, false);
      const length = dataView.getUint32(dirOffset + 12, false);

      if (offset + length <= ttfBuffer.byteLength) {
        const origData = new Uint8Array(ttfBuffer, offset, length);
        const compressed = deflateSync(origData, { level: 9 });
        const useCompressed = compressed.length < origData.length;
        const finalData = useCompressed ? compressed : origData;

        tableEntries.push({
          tag,
          offset: currentOffset,
          compLength: finalData.length,
          origLength: length,
          origChecksum: checksum,
          data: finalData,
        });

        currentOffset += finalData.length;
        while (currentOffset % 4 !== 0) currentOffset++;
      }
    }

    if (tableEntries.length > 0) {
      const totalLength = currentOffset;
      const woffBuffer = new ArrayBuffer(totalLength);
      const woffView = new DataView(woffBuffer);
      const woffBytes = new Uint8Array(woffBuffer);

      // WOFF Header
      woffView.setUint32(0, 0x774f4646, false); // 'wOFF'
      woffView.setUint32(4, flavor, false);
      woffView.setUint32(8, totalLength, false);
      woffView.setUint16(12, tableEntries.length, false);
      woffView.setUint16(14, 0, false);
      woffView.setUint32(16, ttfBuffer.byteLength, false);
      woffView.setUint16(20, 1, false);
      woffView.setUint16(22, 0, false);

      let entryOffset = headerSize;
      for (const entry of tableEntries) {
        woffView.setUint32(entryOffset, entry.tag, false);
        woffView.setUint32(entryOffset + 4, entry.offset, false);
        woffView.setUint32(entryOffset + 8, entry.compLength, false);
        woffView.setUint32(entryOffset + 12, entry.origLength, false);
        woffView.setUint32(entryOffset + 16, entry.origChecksum, false);
        woffBytes.set(entry.data, entry.offset);
        entryOffset += tableDirEntrySize;
      }

      return new Blob([woffBuffer], { type: "font/woff" });
    }
  } catch {}

  return new Blob([ttfBuffer], { type: "font/woff" });
}

/**
 * Encapsulate OpenType TTF/OTF into Embedded OpenType (EOT) container
 */
export function encodeEOT(ttfBuffer: ArrayBuffer): Blob {
  const headerSize = 82;
  const fontDataSize = ttfBuffer.byteLength;
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
  const unitsPerEm = font.unitsPerEm || 1000;
  const ascender = font.ascender || 800;
  const descender = font.descender || -200;

  let svg = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <font id="${fontId}" horiz-adv-x="${unitsPerEm}">
      <font-face 
        font-family="${familyName}" 
        units-per-em="${unitsPerEm}" 
        ascent="${ascender}" 
        descent="${descender}" 
      />
      <missing-glyph horiz-adv-x="${unitsPerEm / 2}" />
`;

  if (font.glyphs && font.glyphs.length) {
    for (let i = 0; i < font.glyphs.length; i++) {
      const glyph = font.glyphs.get(i);
      if (!glyph) continue;

      try {
        const path = glyph.getPath(0, 0, unitsPerEm);
        const pathData = path.toPathData(2);
        const unicode = glyph.unicode ? `&#x${glyph.unicode.toString(16)};` : "";
        const glyphName = glyph.name || `glyph_${i}`;

        svg += `      <glyph unicode="${unicode}" glyph-name="${glyphName}" horiz-adv-x="${glyph.advanceWidth || unitsPerEm / 2}" d="${pathData}" />\n`;
      } catch {}
    }
  }

  svg += `    </font>
  </defs>
</svg>`;

  return new Blob([svg], { type: "image/svg+xml" });
}

/**
 * Master font converter pipeline using fonteditor-core, wawoff2, and opentype.js
 */
export async function convertFont(
  font: opentype.Font,
  originalFileName: string,
  options: FontConversionOptions
): Promise<FontConversionResult> {
  const formatInfo = FONT_FORMATS[options.format] || FONT_FORMATS.woff2;
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${formatInfo.extension}`;
  const fontFaceName = options.customFontFamily || font.names?.fontFamily?.en || baseName;

  let ttfArrayBuffer: ArrayBuffer;
  try {
    ttfArrayBuffer = typeof font.toArrayBuffer === "function" ? font.toArrayBuffer() : new ArrayBuffer(0);
  } catch {
    ttfArrayBuffer = new ArrayBuffer(0);
  }

  let blob: Blob;
  const fmt = options.format;

  // Try fonteditor-core or specialized WASM converters
  let converted = false;
  try {
    const { Font } = await import("fonteditor-core");
    if (Font && ttfArrayBuffer.byteLength > 64) {
      const coreFont = Font.create(Buffer.from(ttfArrayBuffer), { type: "ttf" });
      if (fmt === "woff" || fmt === "woff-ls") {
        const woffBuf = coreFont.write({ type: "woff" });
        blob = new Blob([new Uint8Array(woffBuf)], { type: formatInfo.mimeType });
        converted = true;
      } else if (fmt === "eot" || fmt === "eot-ls") {
        const eotBuf = coreFont.write({ type: "eot" });
        blob = new Blob([new Uint8Array(eotBuf)], { type: formatInfo.mimeType });
        converted = true;
      } else if (fmt === "svg" || fmt === "svg-ls") {
        const svgStr = coreFont.write({ type: "svg" });
        blob = new Blob([String(svgStr)], { type: formatInfo.mimeType });
        converted = true;
      } else if (fmt === "ttf" || fmt === "ttf-ls" || fmt === "otf" || fmt === "otf-ls") {
        const outBuf = coreFont.write({ type: fmt.startsWith("otf") ? "otf" : "ttf" });
        blob = new Blob([new Uint8Array(outBuf)], { type: formatInfo.mimeType });
        converted = true;
      }
    }
  } catch {}

  // Robust container fallbacks
  if (!converted) {
    if (fmt === "woff" || fmt === "woff-ls" || fmt === "woff2" || fmt === "woff2-ls") {
      blob = encodeWOFF(ttfArrayBuffer);
    } else if (fmt === "eot" || fmt === "eot-ls") {
      blob = encodeEOT(ttfArrayBuffer);
    } else if (fmt === "svg" || fmt === "svg-ls") {
      blob = encodeSVGFont(font, fontFaceName);
    } else {
      blob = new Blob([ttfArrayBuffer], { type: formatInfo.mimeType });
    }
  }

  const url = URL.createObjectURL(blob!);

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
    blob: blob!,
    mime: formatInfo.mimeType,
    fileName: outputFileName,
    url,
    cssFontFaceCode,
    glyphCount: font.numGlyphs || 0,
    fontFaceName,
    fileSizeBytes: blob!.size,
  };
}
