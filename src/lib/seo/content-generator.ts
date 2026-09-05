import { getFormatSpec } from "./format-registry";
import {
  getOutboundConversions,
  getInboundConversions,
  getSiblingFormats,
  normalizeFormatId
} from "./pair-registry";
import { SITE_NAME, SITE_URL } from "./constants";
import type {
  FormatSpec,
  SEOPageData,
  FormatHubData,
  TechnicalComparisonDimension,
  FAQItem,
  HowToStep
} from "./types";

/**
 * Builds the 8-dimension technical comparison matrix for any two formats.
 */
function buildComparisonMatrix(from: FormatSpec, to: FormatSpec): TechnicalComparisonDimension[] {
  const dimensions: TechnicalComparisonDimension[] = [
    {
      feature: "Compression Strategy",
      fromValue: from.lossless ? `Lossless (${from.compressionType})` : `Lossy (${from.compressionType})`,
      toValue: to.lossless ? `Lossless (${to.compressionType})` : `Lossy (${to.compressionType})`,
      winner: to.lossless ? "to" : "from",
      explanation: `${from.name} employs ${from.compressionType}, whereas ${to.name} utilizes ${to.compressionType}.`
    },
    {
      feature: "Alpha Transparency",
      fromValue: from.supportsAlpha ? "Supported (Full Alpha Channel)" : "Not Supported",
      toValue: to.supportsAlpha ? "Supported (Full Alpha Channel)" : "Not Supported",
      winner: from.supportsAlpha === to.supportsAlpha ? "tie" : to.supportsAlpha ? "to" : "from",
      explanation: !to.supportsAlpha && from.supportsAlpha
        ? `Warning: ${to.extension.toUpperCase()} does not support transparency; transparent backgrounds will be filled with solid white.`
        : `${to.extension.toUpperCase()} ${to.supportsAlpha ? "preserves" : "does not support"} transparent pixels.`
    },
    {
      feature: "Typical File Size",
      fromValue: from.typicalSize,
      toValue: to.typicalSize,
      winner: to.typicalSize.includes("KB") && !from.typicalSize.includes("KB") ? "to" : "tie",
      explanation: `Output files in ${to.extension.toUpperCase()} typically range around ${to.typicalSize}.`
    },
    {
      feature: "Animation Support",
      fromValue: from.supportsAnimation ? "Supported (Multi-frame sequence)" : "Static only",
      toValue: to.supportsAnimation ? "Supported (Multi-frame sequence)" : "Static only",
      winner: from.supportsAnimation === to.supportsAnimation ? "tie" : to.supportsAnimation ? "to" : "from",
      explanation: `${to.name} ${to.supportsAnimation ? "supports animated sequences" : "renders as a static single-frame asset"}.`
    },
    {
      feature: "Color / Bit Depth",
      fromValue: from.colorDepth,
      toValue: to.colorDepth,
      winner: "tie",
      explanation: `${from.extension.toUpperCase()} delivers ${from.colorDepth}, while ${to.extension.toUpperCase()} provides ${to.colorDepth}.`
    },
    {
      feature: "Standard & Governance",
      fromValue: from.standard || from.developer,
      toValue: to.standard || to.developer,
      winner: "tie",
      explanation: `${from.extension.toUpperCase()} standard is managed by ${from.developer}; ${to.extension.toUpperCase()} is governed by ${to.developer}.`
    },
    {
      feature: "Primary Use Case",
      fromValue: from.primaryUse,
      toValue: to.primaryUse,
      winner: "tie",
      explanation: `Switching aligns your asset with ${to.primaryUse.toLowerCase()}.`
    },
    {
      feature: "Hardware & Platform Support",
      fromValue: from.compatibleWith.join(", "),
      toValue: to.compatibleWith.join(", "),
      winner: "tie",
      explanation: `${to.name} is natively compatible with ${to.compatibleWith.slice(0, 3).join(", ")}.`
    }
  ];

  return dimensions;
}

/**
 * Generates context-specific conversion rationale based on the format characteristics.
 */
function generateIntentCopy(from: FormatSpec, to: FormatSpec): {
  summary: string;
  paragraph: string;
} {
  const fromName = from.name;
  const toName = to.name;
  const fromExt = from.extension.toUpperCase();
  const toExt = to.extension.toUpperCase();

  // Case 1: Photographic image to modern web format (e.g. PNG/JPG to WebP/AVIF)
  if (["png", "jpg", "jpeg"].includes(from.id) && ["webp", "avif"].includes(to.id)) {
    return {
      summary: `Reduce asset payload by 25–40% without noticeable visual degradation for superior Core Web Vitals and lightning-fast page loads.`,
      paragraph: `Converting ${fromExt} to ${toExt} is one of the most effective modern web performance optimizations. While ${fromName} is widely supported, ${toName} leverages next-generation predictive intra-frame compression algorithms originally developed for advanced video codecs. This delivers equivalent structural similarity (SSIM) visual quality at a fraction of the raw byte footprint, resulting in improved Google Lighthouse scores, reduced server bandwidth costs, and faster Time to Interactive (TTI) for web visitors.`
    };
  }

  // Case 2: Apple HEIC to Universal JPG/PNG
  if (from.id === "heic" && ["jpg", "jpeg", "png"].includes(to.id)) {
    return {
      summary: `Ensure 100% universal compatibility across non-Apple devices, web forms, and desktop publishing software.`,
      paragraph: `While ${fromName} is the default capture format for modern Apple iPhones due to its compact storage, it frequently encounters compatibility roadblocks when uploaded to legacy web portals, Windows applications, and email clients. Converting ${fromExt} to ${toExt} decodes the High Efficiency Image Container entirely inside your browser and outputs a globally recognized asset that opens reliably on any smartphone, television, computer, or digital frame without requiring proprietary codec packs.`
    };
  }

  // Case 3: Document to PDF
  if (to.id === "pdf" && from.id !== "pdf") {
    return {
      summary: `Lock formatting, typography, and page layout into a permanent, printable electronic document standard.`,
      paragraph: `Converting ${fromExt} to ${toExt} eliminates formatting discrepancies caused by missing system fonts or differences between word processor versions. The resulting Adobe Portable Document Format (PDF) embeds your layout, images, and text into a standardized vector structure conforming to ISO 32000 specifications, ensuring that clients, courts, printing presses, and colleagues view the exact visual presentation you intended.`
    };
  }

  // Case 4: PDF to Editable Document (e.g. DOCX/TXT)
  if (from.id === "pdf" && ["docx", "txt", "rtf"].includes(to.id)) {
    return {
      summary: `Extract structured text, tables, and typography into a fully editable word processing document.`,
      paragraph: `Static PDF documents are notoriously difficult to modify without expensive commercial editing software. Converting ${fromExt} to ${toExt} analyzes the underlying content streams and reconstructs paragraphs, headings, and character formatting into editable markup. This enables seamless redlining, copy revision, and content reuse in Microsoft Word, Google Docs, or LibreOffice.`
    };
  }

  // Case 5: Video to Audio extraction (MP4 to MP3)
  if (from.category === "video" && ["mp3", "wav", "aac"].includes(to.id)) {
    return {
      summary: `Extract high-fidelity audio streams for podcasting, transcription, voice memos, and mobile listening.`,
      paragraph: `Stripping the video stream from ${fromExt} files drastically slashes file sizes by up to 90% while isolating pristine audio samples. Our browser-based WebAudio and FFmpeg engine demuxes the media container locally, extracts the audio track without uploading gigabytes of video to remote servers, and encodes a clean ${toExt} file ready for audio players, speech-to-text models, and mobile playlists.`
    };
  }

  // Default intelligent technical fallback
  return {
    summary: `Transition from ${fromName} to ${toName} with zero server uploads and 100% client-side privacy.`,
    paragraph: `Transforming ${fromExt} files into ${toExt} enables you to harness the distinct technical architecture of ${toName}. While ${fromExt} is designed primarily for ${from.primaryUse.toLowerCase()}, ${toExt} provides specialized advantages for ${to.primaryUse.toLowerCase()}. With Wild Converter, the entire decoding and encoding lifecycle executes locally on your CPU via WebAssembly—ensuring zero data transmission to external cloud servers, zero file size limits, and instant processing speed.`
  };
}

/**
 * Generates tailored How-To steps for the specific format pair.
 */
function generateHowToSteps(from: FormatSpec, to: FormatSpec): HowToStep[] {
  const fromExt = from.extension.toUpperCase();
  const toExt = to.extension.toUpperCase();

  return [
    {
      name: `Select your ${fromExt} file`,
      text: `Drag and drop any .${from.extension} file into the converter stage above, or click to browse files from your local storage.`
    },
    {
      name: `Configure output settings`,
      text: `Wild Converter automatically pre-selects ${toExt} as your output format. Adjust quality, resolution, or compression options if desired.`
    },
    {
      name: `Instant WebAssembly conversion`,
      text: `Click Convert. Your browser decodes the ${fromExt} container and compiles the ${toExt} stream entirely on your device using client-side WASM.`
    },
    {
      name: `Download your ${toExt} asset`,
      text: `Save your converted .${to.extension} file immediately to your computer or mobile device with zero upload latency.`
    }
  ];
}

/**
 * Generates intent-matched, technically precise FAQs for the pair.
 */
function generatePairFAQs(from: FormatSpec, to: FormatSpec): FAQItem[] {
  const fromExt = from.extension.toUpperCase();
  const toExt = to.extension.toUpperCase();

  const faqs: FAQItem[] = [
    {
      question: `Will converting from ${fromExt} to ${toExt} reduce visual or audio quality?`,
      answer: to.lossless
        ? `No. Because ${to.name} is a lossless format, 100% of the decoded sample and pixel fidelity from your original ${fromExt} file is mathematically preserved with zero generation loss.`
        : from.lossless && to.lossy
        ? `Converting from a lossless format (${fromExt}) to a lossy format (${toExt}) applies perceptual compression to dramatically reduce file size. Wild Converter sets high-fidelity encoding defaults (typically 85–92% quality) so that visual differences remain imperceptible to the human eye.`
        : `Both ${fromExt} and ${toExt} are lossy formats. Our client-side encoder maintains optimal quantization parameters to minimize re-compression artifacts.`
    },
    {
      question: `Is my file uploaded to any cloud server during conversion?`,
      answer: `Never. Wild Converter operates entirely client-side using WebAssembly (WASM) and HTML5 APIs. Your ${fromExt} file is processed directly in your device's memory; no bytes, metadata, or telemetry are ever transmitted to external servers or stored in any database.`
    },
    {
      question: `How does ${toExt} compare to ${fromExt} in terms of file size?`,
      answer: `${from.typicalSize} is the standard range for ${fromExt}, whereas ${toExt} averages ${to.typicalSize}. ${
        to.supportsCompression
          ? `Because ${to.name} utilizes ${to.compressionType}, you can generally anticipate significant storage savings.`
          : `Because ${to.name} prioritizes uncompressed speed or vector precision, file size depends on the complexity of the underlying content.`
      }`
    },
    {
      question: `What happens to transparency and alpha channels when converting ${fromExt} to ${toExt}?`,
      answer: to.supportsAlpha
        ? `Full alpha transparency is completely retained. Any transparent pixels or gradient opacity levels in your ${fromExt} asset will render identically in the resulting ${toExt} file.`
        : `Because the ${toExt} format specification does not support alpha transparency channels, any transparent areas in your ${fromExt} file will automatically be rendered with a solid neutral background.`
    },
    {
      question: `Are there any file size limits when converting ${fromExt} to ${toExt}?`,
      answer: `Because Wild Converter processes files directly on your local CPU and RAM rather than on throttled cloud servers, there are no artificial file size caps or daily conversion limits. You can convert large files smoothly based on your device's available memory.`
    }
  ];

  return faqs;
}

/**
 * Builds complete, intent-matched SEO page data for any valid conversion pair.
 */
export function generateSEOPageData(fromId: string, toId: string): SEOPageData | null {
  const from = getFormatSpec(normalizeFormatId(fromId));
  const to = getFormatSpec(normalizeFormatId(toId));

  if (!from || !to) return null;

  const slug = `${from.extension}-to-${to.extension}`;
  const canonicalUrl = `${SITE_URL}/convert/${slug}`;
  const fromExt = from.extension.toUpperCase();
  const toExt = to.extension.toUpperCase();

  const intent = generateIntentCopy(from, to);
  const comparison = buildComparisonMatrix(from, to);
  const steps = generateHowToSteps(from, to);
  const faqs = generatePairFAQs(from, to);

  const outbound = getOutboundConversions(from.id, 8);
  const inbound = getInboundConversions(to.id, 8);
  const siblings = getSiblingFormats(from.id, 6);

  return {
    type: "pair",
    fromFormat: from,
    toFormat: to,
    slug,
    category: from.category,
    title: `Convert ${fromExt} to ${toExt} Online — Free & 100% Private`,
    metaDescription: `Convert ${fromExt} to ${toExt} directly in your browser with WebAssembly. ${intent.summary} 100% free, private, no server uploads.`,
    canonicalUrl,
    h1: `Convert ${fromExt} to ${toExt}`,
    h2Subhead: intent.summary,
    intentSummary: intent.summary,
    intentParagraph: intent.paragraph,
    comparisonDimensions: comparison,
    howToSteps: steps,
    faqs,
    reversePair: {
      from: to.id,
      to: from.id,
      label: `${toExt} to ${fromExt}`,
      slug: `${to.extension}-to-${from.extension}`,
      category: to.category,
    },
    relatedFromConversions: outbound.filter((item) => item.to !== to.id),
    relatedToConversions: inbound.filter((item) => item.from !== from.id),
    siblingFormats: siblings,
  };
}

/**
 * Builds complete Format Hub page data for a single format (e.g. /convert/png).
 */
export function generateFormatHubData(formatId: string): FormatHubData | null {
  const format = getFormatSpec(normalizeFormatId(formatId));
  if (!format) return null;

  const ext = format.extension.toUpperCase();
  const slug = format.extension;
  const canonicalUrl = `${SITE_URL}/convert/${slug}`;

  const outbound = getOutboundConversions(format.id, 16);
  const inbound = getInboundConversions(format.id, 16);
  const siblings = getSiblingFormats(format.id, 8);

  const faqs: FAQItem[] = [
    {
      question: `What is the ${ext} file format?`,
      answer: `${format.name} (${ext}) is a ${format.lossless ? "lossless" : "lossy"} format developed by ${format.developer} in ${format.year || "the computing standard era"}. It is primarily used for ${format.primaryUse.toLowerCase()}.`
    },
    {
      question: `Which formats can I convert ${ext} into?`,
      answer: `With Wild Converter, you can convert ${ext} directly into ${outbound.map((o) => o.to.toUpperCase()).slice(0, 8).join(", ")}, and more. All conversions run 100% client-side in your browser.`
    },
    {
      question: `How do I convert a file to ${ext}?`,
      answer: `You can convert existing files from ${inbound.map((i) => i.from.toUpperCase()).slice(0, 6).join(", ")} into ${ext} using the converter stage above. Drag and drop your file to get started.`
    },
    {
      question: `Is ${ext} conversion private and secure?`,
      answer: `Yes. Wild Converter runs in-browser WebAssembly with zero telemetry, zero cookies, and zero server uploads. Your data never leaves your computer.`
    }
  ];

  return {
    type: "format-hub",
    format,
    slug,
    category: format.category,
    title: `${ext} File Converter — Convert ${ext} Online`,
    metaDescription: `Universal ${ext} file converter. Convert ${ext} to modern formats or convert files to ${ext} entirely in your browser with 100% privacy and zero server uploads.`,
    canonicalUrl,
    h1: `${ext} File Converter`,
    summary: `${format.name} (${ext}) — ${format.description}`,
    outboundConversions: outbound,
    inboundConversions: inbound,
    siblingFormats: siblings,
    faqs,
  };
}
