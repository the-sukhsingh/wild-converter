/**
 * Pure-TypeScript BMP encoder (24-bit RGB and 32-bit RGBA).
 */
export function encodeBmp(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  hasAlpha = false
): Blob {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  const bitsPerPixel = hasAlpha ? 32 : 24;
  const bytesPerPixel = hasAlpha ? 4 : 3;
  const rowSize = hasAlpha ? width * 4 : Math.floor((3 * width + 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BMP file header (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true); // reserved
  view.setUint32(10, 54, true); // pixel data offset

  // DIB header (BITMAPINFOHEADER - 40 bytes)
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // negative = top-down
  view.setUint16(26, 1, true); // color planes
  view.setUint16(28, bitsPerPixel, true);
  view.setUint32(30, 0, true); // no compression (BI_RGB)
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true); // 72 DPI
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  let offset = 54;
  if (hasAlpha) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        view.setUint8(offset++, pixels[i + 2]); // B
        view.setUint8(offset++, pixels[i + 1]); // G
        view.setUint8(offset++, pixels[i + 0]); // R
        view.setUint8(offset++, pixels[i + 3]); // A
      }
    }
  } else {
    const pad = rowSize - width * 3;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        view.setUint8(offset++, pixels[i + 2]); // B
        view.setUint8(offset++, pixels[i + 1]); // G
        view.setUint8(offset++, pixels[i + 0]); // R
      }
      for (let p = 0; p < pad; p++) view.setUint8(offset++, 0);
    }
  }

  return new Blob([buffer], { type: "image/bmp" });
}
