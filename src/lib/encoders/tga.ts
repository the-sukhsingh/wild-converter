/**
 * Pure-TypeScript Truevision TGA (TARGA) encoder.
 * Supports 24-bit RGB and 32-bit RGBA uncompressed image formats.
 */
export function encodeTga(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  hasAlpha = true
): Blob {
  const imageData = ctx.getImageData(0, 0, width, height);
  const rgba = imageData.data;

  const bitsPerPixel = hasAlpha ? 32 : 24;
  const bytesPerPixel = hasAlpha ? 4 : 3;
  const pixelDataSize = width * height * bytesPerPixel;
  const headerSize = 18;
  const totalSize = headerSize + pixelDataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // TGA Header (18 bytes)
  view.setUint8(0, 0); // ID length (0)
  view.setUint8(1, 0); // Color map type (0 = none)
  view.setUint8(2, 2); // Image type (2 = uncompressed true-color)
  view.setUint16(3, 0, true); // Color map origin
  view.setUint16(5, 0, true); // Color map length
  view.setUint8(7, 0); // Color map entry size
  view.setUint16(8, 0, true); // X-origin
  view.setUint16(10, 0, true); // Y-origin
  view.setUint16(12, width, true); // Width
  view.setUint16(14, height, true); // Height
  view.setUint8(16, bitsPerPixel); // Bits per pixel
  // Image descriptor: bit 5 = top-to-bottom (0x20), bit 3-0 = alpha channel depth (8 or 0)
  view.setUint8(17, 0x20 | (hasAlpha ? 8 : 0));

  let offset = headerSize;
  const numPixels = width * height;
  if (hasAlpha) {
    for (let i = 0; i < numPixels; i++) {
      const idx = i * 4;
      uint8[offset++] = rgba[idx + 2]; // B
      uint8[offset++] = rgba[idx + 1]; // G
      uint8[offset++] = rgba[idx];     // R
      uint8[offset++] = rgba[idx + 3]; // A
    }
  } else {
    for (let i = 0; i < numPixels; i++) {
      const idx = i * 4;
      uint8[offset++] = rgba[idx + 2]; // B
      uint8[offset++] = rgba[idx + 1]; // G
      uint8[offset++] = rgba[idx];     // R
    }
  }

  return new Blob([buffer], { type: "image/x-tga" });
}
