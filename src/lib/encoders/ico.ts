/**
 * Pure-TypeScript Windows Icon (.ico) encoder.
 * Embeds high-quality 32-bit PNG / BMP inside standard ICO directory container.
 */
export async function encodeIco(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number
): Promise<Blob> {
  // Use PNG inside ICO for modern clean icon transparency
  let pngBlob: Blob;
  if ("convertToBlob" in ctx.canvas) {
    pngBlob = await (ctx.canvas as OffscreenCanvas).convertToBlob({ type: "image/png" });
  } else {
    pngBlob = await new Promise<Blob>((resolve) => {
      (ctx.canvas as HTMLCanvasElement).toBlob((b) => resolve(b!), "image/png");
    });
  }

  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const headerAndDirSize = 6 + 16; // 6 bytes ICONDIR + 16 bytes ICONDIRENTRY
  const totalSize = headerAndDirSize + pngBytes.length;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // ICONDIR (6 bytes)
  view.setUint16(0, 0, true); // Reserved (0)
  view.setUint16(2, 1, true); // Type (1 = Icon, 2 = Cursor)
  view.setUint16(4, 1, true); // Count (1 image)

  // ICONDIRENTRY (16 bytes)
  view.setUint8(6, width >= 256 ? 0 : width);   // Width
  view.setUint8(7, height >= 256 ? 0 : height); // Height
  view.setUint8(8, 0); // Color count (0 if >= 8bpp)
  view.setUint8(9, 0); // Reserved
  view.setUint16(10, 1, true);  // Color planes (1)
  view.setUint16(12, 32, true); // Bits per pixel (32-bit RGBA)
  view.setUint32(14, pngBytes.length, true); // Bytes in resource
  view.setUint32(18, headerAndDirSize, true); // Offset to image data

  // Copy PNG image data
  uint8.set(pngBytes, headerAndDirSize);

  return new Blob([buffer], { type: "image/x-icon" });
}
