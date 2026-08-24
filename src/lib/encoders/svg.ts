/**
 * Pure-TypeScript SVG encoder.
 * Encapsulates image data into crisp standard vector SVG container with embedded data URL.
 */
export async function encodeSvg(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number
): Promise<Blob> {
  let pngBlob: Blob;
  if ("convertToBlob" in ctx.canvas) {
    pngBlob = await (ctx.canvas as OffscreenCanvas).convertToBlob({ type: "image/png" });
  } else {
    pngBlob = await new Promise<Blob>((resolve) => {
      (ctx.canvas as HTMLCanvasElement).toBlob((b) => resolve(b!), "image/png");
    });
  }

  const base64Data = await blobToBase64(pngBlob);
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <image width="${width}" height="${height}" href="${base64Data}"/>
</svg>`;

  return new Blob([svgContent], { type: "image/svg+xml" });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
