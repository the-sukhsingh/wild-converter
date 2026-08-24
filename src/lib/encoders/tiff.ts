/**
 * Pure-TypeScript TIFF 6.0 encoder (Little-Endian uncompressed RGB / RGBA).
 * Outputs valid .tiff files compatible with standard viewers (Photoshop, macOS Preview, Windows Photo Viewer, GIMP).
 */
export function encodeTiff(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  hasAlpha = true
): Blob {
  const imageData = ctx.getImageData(0, 0, width, height);
  const rgba = imageData.data;
  const samplesPerPixel = hasAlpha ? 4 : 3;
  const bytesPerPixel = samplesPerPixel;
  const pixelDataBytes = width * height * bytesPerPixel;

  const numDirEntries = 12;
  const ifdOffset = 8;
  const ifdSize = 2 + numDirEntries * 12 + 4; // 2 (count) + 12*entries + 4 (next IFD)
  const extraDataOffset = ifdOffset + ifdSize;
  
  // Extra data needed:
  // - BitsPerSample: SHORT[3] (6 bytes) or SHORT[4] (8 bytes)
  // - XResolution: RATIONAL (8 bytes)
  // - YResolution: RATIONAL (8 bytes)
  // - ExtraSamples (if alpha): SHORT (2 bytes, inline)
  const bitsPerSampleSize = samplesPerPixel * 2;
  const xResOffset = extraDataOffset + bitsPerSampleSize;
  const yResOffset = xResOffset + 8;
  const imageOffset = (yResOffset + 8 + 3) & ~3; // 4-byte aligned
  
  const totalFileSize = imageOffset + pixelDataBytes;
  const buffer = new ArrayBuffer(totalFileSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // 1. TIFF Header (8 bytes, Little-Endian 'II')
  view.setUint8(0, 0x49); // 'I'
  view.setUint8(1, 0x49); // 'I'
  view.setUint16(2, 42, true); // TIFF magic 42
  view.setUint32(4, ifdOffset, true); // Offset to 1st IFD

  // 2. IFD Entry Builder
  let entryPos = ifdOffset;
  view.setUint16(entryPos, numDirEntries, true);
  entryPos += 2;

  function writeTag(tag: number, type: number, count: number, valueOrOffset: number) {
    view.setUint16(entryPos, tag, true);
    view.setUint16(entryPos + 2, type, true);
    view.setUint32(entryPos + 4, count, true);
    view.setUint32(entryPos + 8, valueOrOffset, true);
    entryPos += 12;
  }

  // Tags (must be in ascending tag order):
  // 256 (0x0100) ImageWidth (LONG)
  writeTag(0x0100, 4, 1, width);
  // 257 (0x0101) ImageLength (LONG)
  writeTag(0x0101, 4, 1, height);
  // 258 (0x0102) BitsPerSample (SHORT, count=samplesPerPixel)
  writeTag(0x0102, 3, samplesPerPixel, extraDataOffset);
  // 259 (0x0103) Compression (SHORT) = 1 (Uncompressed)
  writeTag(0x0103, 3, 1, 1);
  // 262 (0x0106) PhotometricInterpretation (SHORT) = 2 (RGB)
  writeTag(0x0106, 3, 1, 2);
  // 273 (0x0111) StripOffsets (LONG)
  writeTag(0x0111, 4, 1, imageOffset);
  // 277 (0x0115) SamplesPerPixel (SHORT)
  writeTag(0x0115, 3, 1, samplesPerPixel);
  // 278 (0x0116) RowsPerStrip (LONG)
  writeTag(0x0116, 4, 1, height);
  // 279 (0x0117) StripByteCounts (LONG)
  writeTag(0x0117, 4, 1, pixelDataBytes);
  // 282 (0x011A) XResolution (RATIONAL)
  writeTag(0x011A, 5, 1, xResOffset);
  // 283 (0x011B) YResolution (RATIONAL)
  writeTag(0x011B, 5, 1, yResOffset);
  // 296 (0x0128) ResolutionUnit (SHORT) = 2 (Inch)
  writeTag(0x0128, 3, 1, 2);

  // Next IFD offset = 0 (none)
  view.setUint32(entryPos, 0, true);

  // 3. Extra Data Area
  // BitsPerSample values: [8, 8, 8] or [8, 8, 8, 8]
  for (let s = 0; s < samplesPerPixel; s++) {
    view.setUint16(extraDataOffset + s * 2, 8, true);
  }
  // XResolution: 72 / 1
  view.setUint32(xResOffset, 72, true);
  view.setUint32(xResOffset + 4, 1, true);
  // YResolution: 72 / 1
  view.setUint32(yResOffset, 72, true);
  view.setUint32(yResOffset + 4, 1, true);

  // 4. Pixel Data
  let dst = imageOffset;
  const len = width * height * 4;
  if (hasAlpha) {
    for (let i = 0; i < len; i += 4) {
      uint8[dst++] = rgba[i];     // R
      uint8[dst++] = rgba[i + 1]; // G
      uint8[dst++] = rgba[i + 2]; // B
      uint8[dst++] = rgba[i + 3]; // A
    }
  } else {
    for (let i = 0; i < len; i += 4) {
      uint8[dst++] = rgba[i];     // R
      uint8[dst++] = rgba[i + 1]; // G
      uint8[dst++] = rgba[i + 2]; // B
    }
  }

  return new Blob([buffer], { type: "image/tiff" });
}
