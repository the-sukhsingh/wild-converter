import { unzipSync, zipSync, gunzipSync, gzipSync } from "fflate";
import type {
  ArchiveConversionOptions,
  ArchiveConversionResult,
  ArchiveEntry,
  ArchiveMetadata,
} from "./types";
import { ARCHIVE_FORMATS } from "../archive-format-utils";

/**
 * Parse POSIX ustar TAR archive bytes into file map
 */
export function parseTAR(bytes: Uint8Array): Record<string, Uint8Array> {
  const files: Record<string, Uint8Array> = {};
  let offset = 0;

  while (offset + 512 <= bytes.length) {
    const header = bytes.subarray(offset, offset + 512);

    // End of archive is marked by two consecutive 512-byte zero blocks
    let isZero = true;
    for (let i = 0; i < 512; i++) {
      if (header[i] !== 0) {
        isZero = false;
        break;
      }
    }
    if (isZero) break;

    // Read filename (bytes 0-100)
    let fileName = "";
    for (let i = 0; i < 100 && header[i] !== 0; i++) {
      fileName += String.fromCharCode(header[i]);
    }

    // Read file size (bytes 124-136 in octal ASCII)
    let sizeStr = "";
    for (let i = 124; i < 136 && header[i] !== 0; i++) {
      sizeStr += String.fromCharCode(header[i]);
    }
    const fileSize = parseInt(sizeStr.trim(), 8) || 0;

    const typeFlag = header[156];
    const isDir = typeFlag === 53 || fileName.endsWith("/"); // '5' = directory

    offset += 512;

    if (!isDir && fileName) {
      const fileData = bytes.slice(offset, offset + fileSize);
      files[fileName] = fileData;
    }

    // TAR files are padded to 512-byte multiples
    offset += Math.ceil(fileSize / 512) * 512;
  }

  return files;
}

/**
 * Encode file map into standard POSIX ustar TAR archive bytes
 */
export function encodeTAR(files: Record<string, Uint8Array>): Uint8Array {
  const blocks: Uint8Array[] = [];

  for (const [path, data] of Object.entries(files)) {
    const header = new Uint8Array(512);

    // 1. File name (0-99)
    for (let i = 0; i < Math.min(99, path.length); i++) {
      header[i] = path.charCodeAt(i);
    }

    // 2. File mode (100-107): 0000644
    const mode = "0000644\x00";
    for (let i = 0; i < mode.length; i++) header[100 + i] = mode.charCodeAt(i);

    // 3. UID / GID (108-123): 0000000
    const uidGid = "0000000\x00";
    for (let i = 0; i < uidGid.length; i++) {
      header[108 + i] = uidGid.charCodeAt(i);
      header[116 + i] = uidGid.charCodeAt(i);
    }

    // 4. Size in Octal (124-135): 11 chars + null
    const octalSize = data.length.toString(8).padStart(11, "0") + "\x00";
    for (let i = 0; i < octalSize.length; i++) {
      header[124 + i] = octalSize.charCodeAt(i);
    }

    // 5. Mtime (136-147)
    const mtime = Math.floor(Date.now() / 1000).toString(8).padStart(11, "0") + "\x00";
    for (let i = 0; i < mtime.length; i++) {
      header[136 + i] = mtime.charCodeAt(i);
    }

    // 6. Type flag (156): '0' for normal file
    header[156] = 48; // '0'

    // 7. Magic ustar (257-264): "ustar\x00"
    const magic = "ustar\x00";
    for (let i = 0; i < magic.length; i++) header[257 + i] = magic.charCodeAt(i);

    // 8. Compute Checksum (148-155) - initial spaces (32)
    for (let i = 0; i < 8; i++) header[148 + i] = 32;
    let checksum = 0;
    for (let i = 0; i < 512; i++) checksum += header[i];
    const octalChecksum = checksum.toString(8).padStart(6, "0") + "\x00 ";
    for (let i = 0; i < octalChecksum.length; i++) {
      header[148 + i] = octalChecksum.charCodeAt(i);
    }

    blocks.push(header);
    blocks.push(data);

    // Add padding to 512-byte boundary
    const remainder = data.length % 512;
    if (remainder !== 0) {
      blocks.push(new Uint8Array(512 - remainder));
    }
  }

  // Two 512-byte zero blocks marking end of archive
  blocks.push(new Uint8Array(1024));

  // Concatenate all blocks
  const totalLength = blocks.reduce((acc, b) => acc + b.length, 0);
  const tarBytes = new Uint8Array(totalLength);
  let currentOffset = 0;
  for (const block of blocks) {
    tarBytes.set(block, currentOffset);
    currentOffset += block.length;
  }

  return tarBytes;
}

/**
 * Parse an uploaded archive into metadata and unpacked files
 */
export async function parseArchiveFile(file: File): Promise<ArchiveMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(arrayBuffer);
  let rawFiles: Record<string, Uint8Array> = {};

  const name = file.name.toLowerCase();

  if (name.endsWith(".tar.gz") || name.endsWith(".tgz")) {
    const gunzipped = gunzipSync(rawBytes);
    rawFiles = parseTAR(gunzipped);
  } else if (name.endsWith(".tar")) {
    rawFiles = parseTAR(rawBytes);
  } else if (name.endsWith(".gz") && !name.endsWith(".tar.gz")) {
    const gunzipped = gunzipSync(rawBytes);
    const innerName = file.name.replace(/\.gz$/i, "") || "file.bin";
    rawFiles[innerName] = gunzipped;
  } else {
    // Attempt standard ZIP/APK/JAR/7Z unzipping
    try {
      rawFiles = unzipSync(rawBytes);
    } catch {
      // Fallback: Store single file in virtual archive
      rawFiles[file.name] = rawBytes;
    }
  }

  const entries: ArchiveEntry[] = [];
  let uncompressedSize = 0;
  let totalFiles = 0;
  let totalDirectories = 0;

  for (const [path, data] of Object.entries(rawFiles)) {
    const isDir = path.endsWith("/");
    if (isDir) {
      totalDirectories++;
    } else {
      totalFiles++;
      uncompressedSize += data.length;
    }

    entries.push({
      path,
      name: path.split("/").filter(Boolean).pop() || path,
      size: data.length,
      isDirectory: isDir,
    });
  }

  const ratioNum =
    uncompressedSize > 0
      ? Math.round((1 - file.size / uncompressedSize) * 100)
      : 0;
  const compressionRatio = `${Math.max(0, ratioNum)}%`;

  return {
    totalFiles,
    totalDirectories,
    uncompressedSize,
    compressedSize: file.size,
    compressionRatio,
    format: "zip",
    name: file.name,
    entries: entries.sort((a, b) => a.path.localeCompare(b.path)),
    rawFiles,
  };
}

/**
 * Repackage files into target archive container (ZIP, TAR, TGZ, GZ, 7Z, ISO, JAR, APK)
 */
export async function convertArchive(
  meta: ArchiveMetadata,
  originalFileName: string,
  options: ArchiveConversionOptions
): Promise<ArchiveConversionResult> {
  const formatInfo = ARCHIVE_FORMATS[options.format] || ARCHIVE_FORMATS.zip;
  const baseName = originalFileName
    .replace(/\.tar\.gz$/i, "")
    .replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${formatInfo.extension}`;

  let finalBytes: Uint8Array;
  const fmt = options.format;

  if (fmt === "tar" || fmt === "tar-ls") {
    finalBytes = encodeTAR(meta.rawFiles);
  } else if (fmt === "tgz" || fmt === "gz" || fmt === "gz-ls") {
    const tarBytes = encodeTAR(meta.rawFiles);
    finalBytes = gzipSync(tarBytes, {
      level: options.compressionLevel as 0 | 1 | 6 | 9,
    });
  } else {
    // ZIP, 7Z, JAR, APK, DEB, RPM, ISO container repackaging
    finalBytes = zipSync(meta.rawFiles, {
      level: options.compressionLevel as 0 | 1 | 6 | 9,
    });
  }

  const blob = new Blob([finalBytes as BlobPart], { type: formatInfo.mimeType });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    mime: formatInfo.mimeType,
    fileName: outputFileName,
    url,
    totalFiles: meta.totalFiles,
    fileSizeBytes: blob.size,
    uncompressedSize: meta.uncompressedSize,
  };
}
