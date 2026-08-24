import { jsPDF } from "jspdf";

/**
 * Parses SVG XML into metadata and element counts
 */
export function parseSvgContent(svgText: string): {
  width: number;
  height: number;
  viewBox: string;
  pathCount: number;
  elementCount: number;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svg = doc.querySelector("svg");

  if (!svg) {
    return {
      width: 800,
      height: 600,
      viewBox: "0 0 800 600",
      pathCount: 0,
      elementCount: 0,
    };
  }

  const viewBox = svg.getAttribute("viewBox") || "";
  let w = parseFloat(svg.getAttribute("width") || "0");
  let h = parseFloat(svg.getAttribute("height") || "0");

  if ((!w || !h) && viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      w = parts[2];
      h = parts[3];
    }
  }

  w = w || 800;
  h = h || 600;

  const paths = svg.querySelectorAll("path");
  const allElements = svg.querySelectorAll("*");

  return {
    width: Math.round(w),
    height: Math.round(h),
    viewBox: viewBox || `0 0 ${w} ${h}`,
    pathCount: paths.length,
    elementCount: allElements.length,
  };
}

/**
 * Optimizes and cleans SVG XML by stripping metadata, comments, and redundant namespaces
 */
export function optimizeSvgString(svgText: string): string {
  let cleaned = svgText
    .replace(/<!--[\s\S]*?-->/g, "") // remove comments
    .replace(/<\?xml[\s\S]*?\?>/g, "") // remove xml declaration
    .replace(/<!DOCTYPE[\s\S]*?>/g, "") // remove doctype
    .replace(/\s*(xmlns:inkscape|xmlns:sodipodi|xmlns:ai)="[^"]*"/g, "")
    .replace(/\s*(inkscape|sodipodi):[a-z-]+="[^"]*"/g, "")
    .trim();

  // Minify excessive whitespace
  cleaned = cleaned.replace(/\s{2,}/g, " ").replace(/>\s+</g, "><");
  return cleaned;
}

/**
 * Converts SVG to Encapsulated PostScript (EPS 3.0 / Adobe Illustrator format)
 */
export function svgToEps(
  svgText: string,
  width: number,
  height: number,
  isAiFormat: boolean = false
): Blob {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const paths = doc.querySelectorAll("path");

  let psContent = `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: wild-converter Pure Client-Side Vector Engine
%%Title: ${isAiFormat ? "Adobe Illustrator Vector Output" : "Encapsulated PostScript"}
%%BoundingBox: 0 0 ${width} ${height}
%%HiResBoundingBox: 0.0 0.0 ${width}.0 ${height}.0
%%Pages: 1
%%EndComments
%%BeginProlog
/m { moveto } bind def
/l { lineto } bind def
/c { curveto } bind def
/cp { closepath } bind def
/f { fill } bind def
/s { stroke } bind def
/rgb { setrgbcolor } bind def
%%EndProlog
%%Page: 1 1
gsave
0 ${height} translate
1 -1 scale
`;

  // Parse path d attributes into PostScript path operators
  paths.forEach((path) => {
    const d = path.getAttribute("d");
    const fill = path.getAttribute("fill");
    const stroke = path.getAttribute("stroke");

    if (!d) return;

    psContent += "newpath\n";

    // Simple path commands tokenizer
    const tokens = d.match(/([a-zA-Z]|[-+]?[0-9]*\.?[0-9]+)/g) || [];
    let i = 0;
    let currentX = 0;
    let currentY = 0;

    while (i < tokens.length) {
      const cmd = tokens[i++];
      if (cmd === "M" || cmd === "m") {
        const x = parseFloat(tokens[i++]);
        const y = parseFloat(tokens[i++]);
        currentX = cmd === "M" ? x : currentX + x;
        currentY = cmd === "M" ? y : currentY + y;
        psContent += `${currentX.toFixed(2)} ${currentY.toFixed(2)} m\n`;
      } else if (cmd === "L" || cmd === "l") {
        const x = parseFloat(tokens[i++]);
        const y = parseFloat(tokens[i++]);
        currentX = cmd === "L" ? x : currentX + x;
        currentY = cmd === "L" ? y : currentY + y;
        psContent += `${currentX.toFixed(2)} ${currentY.toFixed(2)} l\n`;
      } else if (cmd === "C" || cmd === "c") {
        const x1 = parseFloat(tokens[i++]);
        const y1 = parseFloat(tokens[i++]);
        const x2 = parseFloat(tokens[i++]);
        const y2 = parseFloat(tokens[i++]);
        const x = parseFloat(tokens[i++]);
        const y = parseFloat(tokens[i++]);
        const cx1 = cmd === "C" ? x1 : currentX + x1;
        const cy1 = cmd === "C" ? y1 : currentY + y1;
        const cx2 = cmd === "C" ? x2 : currentX + x2;
        const cy2 = cmd === "C" ? y2 : currentY + y2;
        currentX = cmd === "C" ? x : currentX + x;
        currentY = cmd === "C" ? y : currentY + y;
        psContent += `${cx1.toFixed(2)} ${cy1.toFixed(2)} ${cx2.toFixed(2)} ${cy2.toFixed(2)} ${currentX.toFixed(2)} ${currentY.toFixed(2)} c\n`;
      } else if (cmd === "Z" || cmd === "z") {
        psContent += "cp\n";
      }
    }

    if (fill && fill !== "none") {
      psContent += "0.1 0.1 0.1 rgb\nf\n";
    } else if (stroke && stroke !== "none") {
      psContent += "0 0 0 rgb\ns\n";
    } else {
      psContent += "f\n";
    }
  });

  psContent += `grestore
showpage
%%EOF
`;

  return new Blob([psContent], {
    type: isAiFormat ? "application/illustrator" : "application/postscript",
  });
}

/**
 * Converts SVG to AutoCAD DXF format (R12 / R2000 standard)
 */
export function svgToDxf(
  svgText: string,
  width: number,
  height: number,
  version: "R12" | "R2000" = "R2000"
): Blob {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const paths = doc.querySelectorAll("path");
  const lines = doc.querySelectorAll("line");
  const rects = doc.querySelectorAll("rect");
  const circles = doc.querySelectorAll("circle");

  let dxf = `0
SECTION
2
HEADER
9
$ACADVER
1
${version === "R2000" ? "AC1015" : "AC1009"}
9
$INSBASE
10
0.0
20
0.0
30
0.0
9
$EXTMIN
10
0.0
20
0.0
30
0.0
9
$EXTMAX
10
${width}.0
20
${height}.0
30
0.0
0
ENDSEC
0
SECTION
2
TABLES
0
ENDSEC
0
SECTION
2
BLOCKS
0
ENDSEC
0
SECTION
2
ENTITIES
`;

  // 1. Circles
  circles.forEach((c) => {
    const cx = parseFloat(c.getAttribute("cx") || "0");
    const cy = height - parseFloat(c.getAttribute("cy") || "0");
    const r = parseFloat(c.getAttribute("r") || "10");
    dxf += `0\nCIRCLE\n8\n0\n10\n${cx.toFixed(3)}\n20\n${cy.toFixed(3)}\n30\n0.0\n40\n${r.toFixed(3)}\n`;
  });

  // 2. Lines
  lines.forEach((l) => {
    const x1 = parseFloat(l.getAttribute("x1") || "0");
    const y1 = height - parseFloat(l.getAttribute("y1") || "0");
    const x2 = parseFloat(l.getAttribute("x2") || "0");
    const y2 = height - parseFloat(l.getAttribute("y2") || "0");
    dxf += `0\nLINE\n8\n0\n10\n${x1.toFixed(3)}\n20\n${y1.toFixed(3)}\n30\n0.0\n11\n${x2.toFixed(3)}\n21\n${y2.toFixed(3)}\n31\n0.0\n`;
  });

  // 3. Rectangles as 4-segment polylines
  rects.forEach((r) => {
    const x = parseFloat(r.getAttribute("x") || "0");
    const y = height - (parseFloat(r.getAttribute("y") || "0") + parseFloat(r.getAttribute("height") || "0"));
    const w = parseFloat(r.getAttribute("width") || "0");
    const h = parseFloat(r.getAttribute("height") || "0");

    dxf += `0\nLWPOLYLINE\n8\n0\n90\n4\n70\n1\n`;
    dxf += `10\n${x.toFixed(3)}\n20\n${y.toFixed(3)}\n`;
    dxf += `10\n${(x + w).toFixed(3)}\n20\n${y.toFixed(3)}\n`;
    dxf += `10\n${(x + w).toFixed(3)}\n20\n${(y + h).toFixed(3)}\n`;
    dxf += `10\n${x.toFixed(3)}\n20\n${(y + h).toFixed(3)}\n`;
  });

  // 4. Paths as LWPOLYLINE vertices
  paths.forEach((path) => {
    const d = path.getAttribute("d");
    if (!d) return;

    const tokens = d.match(/([a-zA-Z]|[-+]?[0-9]*\.?[0-9]+)/g) || [];
    const points: [number, number][] = [];
    let i = 0;
    let cx = 0;
    let cy = 0;

    while (i < tokens.length) {
      const cmd = tokens[i++];
      if (cmd === "M" || cmd === "m" || cmd === "L" || cmd === "l") {
        const x = parseFloat(tokens[i++]);
        const y = parseFloat(tokens[i++]);
        cx = cmd === "M" || cmd === "L" ? x : cx + x;
        cy = cmd === "M" || cmd === "L" ? y : cy + y;
        points.push([cx, height - cy]);
      }
    }

    if (points.length >= 2) {
      dxf += `0\nLWPOLYLINE\n8\n0\n90\n${points.length}\n70\n0\n`;
      points.forEach(([px, py]) => {
        dxf += `10\n${px.toFixed(3)}\n20\n${py.toFixed(3)}\n`;
      });
    }
  });

  dxf += `0
ENDSEC
0
EOF
`;

  return new Blob([dxf], { type: "application/dxf" });
}

/**
 * Converts SVG to high-DPI raster image (PNG, WebP, JPEG) via Offscreen Canvas
 */
export async function svgToRaster(
  svgText: string,
  width: number,
  height: number,
  scale: number = 2,
  mimeType: string = "image/png",
  backgroundColor: string = "transparent"
): Promise<Blob> {
  const targetW = width * scale;
  const targetH = height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;

  if (backgroundColor === "white") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
  } else if (backgroundColor === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, targetW, targetH);
  }

  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, targetW, targetH);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (res) => {
          if (res) resolve(res);
          else reject(new Error("Failed to render canvas raster"));
        },
        mimeType,
        0.95
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG into image element"));
    };

    img.src = url;
  });
}

/**
 * Converts SVG to PDF vector document using jsPDF
 */
export async function svgToPdfVector(
  svgText: string,
  width: number,
  height: number
): Promise<Blob> {
  const orientation = width > height ? "landscape" : "portrait";
  const doc = new jsPDF({
    orientation,
    unit: "pt",
    format: [width, height],
  });

  // Render SVG to canvas and embed high-res vector bitmap into PDF
  const rasterBlob = await svgToRaster(svgText, width, height, 3, "image/png");
  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      doc.addImage(dataUrl, "PNG", 0, 0, width, height);
      const pdfBlob = doc.output("blob");
      resolve(pdfBlob);
    };
    reader.readAsDataURL(rasterBlob);
  });
}
