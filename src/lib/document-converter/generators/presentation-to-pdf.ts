import { jsPDF } from "jspdf";
import JSZip from "jszip";
import type { DocumentIR, DocumentConversionOptions } from "../types";
import { parseBinaryPptRecords } from "../parsers/ppt-binary-parser";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Scan binary buffer for embedded JPEG and PNG images (useful for legacy .ppt)
 */
function extractImagesFromBinaryBuffer(buffer: ArrayBuffer): string[] {
  const bytes = new Uint8Array(buffer);
  const images: string[] = [];

  // JPEG signatures: 0xFF 0xD8 0xFF ... 0xFF 0xD9
  for (let i = 0; i < bytes.length - 10; i++) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff) {
      for (let j = i + 10; j < Math.min(bytes.length - 1, i + 5000000); j++) {
        if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
          const imgSlice = bytes.subarray(i, j + 2);
          if (imgSlice.length > 500) {
            let binary = "";
            for (let k = 0; k < imgSlice.length; k++) {
              binary += String.fromCharCode(imgSlice[k]);
            }
            images.push(`data:image/jpeg;base64,${btoa(binary)}`);
            i = j + 2;
          }
          break;
        }
      }
    }
  }

  // PNG signatures: 0x89 'P' 'N' 'G'
  for (let i = 0; i < bytes.length - 16; i++) {
    if (
      bytes[i] === 0x89 &&
      bytes[i + 1] === 0x50 &&
      bytes[i + 2] === 0x4e &&
      bytes[i + 3] === 0x47
    ) {
      for (let j = i + 8; j < Math.min(bytes.length - 8, i + 5000000); j++) {
        if (
          bytes[j] === 0x49 &&
          bytes[j + 1] === 0x45 &&
          bytes[j + 2] === 0x4e &&
          bytes[j + 3] === 0x44
        ) {
          const imgSlice = bytes.subarray(i, j + 8);
          if (imgSlice.length > 300) {
            let binary = "";
            for (let k = 0; k < imgSlice.length; k++) {
              binary += String.fromCharCode(imgSlice[k]);
            }
            images.push(`data:image/png;base64,${btoa(binary)}`);
            i = j + 8;
          }
          break;
        }
      }
    }
  }

  return images;
}

export interface SlideData {
  slideNumber: number;
  title: string;
  points: string[];
  images: string[];
}

/**
 * Extract clean slide data from PPTX, ODP, or legacy binary PPT
 */
async function extractPresentationSlides(doc: DocumentIR): Promise<SlideData[]> {
  const slides: SlideData[] = [];
  const buffer = doc.rawBuffer;

  // 1. Try ZIP-based PPTX extraction
  if (buffer) {
    try {
      const zip = await JSZip.loadAsync(buffer);

      // Extract all media images
      const mediaMap: Record<string, string> = {};
      const globalImages: string[] = [];
      const mediaFiles = Object.keys(zip.files).filter(
        (name) =>
          (name.startsWith("ppt/media/") || name.startsWith("Pictures/")) &&
          !zip.files[name].dir
      );

      for (const mediaPath of mediaFiles) {
        const ext = mediaPath.split(".").pop()?.toLowerCase() || "png";
        const mime =
          ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "svg"
            ? "image/svg+xml"
            : ext === "gif"
            ? "image/gif"
            : "image/png";

        const base64 = await zip.files[mediaPath].async("base64");
        const dataUrl = `data:${mime};base64,${base64}`;
        mediaMap[mediaPath] = dataUrl;
        mediaMap[mediaPath.split("/").pop() || ""] = dataUrl;
        globalImages.push(dataUrl);
      }

      // Find all slide XML files
      const slideFiles = Object.keys(zip.files)
        .filter((name) => name.startsWith("ppt/slides/slide") && name.endsWith(".xml"))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/[^0-9]/g, "") || "0", 10);
          const numB = parseInt(b.replace(/[^0-9]/g, "") || "0", 10);
          return numA - numB;
        });

      if (slideFiles.length > 0) {
        for (let i = 0; i < slideFiles.length; i++) {
          const slidePath = slideFiles[i];
          const slideXml = await zip.files[slidePath].async("string");
          const slideNum = i + 1;

          // Read slide relationships (mapping rIdX -> media)
          const relsPath = `ppt/slides/_rels/${slidePath.split("/").pop()}.rels`;
          const relsXml = await zip.file(relsPath)?.async("string");
          const relsMap: Record<string, string> = {};

          if (relsXml) {
            const relMatches = relsXml.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/gi);
            for (const m of relMatches) {
              const rId = m[1];
              const target = m[2].replace(/^..\//, "ppt/");
              const baseName = target.split("/").pop() || "";
              relsMap[rId] = mediaMap[target] || mediaMap[baseName] || "";
            }
          }

          const slideImages: string[] = [];
          const textMatches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
          const allTexts = textMatches
            .map((m) => m.replace(/<[^>]+>/g, "").trim())
            .filter(Boolean);

          const slideTitle = allTexts[0] || `Slide ${slideNum}`;
          const points = allTexts.slice(1);

          const picMatches = slideXml.matchAll(/<a:blip[^>]*r:embed="([^"]+)"/gi);
          for (const pm of picMatches) {
            const rId = pm[1];
            if (relsMap[rId]) {
              slideImages.push(relsMap[rId]);
            }
          }

          if (slideImages.length === 0 && globalImages[i]) {
            slideImages.push(globalImages[i]);
          }

          slides.push({
            slideNumber: slideNum,
            title: slideTitle,
            points,
            images: slideImages,
          });
        }
        return slides;
      }
    } catch {
      // Not a valid ZIP, proceed to binary parsing
    }
  }

  // 2. Try binary PPT parsing (OLE2 format)
  if (buffer) {
    const { slides: binarySlides } = parseBinaryPptRecords(buffer);
    const embeddedImages = extractImagesFromBinaryBuffer(buffer);

    if (binarySlides.length > 0) {
      binarySlides.forEach((s, idx) => {
        const slideImg = embeddedImages[idx] ? [embeddedImages[idx]] : [];
        slides.push({
          slideNumber: idx + 1,
          title: s.title || `Slide ${idx + 1}`,
          points: s.points || [],
          images: slideImg,
        });
      });
      return slides;
    }
  }

  // 3. Fallback: use DocumentIR structured sections
  const slideSections = doc.sections.filter((s) => s.type === "slide");
  const embeddedImages = buffer ? extractImagesFromBinaryBuffer(buffer) : [];

  if (slideSections.length > 0) {
    slideSections.forEach((s, idx) => {
      const slideSec = s as { type: "slide"; title: string; points: string[] };
      const slideImg = embeddedImages[idx] ? [embeddedImages[idx]] : [];
      slides.push({
        slideNumber: idx + 1,
        title: slideSec.title || `Slide ${idx + 1}`,
        points: slideSec.points || [],
        images: slideImg,
      });
    });
    return slides;
  }

  // 4. Chunk paragraphs into presentation slides
  const paragraphs = doc.sections
    .filter((s) => s.type === "paragraph" || s.type === "heading")
    .map((s) => (s as any).text || "");

  const chunkSize = 4;
  const totalSlides = Math.max(1, Math.ceil(paragraphs.length / chunkSize));

  for (let i = 0; i < totalSlides; i++) {
    const chunk = paragraphs.slice(i * chunkSize, (i + 1) * chunkSize);
    const slideImg = embeddedImages[i] ? [embeddedImages[i]] : [];
    slides.push({
      slideNumber: i + 1,
      title: chunk[0] || `${doc.title || "Presentation"} - Slide ${i + 1}`,
      points: chunk.slice(1),
      images: slideImg,
    });
  }

  return slides;
}

/**
 * Universal Presentation to PDF conversion using an isolated iframe sandbox
 * and high-resolution screenshot rasterization.
 */
export async function renderPresentationToPdf(
  doc: DocumentIR,
  options: DocumentConversionOptions = {},
  onProgress?: (progress: number, text: string) => void
): Promise<Blob | null> {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return null;
  }

  let iframe: HTMLIFrameElement | null = null;

  try {
    const { default: html2canvas } = await import("html2canvas");
    onProgress?.(15, "Analyzing presentation slides and media...");

    const slides = await extractPresentationSlides(doc);
    if (slides.length === 0) return null;

    onProgress?.(25, `Rendering ${slides.length} presentation slides in sandbox iframe...`);

    const renderWidthPx = 1280;
    const renderHeightPx = 720;
    const pdfWidthPt = 792;
    const pdfHeightPt = 445.5;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: [pdfWidthPt, pdfHeightPt],
    });

    // Create completely isolated offscreen iframe to avoid CSS / Tailwind color conflicts
    iframe = document.createElement("iframe");
    iframe.id = "presentation-render-iframe";
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = `${renderWidthPx}px`;
    iframe.style.height = `${renderHeightPx}px`;
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Unable to create iframe document context");
    }

    // Set isolated styles in iframe
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              width: ${renderWidthPx}px;
              height: ${renderHeightPx}px;
              overflow: hidden;
              background-color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            .slide-root {
              width: ${renderWidthPx}px;
              height: ${renderHeightPx}px;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
              padding: 56px 64px 44px 64px;
              position: relative;
            }
            .accent-bar {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 6px;
              background: linear-gradient(90deg, #3b82f6, #6366f1, #ec4899);
            }
            .slide-badge {
              font-size: 13px;
              font-weight: 700;
              padding: 4px 12px;
              border-radius: 20px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div id="slide-container"></div>
        </body>
      </html>
    `);
    iframeDoc.close();

    const slideContainer = iframeDoc.getElementById("slide-container");
    if (!slideContainer) return null;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const isTitleSlide = i === 0;
      const hasImages = slide.images.length > 0;
      const mainImage = hasImages ? slide.images[0] : null;

      const pct = Math.round(30 + ((i + 1) / slides.length) * 60);
      onProgress?.(pct, `Capturing slide ${i + 1} of ${slides.length} (${slide.title.slice(0, 25)})...`);

      slideContainer.innerHTML = `
        <div class="slide-root" style="
          background: ${
            isTitleSlide
              ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%)"
              : "#ffffff"
          };
          color: ${isTitleSlide ? "#f8fafc" : "#0f172a"};
        ">
          <div class="accent-bar"></div>

          <!-- Slide Header -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: ${isTitleSlide ? "24px" : "32px"};
          ">
            <div style="display: flex; align-items: center; gap: 14px;">
              <span class="slide-badge" style="
                background: ${isTitleSlide ? "#3b82f6" : "#f1f5f9"};
                color: ${isTitleSlide ? "#ffffff" : "#475569"};
              ">
                Slide ${slide.slideNumber}
              </span>
              ${
                !isTitleSlide && doc.title
                  ? `<span style="font-size: 14px; color: #94a3b8; font-weight: 500;">${escapeHtml(
                      doc.title
                    )}</span>`
                  : ""
              }
            </div>
            <span style="font-size: 13px; color: ${
              isTitleSlide ? "#64748b" : "#94a3b8"
            }; font-weight: 500;">
              wild · presentation converter
            </span>
          </div>

          <!-- Title & Main Content Area -->
          <div style="
            flex: 1;
            display: flex;
            gap: 40px;
            align-items: ${isTitleSlide ? "center" : "flex-start"};
            justify-content: ${isTitleSlide ? "center" : "flex-start"};
          ">
            <!-- Main Content Column -->
            <div style="
              flex: ${mainImage ? "1.2" : "1"};
              display: flex;
              flex-direction: column;
              ${isTitleSlide ? "text-align: center; max-width: 900px;" : ""}
            ">
              <h1 style="
                font-size: ${isTitleSlide ? "46px" : "32px"};
                font-weight: 800;
                line-height: 1.2;
                margin: 0 0 ${isTitleSlide ? "28px" : "24px"} 0;
                color: ${isTitleSlide ? "#ffffff" : "#0f172a"};
                letter-spacing: -0.5px;
              ">
                ${escapeHtml(slide.title)}
              </h1>

              ${
                slide.points.length > 0
                  ? `
                <div style="display: flex; flex-direction: column; gap: 14px;">
                  ${slide.points
                    .map(
                      (b) => `
                    <div style="
                      display: flex;
                      align-items: flex-start;
                      gap: 14px;
                      background: ${isTitleSlide ? "rgba(255,255,255,0.06)" : "#f8fafc"};
                      border: 1px solid ${isTitleSlide ? "rgba(255,255,255,0.12)" : "#e2e8f0"};
                      border-radius: 10px;
                      padding: 14px 18px;
                    ">
                      <div style="
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: #3b82f6;
                        margin-top: 8px;
                        flex-shrink: 0;
                      "></div>
                      <span style="
                        font-size: 16px;
                        line-height: 1.5;
                        color: ${isTitleSlide ? "#e2e8f0" : "#334155"};
                        font-weight: 500;
                      ">
                        ${escapeHtml(b)}
                      </span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>

            <!-- Image Column if slide has picture -->
            ${
              mainImage
                ? `
              <div style="
                flex: 0.9;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
              ">
                <div style="
                  border-radius: 12px;
                  overflow: hidden;
                  border: 1px solid ${isTitleSlide ? "rgba(255,255,255,0.15)" : "#e2e8f0"};
                  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                  max-height: 420px;
                  display: flex;
                ">
                  <img src="${mainImage}" style="max-width: 100%; max-height: 420px; object-fit: contain; display: block;" />
                </div>
              </div>
            `
                : ""
            }
          </div>

          <!-- Slide Footer -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 18px;
            border-top: 1px solid ${
              isTitleSlide ? "rgba(255,255,255,0.1)" : "#e2e8f0"
            };
            margin-top: auto;
          ">
            <span style="font-size: 12px; color: ${
              isTitleSlide ? "#94a3b8" : "#64748b"
            }; font-weight: 500;">
              ${escapeHtml(doc.title || "Presentation Document")}
            </span>
            <span style="font-size: 12px; color: ${
              isTitleSlide ? "#94a3b8" : "#64748b"
            }; font-weight: 600;">
              ${i + 1} / ${slides.length}
            </span>
          </div>
        </div>
      `;

      // Wait a microtick for layout and images to paint
      await new Promise((resolve) => setTimeout(resolve, 80));

      const canvas = await html2canvas(iframeDoc.body, {
        width: renderWidthPx,
        height: renderHeightPx,
        scale: 2.0,
        useCORS: true,
        logging: false,
        backgroundColor: isTitleSlide ? "#0f172a" : "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      if (i > 0) {
        pdf.addPage([pdfWidthPt, pdfHeightPt], "landscape");
      }

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        pdfWidthPt,
        pdfHeightPt,
        undefined,
        "FAST"
      );
    }

    onProgress?.(95, "Compiling final PDF payload...");
    return pdf.output("blob");
  } catch (err) {
    console.warn("renderPresentationToPdf iframe error:", err);
  } finally {
    if (iframe && document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }

  return null;
}
