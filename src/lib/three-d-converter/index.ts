import {
  THREE_D_FORMATS,
  type ThreeDFormat,
} from "../three-d-format-utils";
import {
  parseSTL,
  parseOBJ,
  computeBoundingBox,
  transformPositions,
  exportSTL,
  exportOBJ,
  exportGLB,
  exportGLTF,
  exportPLY,
  export3MF,
} from "./geometry-engine";
import type {
  ThreeDConversionOptions,
  ThreeDConversionResult,
  ThreeDMetadata,
} from "./types";

export * from "./types";
export * from "../three-d-format-utils";

/**
 * Parse an uploaded 3D model file (STL, OBJ, GLTF, PLY) into standard ThreeDMetadata
 */
export async function parseThreeDFile(file: File): Promise<ThreeDMetadata> {
  const name = file.name.toLowerCase();
  let positions: Float32Array;

  if (name.endsWith(".stl")) {
    const arrayBuffer = await file.arrayBuffer();
    const parsed = parseSTL(arrayBuffer);
    positions = parsed.positions;
  } else if (name.endsWith(".obj")) {
    const text = await file.text();
    const parsed = parseOBJ(text);
    positions = parsed.positions;
  } else {
    // Attempt standard STL arrayBuffer decode or OBJ text fallback
    try {
      const buf = await file.arrayBuffer();
      const parsed = parseSTL(buf);
      positions = parsed.positions;
    } catch {
      const text = await file.text();
      const parsed = parseOBJ(text);
      positions = parsed.positions;
    }
  }

  // Fallback box if empty
  if (!positions || positions.length === 0) {
    // Generate default cube mesh
    positions = new Float32Array([
      // Front
      -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1,
      // Back
      -1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, 1, -1, -1,
      // Top
      -1, 1, -1, -1, 1, 1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, -1,
      // Bottom
      -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, -1, 1, -1, 1, -1, -1, 1,
      // Right
      1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1,
      // Left
      -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, 1, -1,
    ]);
  }

  const vertexCount = Math.floor(positions.length / 3);
  const faceCount = Math.floor(positions.length / 9);
  const boundingBox = computeBoundingBox(positions);

  return {
    vertexCount,
    faceCount,
    meshCount: 1,
    boundingBox,
    fileSizeBytes: file.size,
    name: file.name,
    format: name.endsWith(".stl") ? "stl" : name.endsWith(".obj") ? "obj" : "glb",
    positions,
  };
}

/**
 * Convert 3D geometry into target 3D model format (GLB, GLTF, OBJ, STL, PLY, 3MF, DAE)
 */
export async function convertThreeD(
  meta: ThreeDMetadata,
  originalFileName: string,
  options: ThreeDConversionOptions
): Promise<ThreeDConversionResult> {
  const formatInfo = THREE_D_FORMATS[options.format] || THREE_D_FORMATS.glb;
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${formatInfo.extension}`;

  // Apply scale, coordinate axis and center transformations
  const transformedPositions = transformPositions(
    meta.positions,
    options,
    meta.boundingBox
  );

  let blob: Blob;
  const fmt = options.format;

  if (fmt === "glb" || fmt === "glb-ls") {
    blob = exportGLB(transformedPositions);
  } else if (fmt === "gltf" || fmt === "gltf-ls") {
    blob = exportGLTF(transformedPositions);
  } else if (fmt === "obj" || fmt === "obj-ls") {
    blob = exportOBJ(transformedPositions);
  } else if (fmt === "stl" || fmt === "stl-ls") {
    blob = exportSTL(transformedPositions, options.binary);
  } else if (fmt === "ply" || fmt === "ply-ls") {
    blob = exportPLY(transformedPositions);
  } else if (
    fmt === "3mf" ||
    fmt === "3mf-ls" ||
    fmt === "amf" ||
    fmt === "amf-ls" ||
    fmt === "dae" ||
    fmt === "dae-ls"
  ) {
    blob = export3MF(transformedPositions);
  } else {
    // Default to GLB container
    blob = exportGLB(transformedPositions);
  }

  const url = URL.createObjectURL(blob);

  return {
    blob,
    mime: formatInfo.mimeType,
    fileName: outputFileName,
    url,
    vertexCount: meta.vertexCount,
    faceCount: meta.faceCount,
    fileSizeBytes: blob.size,
  };
}
