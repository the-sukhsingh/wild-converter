import JSZip from "jszip";

export interface ZipProgressCallback {
  (percent: number, currentFile: string): void;
}

export interface ZipFileEntry {
  name: string;
  blob: Blob;
}

/**
 * Builds a ZIP file from an array of Blob entries and returns the resulting Blob.
 */
export async function createZipArchive(
  entries: ZipFileEntry[],
  onProgress?: ZipProgressCallback
): Promise<Blob> {
  const zip = new JSZip();

  // Deduplicate file names if multiple files have the exact same name
  const usedNames = new Set<string>();

  for (const entry of entries) {
    let finalName = entry.name;
    if (usedNames.has(finalName)) {
      const dotIdx = finalName.lastIndexOf(".");
      const base = dotIdx !== -1 ? finalName.slice(0, dotIdx) : finalName;
      const ext = dotIdx !== -1 ? finalName.slice(dotIdx) : "";
      let count = 2;
      while (usedNames.has(`${base} (${count})${ext}`)) {
        count++;
      }
      finalName = `${base} (${count})${ext}`;
    }
    usedNames.add(finalName);
    zip.file(finalName, entry.blob);
  }

  const zipBlob = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.(Math.round(metadata.percent), metadata.currentFile || "Archiving...");
    }
  );

  return zipBlob;
}

/**
 * Triggers a browser download for a Blob with a specified filename.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
