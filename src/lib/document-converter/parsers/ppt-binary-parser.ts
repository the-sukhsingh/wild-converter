import type { DocumentSlideSection } from "../types";

/**
 * Microsoft PowerPoint 97-2004 (.ppt) Binary Record Parser
 * Parses genuine text records (RT_TextCharsAtom = 0x0FA0, RT_TextBytesAtom = 0x0FA8)
 * and slide boundaries (RT_Slide = 0x03EE, RT_SlideListWithText = 0x0FF0) from OLE2 streams
 * while ignoring binary BLIP / JPEG / PNG image data.
 */
export function parseBinaryPptRecords(arrayBuffer: ArrayBuffer): {
  slides: DocumentSlideSection[];
  allText: string;
} {
  const data = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  const len = arrayBuffer.byteLength;

  const slides: DocumentSlideSection[] = [];
  let currentSlideTitle = "";
  let currentSlidePoints: string[] = [];

  function flushCurrentSlide() {
    if (currentSlideTitle || currentSlidePoints.length > 0) {
      slides.push({
        type: "slide",
        title: currentSlideTitle || `Slide ${slides.length + 1}`,
        points: currentSlidePoints,
      });
      currentSlideTitle = "";
      currentSlidePoints = [];
    }
  }

  // Scan for 8-byte PowerPoint Record Headers:
  // [ver+inst: 2 bytes] [recType: 2 bytes uint16 LE] [recLen: 4 bytes uint32 LE]
  let offset = 0;
  while (offset + 8 <= len) {
    const recType = data.getUint16(offset + 2, true);
    const recLen = data.getUint32(offset + 4, true);

    // Sanity check for length
    if (recLen > len - offset - 8 || recLen > 10000000) {
      offset++;
      continue;
    }

    // RT_Slide = 0x03EE (Start of a new slide)
    if (recType === 0x03ee) {
      flushCurrentSlide();
      offset += 8;
      continue;
    }

    // RT_TextCharsAtom = 0x0FA0 (UTF-16LE text)
    if (recType === 0x0fa0 && recLen >= 2) {
      const textChars: string[] = [];
      const charCount = Math.floor(recLen / 2);
      for (let i = 0; i < charCount; i++) {
        const code = data.getUint16(offset + 8 + i * 2, true);
        if (code >= 32 && code !== 0xfffd && code < 65534) {
          textChars.push(String.fromCharCode(code));
        } else if (code === 10 || code === 13) {
          textChars.push("\n");
        }
      }

      const str = textChars.join("").trim();
      if (str.length > 0 && isMeaningfulText(str)) {
        addTextToSlide(str, (t, p) => {
          if (!currentSlideTitle) currentSlideTitle = t;
          else currentSlidePoints.push(...p);
        });
      }

      offset += 8 + recLen;
      continue;
    }

    // RT_TextBytesAtom = 0x0FA8 (ASCII text)
    if (recType === 0x0fa8 && recLen >= 1) {
      const textChars: string[] = [];
      for (let i = 0; i < recLen; i++) {
        const b = bytes[offset + 8 + i];
        if (b >= 32 && b < 127) {
          textChars.push(String.fromCharCode(b));
        } else if (b === 10 || b === 13) {
          textChars.push("\n");
        }
      }

      const str = textChars.join("").trim();
      if (str.length > 0 && isMeaningfulText(str)) {
        addTextToSlide(str, (t, p) => {
          if (!currentSlideTitle) currentSlideTitle = t;
          else currentSlidePoints.push(...p);
        });
      }

      offset += 8 + recLen;
      continue;
    }

    // Advance
    offset++;
  }

  flushCurrentSlide();

  // If no structured slides could be formed, extract clean unicode strings
  if (slides.length === 0) {
    const cleanStrings = extractPrintablePptStrings(bytes);
    if (cleanStrings.length > 0) {
      const chunkSize = 4;
      for (let i = 0; i < cleanStrings.length; i += chunkSize) {
        const chunk = cleanStrings.slice(i, i + chunkSize);
        slides.push({
          type: "slide",
          title: chunk[0] || `Slide ${Math.floor(i / chunkSize) + 1}`,
          points: chunk.slice(1),
        });
      }
    }
  }

  const allText = slides
    .map((s) => `=== ${s.title} ===\n` + s.points.map((p) => `• ${p}`).join("\n"))
    .join("\n\n");

  return { slides, allText };
}

function addTextToSlide(
  str: string,
  addFn: (title: string, points: string[]) => void
) {
  const lines = str
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return;
  addFn(lines[0], lines.slice(1));
}

/**
 * Filter out random binary sequences / JFIF headers / metadata noise
 */
function isMeaningfulText(str: string): boolean {
  if (str.length < 2) return false;
  // Ignore binary stream headers
  if (
    str.startsWith("JFIF") ||
    str.startsWith("Exif") ||
    str.startsWith("Photoshop") ||
    str.startsWith("Ducky") ||
    str.includes("456789:CDEF") ||
    str.includes("PowerPoint Document") ||
    str.includes("Current User") ||
    str.includes("SummaryInformation") ||
    str.includes("DocumentSummaryInformation")
  ) {
    return false;
  }

  // Must contain mostly readable ASCII or common unicode letters/numbers
  const readable = str.replace(/[^A-Za-z0-9\s.,!?:;'"()\-_/]/g, "");
  return readable.length / str.length >= 0.7;
}

/**
 * Fallback: extract clean UTF-16LE strings (minimum length 4) with valid words
 */
function extractPrintablePptStrings(bytes: Uint8Array): string[] {
  const results: string[] = [];
  let currentWord: string[] = [];

  for (let i = 0; i < bytes.length - 1; i += 2) {
    const charCode = bytes[i] | (bytes[i + 1] << 8);
    if (
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122) ||
      (charCode >= 48 && charCode <= 57) ||
      charCode === 32 ||
      charCode === 44 ||
      charCode === 46 ||
      charCode === 45 ||
      charCode === 58
    ) {
      currentWord.push(String.fromCharCode(charCode));
    } else {
      if (currentWord.length >= 4) {
        const text = currentWord.join("").trim();
        if (isMeaningfulText(text) && !results.includes(text)) {
          results.push(text);
        }
      }
      currentWord = [];
    }
  }

  return results.slice(0, 80);
}
