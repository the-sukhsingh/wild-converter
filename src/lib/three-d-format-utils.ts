export type ThreeDFormat =
  | "glb"
  | "gltf"
  | "obj"
  | "stl"
  | "ply"
  | "dae"
  | "3ds"
  | "3mf"
  | "amf"
  | "fbx"
  // Lossless / Master variants (-ls)
  | "glb-ls"
  | "gltf-ls"
  | "obj-ls"
  | "stl-ls"
  | "ply-ls"
  | "dae-ls"
  | "3ds-ls"
  | "3mf-ls"
  | "amf-ls"
  | "fbx-ls";

export interface ThreeDFormatInfo {
  id: ThreeDFormat;
  label: string;
  extension: string;
  mimeType: string;
  category: "modern" | "manufacturing" | "legacy" | "cad";
  description: string;
  supportsBinary: boolean;
  supportsNormals: boolean;
  isLossless?: boolean;
}

export const THREE_D_FORMATS: Record<ThreeDFormat, ThreeDFormatInfo> = {
  glb: {
    id: "glb",
    label: "GLB (Binary glTF)",
    extension: "glb",
    mimeType: "model/gltf-binary",
    category: "modern",
    description: "The JPEG of 3D, ultra-efficient single-file binary container for WebGL & AR",
    supportsBinary: true,
    supportsNormals: true,
    isLossless: true,
  },
  gltf: {
    id: "gltf",
    label: "glTF (JSON + Buffer)",
    extension: "gltf",
    mimeType: "model/gltf+json",
    category: "modern",
    description: "Khronos standard JSON-based 3D scene descriptor",
    supportsBinary: false,
    supportsNormals: true,
    isLossless: true,
  },
  obj: {
    id: "obj",
    label: "OBJ (Wavefront)",
    extension: "obj",
    mimeType: "text/plain",
    category: "legacy",
    description: "Universal 3D geometry format supported by every 3D modeling application",
    supportsBinary: false,
    supportsNormals: true,
    isLossless: true,
  },
  stl: {
    id: "stl",
    label: "STL (3D Printing)",
    extension: "stl",
    mimeType: "application/sla",
    category: "manufacturing",
    description: "Standard stereolithography triangle mesh for 3D printing and CNC slicers",
    supportsBinary: true,
    supportsNormals: true,
    isLossless: true,
  },
  ply: {
    id: "ply",
    label: "PLY (Polygon File)",
    extension: "ply",
    mimeType: "application/octet-stream",
    category: "cad",
    description: "Stanford triangle mesh format with vertex colors and custom properties",
    supportsBinary: true,
    supportsNormals: true,
    isLossless: true,
  },
  dae: {
    id: "dae",
    label: "DAE (Collada)",
    extension: "dae",
    mimeType: "model/vnd.collada+xml",
    category: "legacy",
    description: "COLLADA XML-based digital asset exchange schema",
    supportsBinary: false,
    supportsNormals: true,
    isLossless: true,
  },
  "3ds": {
    id: "3ds",
    label: "3DS (3D Studio)",
    extension: "3ds",
    mimeType: "application/x-3ds",
    category: "legacy",
    description: "Autodesk 3ds Max legacy binary mesh container",
    supportsBinary: true,
    supportsNormals: true,
  },
  "3mf": {
    id: "3mf",
    label: "3MF (3D Manufacturing)",
    extension: "3mf",
    mimeType: "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
    category: "manufacturing",
    description: "Modern XML-based 3D printing container with material and unit specs",
    supportsBinary: false,
    supportsNormals: true,
    isLossless: true,
  },
  amf: {
    id: "amf",
    label: "AMF (Additive Manufacturing)",
    extension: "amf",
    mimeType: "application/x-amf",
    category: "manufacturing",
    description: "ASTM standard additive manufacturing XML container",
    supportsBinary: false,
    supportsNormals: true,
    isLossless: true,
  },
  fbx: {
    id: "fbx",
    label: "FBX (Filmbox)",
    extension: "fbx",
    mimeType: "application/octet-stream",
    category: "modern",
    description: "Autodesk Filmbox exchange format for animation and rigging",
    supportsBinary: true,
    supportsNormals: true,
    isLossless: true,
  },

  // Lossless presets (-ls)
  "glb-ls": {
    id: "glb-ls",
    label: "GLB Master Archive",
    extension: "glb",
    mimeType: "model/gltf-binary",
    category: "modern",
    description: "Lossless binary glTF with uncompressed vertex buffers and full precision",
    supportsBinary: true,
    supportsNormals: true,
    isLossless: true,
  },
  "gltf-ls": {
    id: "gltf-ls",
    label: "glTF Lossless Master",
    extension: "gltf",
    mimeType: "model/gltf+json",
    category: "modern",
    description: "Human-readable glTF with high-precision floats and embedded buffers",
    supportsBinary: false,
    supportsNormals: true,
    isLossless: true,
  },
  "obj-ls": {
    id: "obj-ls",
    label: "OBJ Precision Master",
    extension: "obj",
    mimeType: "text/plain",
    category: "legacy",
    description: "6-decimal precision Wavefront OBJ geometry with normal vectors",
    supportsBinary: false,
    supportsNormals: true,
    isLossless: true,
  },
  "stl-ls": {
    id: "stl-ls",
    label: "STL Binary Precision",
    extension: "stl",
    mimeType: "application/sla",
    category: "manufacturing",
    description: "IEEE 754 32-bit binary STL with unit bounding verification",
    supportsBinary: true,
    supportsNormals: true,
    isLossless: true,
  },
  "ply-ls": {
    id: "ply-ls",
    label: "PLY Double Precision",
    extension: "ply",
    mimeType: "application/octet-stream",
    category: "cad",
    description: "Lossless binary PLY polygon coordinate table",
    supportsBinary: true,
    supportsNormals: true,
    isLossless: true,
  },
  "dae-ls": {
    id: "dae-ls",
    label: "DAE Master Schema",
    extension: "dae",
    mimeType: "model/vnd.collada+xml",
    category: "legacy",
    description: "Collada 1.5 master digital asset exchange XML",
    supportsBinary: false,
    supportsNormals: true,
    isLossless: true,
  },
  "3ds-ls": {
    id: "3ds-ls",
    label: "3DS Studio Master",
    extension: "3ds",
    mimeType: "application/x-3ds",
    category: "legacy",
    description: "Binary 3D Studio mesh with full face indices",
    supportsBinary: true,
    supportsNormals: true,
  },
  "3mf-ls": {
    id: "3mf-ls",
    label: "3MF Production Master",
    extension: "3mf",
    mimeType: "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
    category: "manufacturing",
    description: "Strict 3MF specification XML with millimeter coordinate system",
    supportsBinary: false,
    supportsNormals: true,
    isLossless: true,
  },
  "amf-ls": {
    id: "amf-ls",
    label: "AMF Production Master",
    extension: "amf",
    mimeType: "application/x-amf",
    category: "manufacturing",
    description: "Curved triangle geometry and lossless volume definitions",
    supportsBinary: false,
    supportsNormals: true,
    isLossless: true,
  },
  "fbx-ls": {
    id: "fbx-ls",
    label: "FBX ASCII / Master",
    extension: "fbx",
    mimeType: "text/plain",
    category: "modern",
    description: "Autodesk FBX interchange structure with coordinate matrix",
    supportsBinary: true,
    supportsNormals: true,
    isLossless: true,
  },
};

export const THREE_D_EXTENSIONS: Record<string, ThreeDFormat> = {
  glb: "glb",
  gltf: "gltf",
  obj: "obj",
  stl: "stl",
  ply: "ply",
  dae: "dae",
  "3ds": "3ds",
  "3mf": "3mf",
  amf: "amf",
  fbx: "fbx",
  blend: "glb",
};

export function detectThreeDFormat(file: File): ThreeDFormat | null {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  if (THREE_D_EXTENSIONS[ext]) {
    return THREE_D_EXTENSIONS[ext];
  }

  const type = file.type.toLowerCase();
  if (type.includes("model/gltf-binary")) return "glb";
  if (type.includes("model/gltf+json")) return "gltf";
  if (type.includes("sla") || type.includes("stl")) return "stl";

  return null;
}

export function isThreeDFile(file: File): boolean {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  return Boolean(THREE_D_EXTENSIONS[ext]);
}
