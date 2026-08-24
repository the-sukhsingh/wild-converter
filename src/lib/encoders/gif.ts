/**
 * Pure-TypeScript GIF89a encoder with color quantization and LZW compression.
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

  // 1. Build color palette using uniform / median-sample quantization
  // Maximum 256 colors for GIF palette
  const palette: number[][] = [];
  const colorMap = new Map<number, number>();
  const indexedPixels = new Uint8Array(numPixels);

  // Check if any pixels have alpha transparency (< 128)
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
        palette.push([0, 0, 0]); // transparent color entry
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
        palette.push([r, g, b]);
        colorMap.set(key, colorIdx);
      } else {
        // Nearest neighbor in palette
        colorIdx = findNearestColor(r, g, b, palette, transparentIndex);
        colorMap.set(key, colorIdx);
      }
    }
    indexedPixels[i] = colorIdx;
  }

  // Ensure palette size is a power of 2 (at least 2, max 256)
  let paletteSize = 2;
  while (paletteSize < palette.length) {
    paletteSize <<= 1;
  }
  if (paletteSize > 256) paletteSize = 256;
  while (palette.length < paletteSize) {
    palette.push([0, 0, 0]);
  }

  const colorResolution = Math.round(Math.log2(paletteSize));
  const minCodeSize = Math.max(2, colorResolution);

  // Buffer builder
  const bytes: number[] = [];

  // Header: GIF89a
  pushString(bytes, "GIF89a");

  // Logical Screen Descriptor
  pushUint16(bytes, width);
  pushUint16(bytes, height);
  // Packed field: Global Color Table Flag (1), Color Resolution (3 bits), Sort Flag (0), Size of GCT (3 bits)
  const gctFlag = 1;
  const gctSize = colorResolution - 1;
  bytes.push((gctFlag << 7) | ((colorResolution - 1) << 4) | gctSize);
  bytes.push(0); // Background color index
  bytes.push(0); // Pixel aspect ratio

  // Global Color Table
  for (let i = 0; i < paletteSize; i++) {
    const c = palette[i];
    bytes.push(c[0], c[1], c[2]);
  }

  // Graphic Control Extension (if transparency is used)
  if (transparentIndex !== -1) {
    bytes.push(0x21); // Extension Introducer
    bytes.push(0xf9); // Graphic Control Label
    bytes.push(4);    // Byte size
    bytes.push(1);    // Transparent Color Flag = 1
    pushUint16(bytes, 0); // Delay time
    bytes.push(transparentIndex);
    bytes.push(0);    // Block Terminator
  }

  // Image Descriptor
  bytes.push(0x2c); // Image Separator
  pushUint16(bytes, 0); // Left
  pushUint16(bytes, 0); // Top
  pushUint16(bytes, width);
  pushUint16(bytes, height);
  bytes.push(0); // Local Color Table Flag (0)

  // Image Data (LZW compressed)
  bytes.push(minCodeSize);
  lzwCompress(indexedPixels, minCodeSize, bytes);
  bytes.push(0); // Block Terminator

  // Trailer
  bytes.push(0x3b);

  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

function findNearestColor(
  r: number,
  g: number,
  b: number,
  palette: number[][],
  skipIndex: number
): number {
  let bestIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < palette.length; i++) {
    if (i === skipIndex) continue;
    const p = palette[i];
    const dr = r - p[0];
    const dg = g - p[1];
    const db = b - p[2];
    const diff = dr * dr + dg * dg + db * db;
    if (diff < minDiff) {
      minDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function pushString(arr: number[], str: string) {
  for (let i = 0; i < str.length; i++) {
    arr.push(str.charCodeAt(i));
  }
}

function pushUint16(arr: number[], val: number) {
  arr.push(val & 0xff, (val >> 8) & 0xff);
}

/** Variable-length LZW encoding according to GIF specification */
function lzwCompress(pixels: Uint8Array, minCodeSize: number, output: number[]) {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  let codeMask = (1 << codeSize) - 1;

  const dictionary = new Map<string, number>();

  function resetDict() {
    dictionary.clear();
    for (let i = 0; i < clearCode; i++) {
      dictionary.set(String(i), i);
    }
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
    codeMask = (1 << codeSize) - 1;
  }

  resetDict();

  // Bit accumulator
  let curAccum = 0;
  let curBits = 0;
  const block: number[] = [];

  function writeBits(code: number) {
    curAccum |= code << curBits;
    curBits += codeSize;
    while (curBits >= 8) {
      block.push(curAccum & 0xff);
      if (block.length === 255) {
        output.push(255, ...block);
        block.length = 0;
      }
      curAccum >>= 8;
      curBits -= 8;
    }
  }

  writeBits(clearCode);

  let curPrefix = String(pixels[0]);

  for (let i = 1; i < pixels.length; i++) {
    const nextPixel = pixels[i];
    const combined = curPrefix + "," + nextPixel;
    if (dictionary.has(combined)) {
      curPrefix = combined;
    } else {
      writeBits(dictionary.get(curPrefix)!);

      if (nextCode < 4096) {
        dictionary.set(combined, nextCode++);
        if (nextCode > codeMask && codeSize < 12) {
          codeSize++;
          codeMask = (1 << codeSize) - 1;
        }
      } else {
        writeBits(clearCode);
        resetDict();
      }
      curPrefix = String(nextPixel);
    }
  }

  writeBits(dictionary.get(curPrefix)!);
  writeBits(eoiCode);

  // Flush remaining bits
  if (curBits > 0) {
    block.push(curAccum & 0xff);
  }
  if (block.length > 0) {
    output.push(block.length, ...block);
  }
}
