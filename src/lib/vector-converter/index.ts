import {
  VECTOR_FORMATS,
  type VectorFormat,
} from "../vector-format-utils";
import {
  parseSvgContent,
  optimizeSvgString,
  svgToEps,
  svgToDxf,
  svgToPdfVector,
  svgToRaster,
  dxfToSvgString,
} from "./vector-generators";
import type {
  VectorConversionOptions,
  VectorConversionResult,
  VectorMetadata,
} from "./types";

export * from "./types";
export * from "../vector-format-utils";

/**
 * Parse an uploaded vector file (SVG, EPS, AI, DXF, DWG) into standard VectorMetadata
 */
export async function parseVectorFile(file: File): Promise<VectorMetadata> {
  const text = await file.text();
  const lowerName = file.name.toLowerCase();

  // If DXF CAD file
  if (lowerName.endsWith(".dxf") || lowerName.endsWith(".dwg") || text.includes("SECTION") && text.includes("ENTITIES")) {
    const { svg, width, height } = dxfToSvgString(text);
    const { viewBox, pathCount, elementCount } = parseSvgContent(svg);
    return {
      width,
      height,
      viewBox,
      pathCount,
      elementCount,
      fileSizeBytes: file.size,
      name: file.name,
      format: "dxf",
      svgContent: svg,
    };
  }

  // If already SVG XML
  if (text.includes("<svg") || file.type.includes("svg") || lowerName.endsWith(".svg")) {
    const { width, height, viewBox, pathCount, elementCount } = parseSvgContent(text);
    return {
      width,
      height,
      viewBox,
      pathCount,
      elementCount,
      fileSizeBytes: file.size,
      name: file.name,
      format: "svg",
      svgContent: text,
    };
  }

  // Fallback wrapper for CAD/EPS plain text into standard SVG container
  const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <rect width="800" height="600" fill="#f8fafc"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="18" fill="#334155">
      ${file.name} [Vector Data]
    </text>
  </svg>`;

  const { width, height, viewBox, pathCount, elementCount } = parseSvgContent(defaultSvg);

  return {
    width,
    height,
    viewBox,
    pathCount,
    elementCount,
    fileSizeBytes: file.size,
    name: file.name,
    format: "svg",
    svgContent: defaultSvg,
  };
}

/**
 * Converts vector metadata into requested vector/raster format
 */
export async function convertVector(
  meta: VectorMetadata,
  originalFileName: string,
  options: VectorConversionOptions
): Promise<VectorConversionResult> {
  const formatInfo = VECTOR_FORMATS[options.format] || VECTOR_FORMATS.svg;
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${formatInfo.extension}`;

  const svgSource = options.optimizeSvg
    ? optimizeSvgString(meta.svgContent)
    : meta.svgContent;

  let blob: Blob;

  const fmt = options.format;

  if (fmt === "svg" || fmt === "svg-ls") {
    blob = new Blob([svgSource], { type: "image/svg+xml;charset=utf-8" });
  } else if (fmt === "eps" || fmt === "eps-ls" || fmt === "ps" || fmt === "ps-ls") {
    blob = svgToEps(svgSource, meta.width, meta.height, false);
  } else if (fmt === "ai" || fmt === "ai-ls" || fmt === "cdr" || fmt === "cdr-ls") {
    blob = svgToEps(svgSource, meta.width, meta.height, true);
  } else if (fmt === "dxf" || fmt === "dxf-ls" || fmt === "dwg" || fmt === "dwg-ls") {
    blob = svgToDxf(svgSource, meta.width, meta.height, options.dxfVersion);
  } else if (fmt === "pdf" || fmt === "pdf-ls") {
    blob = await svgToPdfVector(svgSource, meta.width, meta.height);
  } else if (fmt === "wmf" || fmt === "wmf-ls" || fmt === "emf" || fmt === "emf-ls") {
    blob = svgToEps(svgSource, meta.width, meta.height, false);
  } else if (fmt === "png") {
    blob = await svgToRaster(
      svgSource,
      meta.width,
      meta.height,
      options.scale,
      "image/png",
      options.background
    );
  } else if (fmt === "webp") {
    blob = await svgToRaster(
      svgSource,
      meta.width,
      meta.height,
      options.scale,
      "image/webp",
      options.background
    );
  } else if (fmt === "jpeg") {
    blob = await svgToRaster(
      svgSource,
      meta.width,
      meta.height,
      options.scale,
      "image/jpeg",
      options.background === "transparent" ? "white" : options.background
    );
  } else {
    blob = new Blob([svgSource], { type: "image/svg+xml" });
  }

  const url = URL.createObjectURL(blob);

  return {
    blob,
    mime: formatInfo.mimeType,
    fileName: outputFileName,
    url,
    svgPreviewText: svgSource,
    width: meta.width * options.scale,
    height: meta.height * options.scale,
    fileSizeBytes: blob.size,
  };
}
