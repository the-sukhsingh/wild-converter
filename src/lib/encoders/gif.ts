import { GifWriter } from "omggif";

/**
 * GIF89a encoder using the omggif package with palette color indexing.
 * Enables client-side GIF creation without external binaries.
 */
export function encodeGif(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number
): Blob {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const numPixels = width * height;

  // Build color palette (max 256 colors)
  const palette: number[] = [];
  const colorMap = new Map<number, number>();
  const indexedPixels = new Uint8Array(numPixels);
  let transparentIndex = -1;

  for (let i = 0; i < numPixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    if (a < 128) {
      if (transparentIndex === -1) {
        transparentIndex = palette.length;
        palette.push(0x000000);
      }
      indexedPixels[i] = transparentIndex;
      continue;
    }

    // Quantize 8-bit to 5-bit color space for fast color hashing
    const qr = (r >> 3) << 3;
    const qg = (g >> 3) << 3;
    const qb = (b >> 3) << 3;
    const key = (qr << 16) | (qg << 8) | qb;

    let colorIdx = colorMap.get(key);
    if (colorIdx === undefined) {
      if (palette.length < 256) {
        colorIdx = palette.length;
        // omggif expects 0xRRGGBB numbers in palette array
        const rgbInt = (r << 16) | (g << 8) | b;
        palette.push(rgbInt);
        colorMap.set(key, colorIdx);
      } else {
        colorIdx = 0;
      }
    }
    indexedPixels[i] = colorIdx;
  }

  // Ensure palette has at least 2 colors (power of 2)
  while (palette.length < 2 || (palette.length & (palette.length - 1)) !== 0) {
    if (palette.length >= 256) break;
    palette.push(0x000000);
  }

  const maxBufferSize = width * height * 5 + 4096;
  const buffer = new Uint8Array(maxBufferSize);
  const gifWriter = new GifWriter(buffer, width, height, {
    palette,
    loop: 0,
  });

  gifWriter.addFrame(0, 0, width, height, indexedPixels, {
    palette,
    transparent: transparentIndex >= 0 ? transparentIndex : null,
  });

  const finalLength = gifWriter.end();
  const outputBytes = buffer.subarray(0, finalLength);

  return new Blob([outputBytes], { type: "image/gif" });
}
