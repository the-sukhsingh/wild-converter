import UTIF from "utif";

/**
 * Standard TIFF encoder using UTIF.js (Photopea TIFF engine).
 * Encodes RGBA pixel buffers into valid .tiff files compatible with all viewers.
 */
export function encodeTiff(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  hasAlpha = true
): Blob {
  const imageData = ctx.getImageData(0, 0, width, height);
  const rgba = imageData.data;
  
  // UTIF.encodeImage expects Uint8Array of RGBA bytes
  const tiffBuffer = UTIF.encodeImage(new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.byteLength), width, height);
  
  return new Blob([tiffBuffer], { type: "image/tiff" });
}
