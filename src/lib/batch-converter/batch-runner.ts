import type {
  BatchItem,
  ConverterCategory,
  AnyFormat,
} from "./types";
import { convertImage } from "@/lib/image-converter";
import { convertDocument, parseDocument } from "@/lib/document-converter";
import { parseAudioFile, convertAudio } from "@/lib/audio-converter";
import { parseVectorFile, convertVector } from "@/lib/vector-converter";
import { parseThreeDFile, convertThreeD } from "@/lib/three-d-converter";
import { parseFontFile, convertFont } from "@/lib/font-converter";
import { parseArchiveFile, convertArchive } from "@/lib/archive-converter";
import { parseVideoFile, convertVideo } from "@/lib/video-converter";

import { detectFormat, buildOutputName as buildImageOutputName } from "@/lib/format-utils";
import { detectDocumentFormat, buildDocumentOutputName } from "@/lib/document-format-utils";
import { isAudioFile, detectAudioFormat, AUDIO_FORMATS } from "@/lib/audio-format-utils";
import { isVideoFile, detectVideoFormat, VIDEO_FORMATS } from "@/lib/video-format-utils";
import { isVectorFile, detectVectorFormat, VECTOR_FORMATS } from "@/lib/vector-format-utils";
import { isThreeDFile, detectThreeDFormat, THREE_D_FORMATS } from "@/lib/three-d-format-utils";
import { isFontFile, detectFontFormat, FONT_FORMATS } from "@/lib/font-format-utils";
import { isArchiveFile, detectArchiveFormat, ARCHIVE_FORMATS } from "@/lib/archive-format-utils";

/**
 * Detect the converter category for a file.
 */
export function detectFileCategory(file: File): ConverterCategory {
  const ext = file.name.toLowerCase().split(".").pop() || "";

  if (isVectorFile(file) || ext === "svg" || ext === "eps" || ext === "ai" || ext === "dxf") return "vector";
  if (isThreeDFile(file) || ext === "stl" || ext === "obj" || ext === "glb" || ext === "gltf" || ext === "ply" || ext === "3mf") return "3d";
  if (isFontFile(file) || ext === "ttf" || ext === "otf" || ext === "woff" || ext === "woff2" || ext === "eot") return "fonts";
  if (isArchiveFile(file) || ext === "zip" || ext === "tar" || ext === "gz" || ext === "tgz" || ext === "7z" || ext === "rar") return "archive";
  if (isAudioFile(file) || file.type.startsWith("audio/")) return "audio";
  if (isVideoFile(file) || file.type.startsWith("video/")) return "video";
  if (detectFormat(file) !== null || file.type.startsWith("image/")) return "images";
  return "documents";
}

/**
 * Detect the input format string for a file.
 */
export function detectInputFormatString(file: File): string | null {
  const cat = detectFileCategory(file);
  switch (cat) {
    case "images":
      return detectFormat(file);
    case "documents":
      return detectDocumentFormat(file);
    case "audio":
      return detectAudioFormat(file);
    case "video":
      return detectVideoFormat(file);
    case "vector":
      return detectVectorFormat(file);
    case "3d":
      return detectThreeDFormat(file);
    case "fonts":
      return detectFontFormat(file);
    case "archive":
      return detectArchiveFormat(file);
    default:
      return file.name.split(".").pop()?.toLowerCase() || null;
  }
}

/**
 * Returns available output format options for a category or file.
 */
export function getAvailableTargetFormats(category: ConverterCategory): { id: string; label: string; ext: string }[] {
  switch (category) {
    case "images":
      return [
        { id: "webp", label: "WebP", ext: "webp" },
        { id: "png", label: "PNG", ext: "png" },
        { id: "jpeg", label: "JPEG", ext: "jpg" },
        { id: "avif", label: "AVIF", ext: "avif" },
        { id: "pdf", label: "PDF", ext: "pdf" },
        { id: "gif", label: "GIF", ext: "gif" },
        { id: "svg", label: "SVG", ext: "svg" },
        { id: "bmp", label: "BMP", ext: "bmp" },
        { id: "tiff", label: "TIFF", ext: "tif" },
        { id: "ico", label: "ICO", ext: "ico" },
        { id: "webp-ls", label: "WebP (Lossless)", ext: "webp" },
        { id: "png-ls", label: "PNG (Lossless)", ext: "png" },
        { id: "avif-ls", label: "AVIF (Lossless)", ext: "avif" },
      ];

    case "documents":
      return [
        { id: "pdf", label: "PDF", ext: "pdf" },
        { id: "docx", label: "DOCX", ext: "docx" },
        { id: "txt", label: "TXT", ext: "txt" },
        { id: "html", label: "HTML", ext: "html" },
        { id: "md", label: "Markdown", ext: "md" },
        { id: "rtf", label: "RTF", ext: "rtf" },
        { id: "xlsx", label: "Excel (XLSX)", ext: "xlsx" },
        { id: "csv", label: "CSV", ext: "csv" },
        { id: "ods", label: "ODS", ext: "ods" },
        { id: "odt", label: "ODT", ext: "odt" },
        { id: "pptx", label: "PowerPoint (PPTX)", ext: "pptx" },
        { id: "tex", label: "LaTeX (TEX)", ext: "tex" },
      ];

    case "audio":
      return [
        { id: "mp3", label: "MP3", ext: "mp3" },
        { id: "wav", label: "WAV", ext: "wav" },
        { id: "flac", label: "FLAC", ext: "flac" },
        { id: "aac", label: "AAC", ext: "aac" },
        { id: "ogg", label: "OGG", ext: "ogg" },
        { id: "m4a", label: "M4A", ext: "m4a" },
        { id: "opus", label: "Opus", ext: "opus" },
        { id: "wma", label: "WMA", ext: "wma" },
      ];

    case "video":
      return [
        { id: "mp4", label: "MP4", ext: "mp4" },
        { id: "webm", label: "WebM", ext: "webm" },
        { id: "mkv", label: "MKV", ext: "mkv" },
        { id: "mov", label: "MOV", ext: "mov" },
        { id: "avi", label: "AVI", ext: "avi" },
        { id: "gif", label: "Animated GIF", ext: "gif" },
        { id: "mp3", label: "Extract Audio (MP3)", ext: "mp3" },
      ];

    case "vector":
      return [
        { id: "svg", label: "SVG", ext: "svg" },
        { id: "png", label: "PNG", ext: "png" },
        { id: "webp", label: "WebP", ext: "webp" },
        { id: "jpeg", label: "JPEG", ext: "jpg" },
        { id: "pdf", label: "PDF Vector", ext: "pdf" },
        { id: "eps", label: "EPS", ext: "eps" },
        { id: "dxf", label: "DXF CAD", ext: "dxf" },
      ];

    case "3d":
      return [
        { id: "glb", label: "GLB (Binary)", ext: "glb" },
        { id: "gltf", label: "GLTF", ext: "gltf" },
        { id: "obj", label: "Wavefront OBJ", ext: "obj" },
        { id: "stl", label: "STL", ext: "stl" },
        { id: "ply", label: "PLY", ext: "ply" },
        { id: "3mf", label: "3MF", ext: "3mf" },
      ];

    case "fonts":
      return [
        { id: "woff2", label: "WOFF2", ext: "woff2" },
        { id: "woff", label: "WOFF", ext: "woff" },
        { id: "ttf", label: "TTF", ext: "ttf" },
        { id: "otf", label: "OTF", ext: "otf" },
        { id: "eot", label: "EOT", ext: "eot" },
        { id: "svg", label: "SVG Font", ext: "svg" },
      ];

    case "archive":
      return [
        { id: "zip", label: "ZIP", ext: "zip" },
        { id: "tar", label: "TAR", ext: "tar" },
        { id: "gz", label: "GZ", ext: "gz" },
        { id: "tgz", label: "TGZ", ext: "tgz" },
      ];

    default:
      return [{ id: "pdf", label: "PDF", ext: "pdf" }];
  }
}

/**
 * Creates a default BatchItem from a File.
 */
export function createBatchItem(file: File): BatchItem {
  const category = detectFileCategory(file);
  const detectedInput = detectInputFormatString(file);
  const availableTargets = getAvailableTargetFormats(category);

  // Pick a sensible default target
  let defaultTarget = availableTargets[0]?.id || "webp";
  if (category === "images") {
    defaultTarget = detectedInput === "webp" ? "png" : "webp";
  } else if (category === "documents") {
    defaultTarget = detectedInput === "pdf" ? "docx" : "pdf";
  } else if (category === "audio") {
    defaultTarget = detectedInput === "mp3" ? "wav" : "mp3";
  }

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const targetMeta = availableTargets.find((t) => t.id === defaultTarget);
  const outputName = `${baseName}.${targetMeta?.ext || defaultTarget}`;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    file,
    name: file.name,
    size: file.size,
    category,
    detectedInputFormat: detectedInput,
    targetFormat: defaultTarget,
    options: {},
    status: "idle",
    progress: 0,
    statusText: "Ready",
    resultBlob: null,
    resultUrl: null,
    outputName,
    outputSize: null,
    error: null,
  };
}

/**
 * Computes the formatted output filename when target format changes.
 */
export function resolveOutputFilename(inputName: string, targetFormat: string, category: ConverterCategory): string {
  const base = inputName.replace(/\.[^.]+$/, "");
  const targets = getAvailableTargetFormats(category);
  const match = targets.find((t) => t.id === targetFormat);
  const ext = match?.ext || targetFormat.replace("-ls", "");
  return `${base}.${ext}`;
}

/**
 * Executes conversion for a single BatchItem.
 */
export async function convertBatchItem(
  item: BatchItem,
  onProgress?: (progress: number, statusText: string) => void
): Promise<{ blob: Blob; outputName: string }> {
  const startMs = Date.now();
  const category = item.category;
  const file = item.file;
  const targetFormat = item.targetFormat;
  const options = item.options || {};

  onProgress?.(15, `Starting ${category} engine...`);

  let resultBlob: Blob;
  const outputName = resolveOutputFilename(file.name, targetFormat, category);

  switch (category) {
    case "images": {
      onProgress?.(45, "Processing image canvas...");
      resultBlob = await convertImage(file, targetFormat as any, options as any);
      break;
    }

    case "documents": {
      onProgress?.(30, "Parsing document structure...");
      const res = await convertDocument(file, targetFormat as any, options as any, (p, t) => {
        onProgress?.(p, t);
      });
      resultBlob = res.blob;
      break;
    }

    case "audio": {
      onProgress?.(25, "Decoding audio stream...");
      const { buffer } = await parseAudioFile(file);
      onProgress?.(55, `Encoding ${targetFormat.toUpperCase()} audio...`);
      const res = await convertAudio(
        buffer,
        file.name,
        {
          format: targetFormat as any,
          bitrate: 256,
          sampleRate: 44100,
          channels: 2,
          bitDepth: 16,
          normalize: false,
          ...(options as any),
        },
        (p, t) => {
          onProgress?.(p, t);
        }
      );
      resultBlob = res.blob;
      break;
    }

    case "video": {
      onProgress?.(20, "Loading video stream...");
      const res = await convertVideo(
        file,
        file.name,
        {
          format: targetFormat as any,
          resolution: "original",
          fps: 30,
          quality: 0.85,
          speed: 1.0,
          mute: false,
          gifLoop: true,
          ...(options as any),
        },
        (p, t) => {
          onProgress?.(p, t);
        }
      );
      resultBlob = res.blob;
      break;
    }

    case "vector": {
      onProgress?.(30, "Compiling vector paths...");
      const vecMeta = await parseVectorFile(file);
      onProgress?.(70, `Exporting vector ${targetFormat.toUpperCase()}...`);
      const res = await convertVector(vecMeta, file.name, {
        format: targetFormat as any,
        scale: 1,
        optimizeSvg: true,
        background: "transparent",
        ...(options as any),
      });
      resultBlob = res.blob;
      break;
    }

    case "3d": {
      onProgress?.(35, "Parsing 3D geometry buffer...");
      const threeMeta = await parseThreeDFile(file);
      onProgress?.(75, `Exporting 3D ${targetFormat.toUpperCase()} mesh...`);
      const res = await convertThreeD(threeMeta, file.name, {
        format: targetFormat as any,
        scale: 1,
        binary: true,
        upAxis: "Y",
        computeNormals: true,
        centerMesh: true,
        ...(options as any),
      });
      resultBlob = res.blob;
      break;
    }

    case "fonts": {
      onProgress?.(35, "Parsing font glyph tables...");
      const { font } = await parseFontFile(file);
      onProgress?.(75, `Compiling font ${targetFormat.toUpperCase()}...`);
      const res = await convertFont(font, file.name, {
        format: targetFormat as any,
        hinting: true,
        generateCssFace: true,
        subsetAsciiOnly: false,
        ...(options as any),
      });
      resultBlob = res.blob;
      break;
    }

    case "archive": {
      onProgress?.(30, "Reading archive contents...");
      const archiveMeta = await parseArchiveFile(file);
      onProgress?.(70, `Building ${targetFormat.toUpperCase()} archive...`);
      const res = await convertArchive(archiveMeta, file.name, {
        format: targetFormat as any,
        compressionLevel: 6,
        stripRootFolder: false,
        ...(options as any),
      });
      resultBlob = res.blob;
      break;
    }

    default:
      throw new Error(`Unsupported category: ${category}`);
  }

  onProgress?.(100, "Done");
  return { blob: resultBlob, outputName };
}
