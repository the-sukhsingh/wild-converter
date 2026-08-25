import type { DocumentIR, DocumentSection } from "../types";

export async function parseImageDocument(file: File, format: string): Promise<DocumentIR> {
  const arrayBuffer = await file.arrayBuffer();
  const title = file.name.replace(/\.[^.]+$/, "");

  // Convert arrayBuffer to base64 data URL for embedding
  let mimeType = file.type || "image/png";
  if (!mimeType.startsWith("image/")) {
    const ext = format.toLowerCase();
    if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
    else if (ext === "png") mimeType = "image/png";
    else if (ext === "webp") mimeType = "image/webp";
    else if (ext === "gif") mimeType = "image/gif";
    else if (ext === "svg") mimeType = "image/svg+xml";
    else if (ext === "bmp") mimeType = "image/bmp";
    else if (ext === "tiff" || ext === "tif") mimeType = "image/tiff";
    else mimeType = "image/png";
  }

  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  let width = 800;
  let height = 600;

  if (typeof window !== "undefined" && typeof Image !== "undefined") {
    try {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          width = img.naturalWidth || 800;
          height = img.naturalHeight || 600;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = dataUrl;
      });
    } catch {
      // Default dimensions
    }
  }

  const sections: DocumentSection[] = [
    {
      type: "image",
      src: dataUrl,
      width,
      height,
      alt: title,
    },
  ];

  const html = `<div style="text-align: center; margin: 2rem 0;"><img src="${dataUrl}" alt="${title}" style="max-width: 100%; height: auto;" /></div>`;
  const rawText = `[Image: ${file.name}]`;

  return {
    title,
    sections,
    sheets: [],
    rawText,
    html,
    rawBuffer: arrayBuffer,
    originalFile: file,
    sourceFormat: format,
    metadata: {
      title,
      wordCount: 1,
      lineCount: 1,
      pageCount: 1,
      sheetCount: 0,
      creationDate: new Date(file.lastModified || Date.now()).toISOString(),
    },
  };
}
