import type {
  ThreeDBoundingBox,
  ThreeDConversionOptions,
  ThreeDConversionResult,
  ThreeDMetadata,
} from "./types";
import { THREE_D_FORMATS } from "../three-d-format-utils";

/**
 * Calculate bounding box and dimensions from vertex positions
 */
export function computeBoundingBox(positions: Float32Array): ThreeDBoundingBox {
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  if (positions.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      minZ: 0,
      maxZ: 0,
      sizeX: 0,
      sizeY: 0,
      sizeZ: 0,
    };
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
    sizeX: parseFloat((maxX - minX).toFixed(3)),
    sizeY: parseFloat((maxY - minY).toFixed(3)),
    sizeZ: parseFloat((maxZ - minZ).toFixed(3)),
  };
}

/**
 * Parses STL files (both Binary and ASCII)
 */
export function parseSTL(buffer: ArrayBuffer): {
  positions: Float32Array;
  normals?: Float32Array;
} {
  const isAscii = (buf: ArrayBuffer): boolean => {
    const bytes = new Uint8Array(buf.slice(0, 1024));
    const text = new TextDecoder().decode(bytes);
    return text.includes("solid") && text.includes("facet");
  };

  if (isAscii(buffer)) {
    const text = new TextDecoder().decode(buffer);
    const lines = text.split("\n");
    const vertices: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("vertex")) {
        const parts = line.split(/\s+/);
        if (parts.length >= 4) {
          vertices.push(
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3])
          );
        }
      }
    }
    return { positions: new Float32Array(vertices) };
  } else {
    // Binary STL
    const dataView = new DataView(buffer);
    const triangleCount = dataView.getUint32(80, true);
    const positions = new Float32Array(triangleCount * 9);
    let offset = 84;
    let vIdx = 0;

    for (let i = 0; i < triangleCount; i++) {
      offset += 12; // skip normal (3 * float32)
      for (let v = 0; v < 3; v++) {
        positions[vIdx++] = dataView.getFloat32(offset, true);
        positions[vIdx++] = dataView.getFloat32(offset + 4, true);
        positions[vIdx++] = dataView.getFloat32(offset + 8, true);
        offset += 12;
      }
      offset += 2; // skip attribute byte count
    }
    return { positions };
  }
}

/**
 * Parses Wavefront OBJ files
 */
export function parseOBJ(text: string): {
  positions: Float32Array;
  normals?: Float32Array;
} {
  const lines = text.split("\n");
  const rawVertices: number[][] = [];
  const rawNormals: number[][] = [];
  const finalPositions: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("v ")) {
      const parts = line.split(/\s+/);
      rawVertices.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
      ]);
    } else if (line.startsWith("vn ")) {
      const parts = line.split(/\s+/);
      rawNormals.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
      ]);
    } else if (line.startsWith("f ")) {
      const parts = line.split(/\s+/).slice(1);
      if (parts.length >= 3) {
        // Fan triangulation for convex polygons (v0, v1, v2), (v0, v2, v3)...
        const vIndices = parts.map((p) => {
          const idx = parseInt(p.split("/")[0], 10);
          return idx < 0 ? rawVertices.length + idx : idx - 1;
        });

        for (let j = 1; j < vIndices.length - 1; j++) {
          const i0 = vIndices[0];
          const i1 = vIndices[j];
          const i2 = vIndices[j + 1];

          if (rawVertices[i0] && rawVertices[i1] && rawVertices[i2]) {
            finalPositions.push(...rawVertices[i0]);
            finalPositions.push(...rawVertices[i1]);
            finalPositions.push(...rawVertices[i2]);
          }
        }
      }
    }
  }

  return { positions: new Float32Array(finalPositions) };
}

/**
 * Apply scale, axis transformation, centering and normal computation
 */
export function transformPositions(
  positions: Float32Array,
  options: ThreeDConversionOptions,
  bbox: ThreeDBoundingBox
): Float32Array {
  const transformed = new Float32Array(positions.length);
  const centerX = options.centerMesh ? (bbox.minX + bbox.maxX) / 2 : 0;
  const centerY = options.centerMesh ? (bbox.minY + bbox.maxY) / 2 : 0;
  const centerZ = options.centerMesh ? (bbox.minZ + bbox.maxZ) / 2 : 0;

  for (let i = 0; i < positions.length; i += 3) {
    const x = (positions[i] - centerX) * options.scale;
    let y = (positions[i + 1] - centerY) * options.scale;
    let z = (positions[i + 2] - centerZ) * options.scale;

    if (options.upAxis === "Z") {
      // Rotate Y-up to Z-up
      const tempY = y;
      y = -z;
      z = tempY;
    }

    transformed[i] = x;
    transformed[i + 1] = y;
    transformed[i + 2] = z;
  }

  return transformed;
}

/**
 * Exporters for STL (Binary / ASCII)
 */
export function exportSTL(positions: Float32Array, binary: boolean = true): Blob {
  const triangleCount = Math.floor(positions.length / 9);

  if (binary) {
    const bufferSize = 84 + triangleCount * 50;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // 80-byte header
    const header = "wild-converter Binary STL Export";
    for (let i = 0; i < header.length; i++) {
      view.setUint8(i, header.charCodeAt(i));
    }

    view.setUint32(80, triangleCount, true);
    let offset = 84;

    for (let i = 0; i < triangleCount; i++) {
      const v0x = positions[i * 9];
      const v0y = positions[i * 9 + 1];
      const v0z = positions[i * 9 + 2];
      const v1x = positions[i * 9 + 3];
      const v1y = positions[i * 9 + 4];
      const v1z = positions[i * 9 + 5];
      const v2x = positions[i * 9 + 6];
      const v2y = positions[i * 9 + 7];
      const v2z = positions[i * 9 + 8];

      // Compute normal
      const ax = v1x - v0x,
        ay = v1y - v0y,
        az = v1z - v0z;
      const bx = v2x - v0x,
        by = v2y - v0y,
        bz = v2z - v0z;
      let nx = ay * bz - az * by;
      let ny = az * bx - ax * bz;
      let nz = ax * by - ay * bx;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;

      // Normal
      view.setFloat32(offset, nx, true);
      view.setFloat32(offset + 4, ny, true);
      view.setFloat32(offset + 8, nz, true);
      offset += 12;

      // Vertex 0
      view.setFloat32(offset, v0x, true);
      view.setFloat32(offset + 4, v0y, true);
      view.setFloat32(offset + 8, v0z, true);
      offset += 12;

      // Vertex 1
      view.setFloat32(offset, v1x, true);
      view.setFloat32(offset + 4, v1y, true);
      view.setFloat32(offset + 8, v1z, true);
      offset += 12;

      // Vertex 2
      view.setFloat32(offset, v2x, true);
      view.setFloat32(offset + 4, v2y, true);
      view.setFloat32(offset + 8, v2z, true);
      offset += 12;

      // Attribute byte count
      view.setUint16(offset, 0, true);
      offset += 2;
    }

    return new Blob([view], { type: "application/sla" });
  } else {
    // ASCII STL
    let stl = "solid wild_converter_mesh\n";
    for (let i = 0; i < triangleCount; i++) {
      const idx = i * 9;
      stl += `  facet normal 0.0 0.0 0.0\n    outer loop\n`;
      stl += `      vertex ${positions[idx].toFixed(4)} ${positions[idx + 1].toFixed(4)} ${positions[idx + 2].toFixed(4)}\n`;
      stl += `      vertex ${positions[idx + 3].toFixed(4)} ${positions[idx + 4].toFixed(4)} ${positions[idx + 5].toFixed(4)}\n`;
      stl += `      vertex ${positions[idx + 6].toFixed(4)} ${positions[idx + 7].toFixed(4)} ${positions[idx + 8].toFixed(4)}\n`;
      stl += `    endloop\n  endfacet\n`;
    }
    stl += "endsolid wild_converter_mesh\n";
    return new Blob([stl], { type: "application/sla" });
  }
}

/**
 * Exporter for Wavefront OBJ
 */
export function exportOBJ(positions: Float32Array): Blob {
  const triangleCount = Math.floor(positions.length / 9);
  let obj = "# Wavefront OBJ exported by wild-converter\n# Pure Client-Side 3D Engine\n\n";

  for (let i = 0; i < positions.length; i += 3) {
    obj += `v ${positions[i].toFixed(4)} ${positions[i + 1].toFixed(4)} ${positions[i + 2].toFixed(4)}\n`;
  }

  obj += "\ns 1\n";
  for (let i = 0; i < triangleCount; i++) {
    const v1 = i * 3 + 1;
    const v2 = i * 3 + 2;
    const v3 = i * 3 + 3;
    obj += `f ${v1} ${v2} ${v3}\n`;
  }

  return new Blob([obj], { type: "text/plain" });
}

/**
 * Exporter for binary glTF (GLB)
 */
export function exportGLB(positions: Float32Array): Blob {
  const vertexCount = Math.floor(positions.length / 3);
  const bbox = computeBoundingBox(positions);

  // Binary buffer containing vertex float32 array
  const binBuffer = positions.buffer.slice(
    positions.byteOffset,
    positions.byteOffset + positions.byteLength
  );

  const gltfJSON = {
    asset: {
      version: "2.0",
      generator: "wild-converter Pure Client-Side 3D Engine",
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
            mode: 4, // TRIANGLES
          },
        ],
      },
    ],
    buffers: [{ byteLength: binBuffer.byteLength }],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: binBuffer.byteLength,
        target: 34962, // ARRAY_BUFFER
      },
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: vertexCount,
        type: "VEC3",
        max: [bbox.maxX, bbox.maxY, bbox.maxZ],
        min: [bbox.minX, bbox.minY, bbox.minZ],
      },
    ],
  };

  const jsonString = JSON.stringify(gltfJSON);
  const jsonPaddedLength = Math.ceil(jsonString.length / 4) * 4;
  const jsonPadding = " ".repeat(jsonPaddedLength - jsonString.length);
  const fullJsonString = jsonString + jsonPadding;

  const glbHeaderSize = 12;
  const jsonChunkHeaderSize = 8;
  const binChunkHeaderSize = 8;
  const totalLength =
    glbHeaderSize +
    jsonChunkHeaderSize +
    jsonPaddedLength +
    binChunkHeaderSize +
    binBuffer.byteLength;

  const glbBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(glbBuffer);

  // GLB Header
  view.setUint32(0, 0x46546c67, true); // "glTF"
  view.setUint32(4, 2, true); // version 2
  view.setUint32(8, totalLength, true);

  // JSON Chunk Header
  view.setUint32(12, jsonPaddedLength, true);
  view.setUint32(16, 0x4e4f534a, true); // "JSON"

  // Write JSON string bytes
  const uint8View = new Uint8Array(glbBuffer);
  for (let i = 0; i < fullJsonString.length; i++) {
    uint8View[20 + i] = fullJsonString.charCodeAt(i);
  }

  // BIN Chunk Header
  const binOffset = 20 + jsonPaddedLength;
  view.setUint32(binOffset, binBuffer.byteLength, true);
  view.setUint32(binOffset + 4, 0x004e4942, true); // "BIN\0"

  // Copy BIN buffer
  uint8View.set(new Uint8Array(binBuffer), binOffset + 8);

  return new Blob([glbBuffer], { type: "model/gltf-binary" });
}

/**
 * Exporter for Standalone glTF JSON
 */
export function exportGLTF(positions: Float32Array): Blob {
  const vertexCount = Math.floor(positions.length / 3);
  const bbox = computeBoundingBox(positions);

  // Base64 encode binary buffer for embedded glTF
  const uint8 = new Uint8Array(
    positions.buffer,
    positions.byteOffset,
    positions.byteLength
  );
  let binaryString = "";
  for (let i = 0; i < uint8.length; i++) {
    binaryString += String.fromCharCode(uint8[i]);
  }
  const base64Buffer = btoa(binaryString);

  const gltfJSON = {
    asset: {
      version: "2.0",
      generator: "wild-converter Pure Client-Side 3D Engine",
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
            mode: 4,
          },
        ],
      },
    ],
    buffers: [
      {
        byteLength: uint8.byteLength,
        uri: `data:application/octet-stream;base64,${base64Buffer}`,
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: uint8.byteLength,
        target: 34962,
      },
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5126,
        count: vertexCount,
        type: "VEC3",
        max: [bbox.maxX, bbox.maxY, bbox.maxZ],
        min: [bbox.minX, bbox.minY, bbox.minZ],
      },
    ],
  };

  return new Blob([JSON.stringify(gltfJSON, null, 2)], {
    type: "model/gltf+json",
  });
}

/**
 * Exporter for PLY (Polygon File Format)
 */
export function exportPLY(positions: Float32Array): Blob {
  const vertexCount = Math.floor(positions.length / 3);
  const triangleCount = Math.floor(positions.length / 9);

  let ply = `ply
format ascii 1.0
comment Exported by wild-converter
element vertex ${vertexCount}
property float x
property float y
property float z
element face ${triangleCount}
property list uchar int vertex_indices
end_header
`;

  for (let i = 0; i < positions.length; i += 3) {
    ply += `${positions[i].toFixed(4)} ${positions[i + 1].toFixed(4)} ${positions[i + 2].toFixed(4)}\n`;
  }

  for (let i = 0; i < triangleCount; i++) {
    const v1 = i * 3;
    const v2 = i * 3 + 1;
    const v3 = i * 3 + 2;
    ply += `3 ${v1} ${v2} ${v3}\n`;
  }

  return new Blob([ply], { type: "application/octet-stream" });
}

/**
 * Exporter for 3MF / AMF XML
 */
export function export3MF(positions: Float32Array): Blob {
  const triangleCount = Math.floor(positions.length / 9);
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
`;

  for (let i = 0; i < positions.length; i += 3) {
    xml += `          <vertex x="${positions[i].toFixed(4)}" y="${positions[i + 1].toFixed(4)}" z="${positions[i + 2].toFixed(4)}" />\n`;
  }

  xml += `        </vertices>
        <triangles>
`;

  for (let i = 0; i < triangleCount; i++) {
    const v1 = i * 3;
    const v2 = i * 3 + 1;
    const v3 = i * 3 + 2;
    xml += `          <triangle v1="${v1}" v2="${v2}" v3="${v3}" />\n`;
  }

  xml += `        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1" />
  </build>
</model>
`;

  return new Blob([xml], {
    type: "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
  });
}
