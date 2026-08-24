import type { ThreeDFormat } from "../three-d-format-utils";

export interface ThreeDBoundingBox {
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface ThreeDMetadata {
  vertexCount: number;
  faceCount: number;
  meshCount: number;
  boundingBox: ThreeDBoundingBox;
  fileSizeBytes: number;
  name: string;
  format: ThreeDFormat | "unknown";
  positions: Float32Array; // Flattened [x, y, z, ...]
  normals?: Float32Array;
}

export interface ThreeDConversionOptions {
  format: ThreeDFormat;
  binary: boolean;
  scale: number; // Scale multiplier (0.001 = mm, 0.01 = cm, 1 = m, 0.0254 = in)
  upAxis: "Y" | "Z";
  computeNormals: boolean;
  centerMesh: boolean;
}

export interface ThreeDConversionResult {
  blob: Blob;
  mime: string;
  fileName: string;
  url: string;
  vertexCount: number;
  faceCount: number;
  fileSizeBytes: number;
}
