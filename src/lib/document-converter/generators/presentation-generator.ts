import pptxgen from "pptxgenjs";
import JSZip from "jszip";
import type { DocumentIR, DocumentConversionOptions } from "../types";

export async function generatePresentation(
  doc: DocumentIR,
  format: "pptx" | "ppt" | "odp",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: DocumentConversionOptions = {}
): Promise<Blob> {
  const slides: { title: string; points: string[] }[] = [];

  // Extract slides from doc sections or generate slides from headings/paragraphs
  doc.sections.forEach((sec) => {
    if (sec.type === "slide") {
      slides.push({ title: sec.title, points: sec.points });
    } else if (sec.type === "heading" && sec.level <= 2) {
      slides.push({ title: sec.text, points: [] });
    } else if (sec.type === "paragraph" || sec.type === "list") {
      if (slides.length === 0) {
        slides.push({ title: doc.title || "Slide 1", points: [] });
      }
      const lastSlide = slides[slides.length - 1];
      if (sec.type === "paragraph") {
        lastSlide.points.push(sec.text);
      } else if (sec.type === "list") {
        lastSlide.points.push(...sec.items);
      }
    }
  });

  if (slides.length === 0) {
    slides.push({ title: doc.title || "Presentation", points: ["Converted using wild-converter."] });
  }

  if (format === "odp") {
    return buildOdpPackage(doc.title || "Presentation", slides);
  }

  // Use pptxgenjs for PPTX generation
  try {
    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.title = doc.title || "Presentation";

    for (const slideData of slides) {
      const slide = pres.addSlide();
      // Slide Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 0.6,
        w: "85%",
        h: 1.0,
        fontSize: 24,
        fontFace: "Helvetica",
        bold: true,
        color: "0f172a",
      });

      // Slide Bullet Content
      if (slideData.points && slideData.points.length > 0) {
        const bulletItems = slideData.points.map((p) => ({
          text: p,
          options: { fontSize: 14, color: "334155", bullet: true, breakLine: true },
        }));

        slide.addText(bulletItems, {
          x: 0.8,
          y: 1.8,
          w: "85%",
          h: 4.5,
          fontFace: "Helvetica",
        });
      }
    }

    if (typeof window !== "undefined") {
      const blob = (await pres.write({ outputType: "blob" })) as Blob;
      return blob;
    } else {
      const buffer = (await pres.write({ outputType: "nodebuffer" })) as Buffer;
      return new Blob([new Uint8Array(buffer)], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
    }
  } catch {
    return buildFallbackPptxPackage(doc.title || "Presentation", slides);
  }
}

// ─── Fallback PPTX OpenXML Package Builder ─────────────────────────────────────

async function buildFallbackPptxPackage(
  title: string,
  slides: { title: string; points: string[] }[]
): Promise<Blob> {
  const zip = new JSZip();

  let contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>`;

  slides.forEach((_, idx) => {
    contentTypes += `\n  <Override PartName="/ppt/slides/slide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  });
  contentTypes += "\n</Types>";
  zip.file("[Content_Types].xml", contentTypes);

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  let presRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;
  slides.forEach((_, idx) => {
    presRels += `\n  <Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${idx + 1}.xml"/>`;
  });
  presRels += "\n</Relationships>";
  zip.file("ppt/_rels/presentation.xml.rels", presRels);

  let slideIdList = "";
  slides.forEach((_, idx) => {
    slideIdList += `<p:sldId id="${256 + idx}" r:id="rId${idx + 1}"/>`;
  });

  const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
    ${slideIdList}
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;
  zip.file("ppt/presentation.xml", presentationXml);

  slides.forEach((slide, idx) => {
    let bodyTextRuns = "";
    slide.points.forEach((p) => {
      bodyTextRuns += `<a:p><a:pPr lvl="0"/><a:r><a:rPr lang="en-US" sz="2000"/><a:t>${escapeXml(p)}</a:t></a:r></a:p>`;
    });

    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:grpSpPr/></p:nvGrpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="838200" y="457200"/><a:ext cx="10515600" cy="1143000"/></a:xfrm></p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p><a:r><a:rPr lang="en-US" sz="3600" b="1"/><a:t>${escapeXml(slide.title)}</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Content"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="838200" y="1800000"/><a:ext cx="10515600" cy="4500000"/></a:xfrm></p:spPr>
        <p:txBody>
          <a:bodyPr/>
          ${bodyTextRuns}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
    zip.file(`ppt/slides/slide${idx + 1}.xml`, slideXml);
  });

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
}

// ─── ODP OpenDocument Presentation Builder ────────────────────────────────────

async function buildOdpPackage(
  title: string,
  slides: { title: string; points: string[] }[]
): Promise<Blob> {
  const zip = new JSZip();
  zip.file("mimetype", "application/vnd.oasis.opendocument.presentation", { compression: "STORE" });

  let pagesXml = "";
  slides.forEach((slide, idx) => {
    let listXml = "";
    slide.points.forEach((p) => {
      listXml += `<text:list-item><text:p>${escapeXml(p)}</text:p></text:list-item>`;
    });

    pagesXml += `<draw:page draw:name="page${idx + 1}">
      <draw:frame svg:x="1cm" svg:y="1cm" svg:width="25cm" svg:height="3cm">
        <draw:text-box><text:h text:outline-level="1">${escapeXml(slide.title)}</text:h></draw:text-box>
      </draw:frame>
      <draw:frame svg:x="1cm" svg:y="4.5cm" svg:width="25cm" svg:height="14cm">
        <draw:text-box><text:list>${listXml}</text:list></draw:text-box>
      </draw:frame>
    </draw:page>`;
  });

  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0">
  <office:body>
    <office:presentation>
      ${pagesXml}
    </office:presentation>
  </office:body>
</office:document-content>`;

  zip.file("content.xml", contentXml);

  const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.presentation"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

  zip.folder("META-INF")?.file("manifest.xml", manifestXml);

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.oasis.opendocument.presentation",
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
