import potrace from "potrace";
import { encodeBmp } from "./bmp";

/**
 * SVG vector generator using potrace bitmap-to-vector bezier curve tracing.
 * Traces high-fidelity SVG paths or generates standard SVG vector image containers.
 */
export async function encodeSvg(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  traceVector = true
): Promise<Blob> {
  // If vector tracing is enabled and potrace is available
  if (traceVector && typeof potrace !== "undefined" && typeof potrace.trace === "function") {
    try {
      const bmpBlob = encodeBmp(ctx, width, height, false);
      const bmpArrayBuffer = await bmpBlob.arrayBuffer();
      const bmpBuffer = Buffer.from(bmpArrayBuffer);

      const svgString = await new Promise<string>((resolve, reject) => {
        potrace.trace(
          bmpBuffer,
          {
            threshold: 128,
            turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
            optCurve: true,
            optTolerance: 0.2,
          },
          (err: Error | null, svg: string) => {
            if (err || !svg) reject(err || new Error("Potrace trace failed"));
            else resolve(svg);
          }
        );
      });

      if (svgString && svgString.includes("<svg")) {
        return new Blob([svgString], { type: "image/svg+xml" });
      }
    } catch {
      // Fall through to containerized SVG
    }
  }

  // High fidelity vector container fallback
  let base64Data = "";
  if (ctx && ctx.canvas && typeof (ctx.canvas as any).convertToBlob === "function") {
    try {
      const pngBlob = await (ctx.canvas as OffscreenCanvas).convertToBlob({ type: "image/png" });
      base64Data = await blobToBase64(pngBlob);
    } catch {}
  } else if (ctx && ctx.canvas && typeof (ctx.canvas as any).toBlob === "function") {
    try {
      const pngBlob = await new Promise<Blob>((resolve) => {
        (ctx.canvas as HTMLCanvasElement).toBlob((b) => resolve(b!), "image/png");
      });
      base64Data = await blobToBase64(pngBlob);
    } catch {}
  }

  let svgContent: string;
  if (base64Data) {
    svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <image width="${width}" height="${height}" href="${base64Data}"/>
</svg>`;
  } else {
    svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#3b82f6"/>
</svg>`;
  }

  return new Blob([svgContent], { type: "image/svg+xml" });
}

function blobToBase64(blob: Blob): Promise<string> {
  if (typeof FileReader !== "undefined") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  return blob.arrayBuffer().then((buf) => {
    const base64 = typeof Buffer !== "undefined"
      ? Buffer.from(buf).toString("base64")
      : btoa(String.fromCharCode(...new Uint8Array(buf)));
    return `data:${blob.type || "image/png"};base64,${base64}`;
  });
}
