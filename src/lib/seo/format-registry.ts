import type { FormatSpec } from "./types";

/**
 * Master Registry of all supported file formats with deep technical specifications.
 * This structured knowledge base eliminates thin content and powers unique semantic comparisons.
 */
export const FORMAT_REGISTRY: Record<string, FormatSpec> = {
  // ─── IMAGES ────────────────────────────────────────────────────────
  png: {
    id: "png",
    name: "Portable Network Graphics",
    extension: "png",
    mimeType: "image/png",
    category: "images",
    developer: "PNG Development Group / W3C",
    year: 1996,
    lossy: false,
    lossless: true,
    colorDepth: "Up to 48-bit TrueColor + 16-bit Alpha",
    supportsAlpha: true,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "Deflate (LZ77 + Huffman)",
    standard: "ISO/IEC 15948",
    primaryUse: "Web graphics, transparent logos, UI icons, and technical diagrams",
    strengths: [
      "Lossless pixel-perfect reproduction with zero visual artifacting",
      "Full 8-bit alpha channel transparency (256 levels of opacity)",
      "Universal support across 100% of modern web browsers and image viewers",
      "Built-in gamma correction and two-dimensional interlacing"
    ],
    limitations: [
      "Significantly larger file sizes compared to lossy JPEG or modern WebP/AVIF",
      "No native multi-frame animation (unlike APNG or GIF)",
      "Sub-optimal for photographic gradients and real-world scenes"
    ],
    compatibleWith: ["All web browsers", "Adobe Photoshop", "Figma", "GIMP", "Affinity Photo"],
    typicalSize: "500 KB – 5 MB",
    description: "Lossless raster format designed to replace GIF with superior 24-bit color and 8-bit alpha transparency."
  },
  jpg: {
    id: "jpg",
    name: "JPEG Image",
    extension: "jpg",
    mimeType: "image/jpeg",
    category: "images",
    developer: "Joint Photographic Experts Group",
    year: 1992,
    lossy: true,
    lossless: false,
    colorDepth: "24-bit TrueColor (16.7 million colors)",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "Discrete Cosine Transform (DCT)",
    standard: "ISO/IEC 10918-1",
    primaryUse: "Digital photography, web imagery, social media publishing, and camera captures",
    strengths: [
      "Ultra-compact file sizes through psychoacoustic/perceptual lossy compression",
      "Universal hardware acceleration on smartphones, cameras, and GPUs",
      "Adjustable quality-to-size trade-off slider (1–100%)",
      "Ubiquitous compatibility with every operating system since 1992"
    ],
    limitations: [
      "Zero alpha transparency support (transparent areas render solid white or black)",
      "Generation loss: repeated re-saving degrades high-frequency pixel details",
      "Blocky 8x8 DCT compression artifacts visible at aggressive compression ratios"
    ],
    compatibleWith: ["Universal compatibility across all devices, cameras, and software"],
    typicalSize: "100 KB – 2 MB",
    description: "Universal lossy photographic standard delivering high compression ratios for continuous-tone images."
  },
  jpeg: {
    id: "jpeg",
    name: "JPEG Image",
    extension: "jpg",
    mimeType: "image/jpeg",
    category: "images",
    developer: "Joint Photographic Experts Group",
    year: 1992,
    lossy: true,
    lossless: false,
    colorDepth: "24-bit TrueColor",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "Discrete Cosine Transform (DCT)",
    standard: "ISO/IEC 10918-1",
    primaryUse: "Digital photography, web publishing, and camera captures",
    strengths: [
      "High compression efficiency for real-world photographic content",
      "Universal platform and hardware decoding support",
      "Embedded EXIF metadata support for cameras and GPS tagging"
    ],
    limitations: [
      "No alpha transparency channel",
      "Compression artifacts on high-contrast edges and text"
    ],
    compatibleWith: ["All operating systems, browsers, and image editing software"],
    typicalSize: "100 KB – 2 MB",
    description: "Standard JPEG container and interchange format."
  },
  webp: {
    id: "webp",
    name: "WebP Image",
    extension: "webp",
    mimeType: "image/webp",
    category: "images",
    developer: "Google",
    year: 2010,
    lossy: true,
    lossless: true,
    colorDepth: "24-bit color + 8-bit Alpha",
    supportsAlpha: true,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "VP8 (Lossy) / Predictive Arithmetic (Lossless)",
    standard: "Google WebP Container Specification",
    primaryUse: "Modern high-performance web assets, responsive web imagery, and animated stickers",
    strengths: [
      "26% smaller file size than PNG while maintaining 100% lossless fidelity",
      "25–34% smaller file size than comparable JPEG at equivalent SSIM visual quality",
      "Supports both lossy and lossless modes, alpha transparency, and animation in one format",
      "Native support in all modern web browsers (Chrome, Safari, Firefox, Edge)"
    ],
    limitations: [
      "Legacy desktop software and older image viewers may require third-party codecs",
      "Maximum image dimension limit of 16,383 × 16,383 pixels"
    ],
    compatibleWith: ["Modern browsers (Chrome 32+, Safari 14+, Firefox 65+), Photoshop (with plugin)"],
    typicalSize: "50 KB – 800 KB",
    description: "Google's modern web image standard delivering substantial file size reductions over PNG and JPEG."
  },
  avif: {
    id: "avif",
    name: "AV1 Image File Format",
    extension: "avif",
    mimeType: "image/avif",
    category: "images",
    developer: "Alliance for Open Media (AOMedia)",
    year: 2019,
    lossy: true,
    lossless: true,
    colorDepth: "8, 10, 12-bit High Dynamic Range (HDR) & Wide Color Gamut",
    supportsAlpha: true,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "AV1 Intra-frame Compression (HEIF container)",
    standard: "AOMedia AV1 Specification",
    primaryUse: "Next-generation web imagery, HDR photography, and ultra-high compression workflows",
    strengths: [
      "Up to 50% smaller file size than JPEG and 20% smaller than WebP at identical visual quality",
      "Full HDR (High Dynamic Range) and 10/12-bit wide color gamut (BT.2020 / DCI-P3) support",
      "Superior preservation of fine film grain and high-frequency textures without blocking artifacts",
      "Lossless, lossy, alpha transparency, and sequence animation capability"
    ],
    limitations: [
      "Higher CPU encoding overhead during generation compared to legacy formats",
      "Not supported on legacy operating systems (macOS Catalina and earlier, Windows 10 pre-1903)"
    ],
    compatibleWith: ["Chrome 85+, Firefox 93+, Safari 16+, Edge 121+"],
    typicalSize: "30 KB – 500 KB",
    description: "Next-generation royalty-free image format based on AV1 video coding with cutting-edge compression."
  },
  heic: {
    id: "heic",
    name: "High Efficiency Image Container",
    extension: "heic",
    mimeType: "image/heic",
    category: "images",
    developer: "Moving Picture Experts Group (MPEG) / Apple",
    year: 2015,
    lossy: true,
    lossless: true,
    colorDepth: "Up to 16-bit Deep Color",
    supportsAlpha: true,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "HEVC / H.265 Intra Coding (ISO/IEC 23008-12)",
    standard: "ISO/IEC 23008-12 (HEIF)",
    primaryUse: "Default camera capture format on Apple iPhone & modern Samsung smartphones",
    strengths: [
      "Twice the compression efficiency of standard JPEG at identical or better visual quality",
      "Captures auxiliary image data: depth maps, live photo bursts, alpha masks, and HDR gain maps",
      "Native hardware encoding on modern mobile processors"
    ],
    limitations: [
      "Patent licensing restrictions prevent native decoding in many open-source web browsers",
      "Often rejected by web forms, government portals, and legacy Windows image viewers"
    ],
    compatibleWith: ["iOS 11+, macOS High Sierra+, Windows 11 (with extension), Android 9+"],
    typicalSize: "1 MB – 4 MB",
    description: "Advanced container format utilized by iOS and modern cameras for high-efficiency photo captures."
  },
  gif: {
    id: "gif",
    name: "Graphics Interchange Format",
    extension: "gif",
    mimeType: "image/gif",
    category: "images",
    developer: "CompuServe",
    year: 1987,
    lossy: false,
    lossless: true,
    colorDepth: "8-bit indexed palette (256 colors maximum)",
    supportsAlpha: true,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "LZW (Lempel-Ziv-Welch)",
    standard: "GIF89a",
    primaryUse: "Short looping animations, memes, social messaging, and retro pixel art",
    strengths: [
      "Universal support across every digital device and messaging client created since 1987",
      "Native looping animation playback without requiring HTML5 video tags or scripts",
      "Lightweight lossless encoding for simple graphics with fewer than 256 colors"
    ],
    limitations: [
      "Strictly capped at 256 colors per frame, resulting in severe color banding on photographs",
      "Binary 1-bit transparency only (a pixel is either 100% opaque or 100% transparent)",
      "Inefficient compression for continuous motion compared to MP4 or WebM video"
    ],
    compatibleWith: ["Universal support across 100% of platforms and applications"],
    typicalSize: "200 KB – 10 MB",
    description: "Classic indexed-color bitmap format famous for ubiquitous looping animations and meme culture."
  },
  svg: {
    id: "svg",
    name: "Scalable Vector Graphics",
    extension: "svg",
    mimeType: "image/svg+xml",
    category: "vector",
    developer: "World Wide Web Consortium (W3C)",
    year: 2001,
    lossy: false,
    lossless: true,
    colorDepth: "Infinite / Vector Math (RGB & RGBA)",
    supportsAlpha: true,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "XML Text / Gzip (SVGZ)",
    standard: "W3C Recommendation",
    primaryUse: "Responsive web logos, UI icons, infographics, charts, and resolution-independent designs",
    strengths: [
      "Infinite resolution: scales to billboard sizes or 4K Retina displays without pixelation",
      "Human-readable XML code that can be styled and animated via CSS and JavaScript",
      "Extremely compact file size for geometric artwork, typography, and logos",
      "Direct DOM integration for interactive web user interfaces"
    ],
    limitations: [
      "Unsuitable for photographic images or complex textures with millions of unique colors",
      "Complex geometric paths with tens of thousands of nodes can cause CPU rendering lag"
    ],
    compatibleWith: ["All modern browsers, Illustrator, Figma, Inkscape, Sketch"],
    typicalSize: "2 KB – 150 KB",
    description: "W3C standard XML-based vector image format providing resolution-independent graphics."
  },
  bmp: {
    id: "bmp",
    name: "Windows Bitmap",
    extension: "bmp",
    mimeType: "image/bmp",
    category: "images",
    developer: "Microsoft Corporation",
    year: 1985,
    lossy: false,
    lossless: true,
    colorDepth: "1, 4, 8, 16, 24, 32-bit",
    supportsAlpha: true,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Uncompressed raw pixel array / Optional RLE",
    standard: "Microsoft DIB Architecture",
    primaryUse: "Windows OS internals, raw raster dumps, legacy industrial controllers, and game dev",
    strengths: [
      "Zero compression artifacts with 100% lossless exact raw raster values",
      "Instant decoding: can be mapped directly into GPU memory buffers without decompression",
      "Straightforward pixel array structure ideal for programmatic binary processing"
    ],
    limitations: [
      "Enormous file sizes due to lack of standard spatial compression algorithms",
      "Obsolete for web transmission and storage-sensitive applications"
    ],
    compatibleWith: ["Windows, macOS, Linux, image editing tools"],
    typicalSize: "2 MB – 30 MB",
    description: "Uncompressed raw pixel raster format developed by Microsoft for the Windows graphic subsystem."
  },
  tiff: {
    id: "tiff",
    name: "Tagged Image File Format",
    extension: "tiff",
    mimeType: "image/tiff",
    category: "images",
    developer: "Aldus Corporation / Adobe Systems",
    year: 1986,
    lossy: false,
    lossless: true,
    colorDepth: "Up to 32-bit floating point per channel (CMYK, RGB, CIELAB)",
    supportsAlpha: true,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "LZW, Deflate, PackBits, or Uncompressed",
    standard: "TIFF Revision 6.0",
    primaryUse: "Commercial prepress printing, archival scanning, professional photography, and medical imaging",
    strengths: [
      "Industry gold standard for commercial four-color CMYK prepress publishing",
      "Multi-page document support: can store multiple images and layers in a single container",
      "Lossless LZW compression preserves every single optical sensor detail"
    ],
    limitations: [
      "Heavier storage footprint compared to web-optimized delivery formats",
      "Native display not supported directly by standard HTML5 web browsers"
    ],
    compatibleWith: ["Adobe Creative Cloud, desktop publishing software, high-end scanners"],
    typicalSize: "10 MB – 100 MB",
    description: "Premier archival raster format utilized in professional print publishing and digital prepress."
  },
  ico: {
    id: "ico",
    name: "Windows Icon",
    extension: "ico",
    mimeType: "image/x-icon",
    category: "images",
    developer: "Microsoft Corporation",
    year: 1985,
    lossy: false,
    lossless: true,
    colorDepth: "1-bit to 32-bit (8-bit alpha)",
    supportsAlpha: true,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "BMP or embedded PNG stream",
    standard: "Microsoft Windows Icon Resource Format",
    primaryUse: "Website favicons (`favicon.ico`), Windows application desktop icons, and bookmark icons",
    strengths: [
      "Stores multiple resolutions (16x16, 32x32, 48x48, 64x64, 256x256) inside a single file",
      "Universal legacy browser compatibility for website bookmarks and tab icons",
      "Full 32-bit alpha transparency support for crisp edges on any background"
    ],
    limitations: [
      "Specialized container format not suited for general photographic or web illustrations"
    ],
    compatibleWith: ["All web browsers, Windows shell, graphic design tools"],
    typicalSize: "10 KB – 100 KB",
    description: "Multi-resolution icon format powering website favicons and operating system shortcuts."
  },

  // ─── DOCUMENTS ─────────────────────────────────────────────────────
  pdf: {
    id: "pdf",
    name: "Portable Document Format",
    extension: "pdf",
    mimeType: "application/pdf",
    category: "documents",
    developer: "Adobe Systems / ISO",
    year: 1993,
    lossy: false,
    lossless: true,
    colorDepth: "Full vector, font, and high-res image container",
    supportsAlpha: true,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "Flate / JPEG / JBIG2 stream compression",
    standard: "ISO 32000-2",
    primaryUse: "Universal document exchange, contracts, legal agreements, eBooks, and printing layouts",
    strengths: [
      "Rigid visual fidelity: preserves exact layout, fonts, and graphics across every operating system",
      "Support for cryptographic digital signatures, encryption, form fields, and password locks",
      "Resolution-independent vector typography and embedded high-resolution graphics",
      "Global legal standard for business contracts, tax filings, and institutional records"
    ],
    limitations: [
      "Complex internal layout structure makes reflowing and text editing difficult",
      "Can carry bulky embedded fonts and uncompressed raster resources"
    ],
    compatibleWith: ["Adobe Acrobat, all web browsers, Apple Preview, Google Docs"],
    typicalSize: "100 KB – 20 MB",
    description: "The global standard for secure, reliable digital documents and printable electronic paperwork."
  },
  docx: {
    id: "docx",
    name: "Microsoft Word OpenXML Document",
    extension: "docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    category: "documents",
    developer: "Microsoft Corporation / ISO",
    year: 2007,
    lossy: false,
    lossless: true,
    colorDepth: "XML formatted text and embedded media container",
    supportsAlpha: true,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "ZIP package containing XML and media streams",
    standard: "ISO/IEC 29500 (Strict & Transitional)",
    primaryUse: "Business document authoring, academic manuscripts, resumes, and corporate collaboration",
    strengths: [
      "Fully editable rich text typography, styles, tables, headers, footers, and revision tracking",
      "Open XML standards-based architecture that can be parsed and modified programmatically",
      "Universal interoperability with Microsoft Word, Google Docs, LibreOffice, and Pages"
    ],
    limitations: [
      "Visual rendering can vary slightly across different software packages or missing local fonts",
      "Requires document word processing software to view and edit"
    ],
    compatibleWith: ["Microsoft Word, Google Docs, LibreOffice Writer, Pages"],
    typicalSize: "50 KB – 5 MB",
    description: "Standard editable word-processing document format built on compressed OpenXML architecture."
  },
  txt: {
    id: "txt",
    name: "Plain Text Document",
    extension: "txt",
    mimeType: "text/plain",
    category: "documents",
    developer: "Universal Computing Standard",
    year: 1963,
    lossy: false,
    lossless: true,
    colorDepth: "ASCII / UTF-8 Unicode characters",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Uncompressed character stream",
    standard: "Unicode Standard / RFC 2046",
    primaryUse: "Source code, configuration files, raw notes, logs, and universal text exchange",
    strengths: [
      "Zero overhead: readable on every computing device ever manufactured with a terminal or screen",
      "100% immune to layout shifts, software version incompatibilities, or proprietary locks",
      "Ideal for command-line tools, scripting, search indexing, and LLM text input"
    ],
    limitations: [
      "Zero styling support: no bold, italics, font sizing, colors, tables, or embedded images"
    ],
    compatibleWith: ["100% of text editors, terminals, and operating systems"],
    typicalSize: "1 KB – 200 KB",
    description: "Pure unformatted text encoded in UTF-8 Unicode for maximum universal accessibility."
  },
  md: {
    id: "md",
    name: "Markdown Document",
    extension: "md",
    mimeType: "text/markdown",
    category: "documents",
    developer: "John Gruber / CommonMark",
    year: 2004,
    lossy: false,
    lossless: true,
    colorDepth: "UTF-8 structured text",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Plain text",
    standard: "CommonMark / GitHub Flavored Markdown (GFM)",
    primaryUse: "Software documentation, GitHub READMEs, technical writing, static site generators, and notes",
    strengths: [
      "Clean, human-readable syntax that easily renders into formatted HTML, PDF, or DOCX",
      "Supported natively by GitHub, Notion, Obsidian, VS Code, and static site generators",
      "Version-control friendly with clean line-by-line git diffs"
    ],
    limitations: [
      "Requires a Markdown parser or viewer to render rich typographic styling"
    ],
    compatibleWith: ["GitHub, VS Code, Obsidian, Notion, Static Site Generators"],
    typicalSize: "2 KB – 100 KB",
    description: "Lightweight plain-text markup language designed to be converted into structural HTML."
  },
  html: {
    id: "html",
    name: "HyperText Markup Language",
    extension: "html",
    mimeType: "text/html",
    category: "documents",
    developer: "W3C / WHATWG",
    year: 1993,
    lossy: false,
    lossless: true,
    colorDepth: "Semantic markup container",
    supportsAlpha: true,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "Gzip / Brotli web transport",
    standard: "HTML5 Living Standard",
    primaryUse: "Web pages, email newsletters, digital publications, and responsive documents",
    strengths: [
      "The foundational language of the World Wide Web, rendered natively by every browser",
      "Seamless integration with CSS typography, JavaScript interactivity, and media embeds",
      "Fully responsive reflowing across smartphones, tablets, laptops, and 4K displays"
    ],
    limitations: [
      "Requires external or inline CSS/assets for consistent styling across mail clients and offline viewers"
    ],
    compatibleWith: ["All web browsers, text editors, email clients"],
    typicalSize: "10 KB – 500 KB",
    description: "The universal publishing language of the web supporting responsive layouts and media embeds."
  },
  xlsx: {
    id: "xlsx",
    name: "Microsoft Excel OpenXML Spreadsheet",
    extension: "xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    category: "documents",
    developer: "Microsoft Corporation / ISO",
    year: 2007,
    lossy: false,
    lossless: true,
    colorDepth: "Structured tabular data, formulas, and chart container",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "ZIP archive with XML tables",
    standard: "ISO/IEC 29500",
    primaryUse: "Financial modeling, data analysis, business accounting, and tabular reporting",
    strengths: [
      "Supports complex mathematical formulas, pivot tables, multi-sheet workbooks, and chart graphics",
      "Capable of handling up to 1,048,576 rows by 16,384 columns per sheet",
      "Industry standard for corporate financial modeling and statistical analysis"
    ],
    limitations: [
      "Not as easily parseable as plain CSV for quick command-line scripts"
    ],
    compatibleWith: ["Microsoft Excel, Google Sheets, LibreOffice Calc, Apple Numbers"],
    typicalSize: "50 KB – 10 MB",
    description: "Standard open XML spreadsheet format for advanced tabular data, calculations, and charts."
  },
  csv: {
    id: "csv",
    name: "Comma-Separated Values",
    extension: "csv",
    mimeType: "text/csv",
    category: "documents",
    developer: "Universal Computing Standard",
    year: 1972,
    lossy: false,
    lossless: true,
    colorDepth: "Delimited plain text tabular rows",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Plain text",
    standard: "RFC 4180",
    primaryUse: "Database export/import, data science datasets, machine learning training data, and spreadsheets",
    strengths: [
      "Ultra-lightweight plain text structure readable by any spreadsheet, script, or database",
      "Direct ingestion by Python pandas, R, SQL databases, and machine learning pipelines",
      "No proprietary locks or version incompatibilities"
    ],
    limitations: [
      "Zero formula, formatting, chart, or multiple-sheet support (raw data only)"
    ],
    compatibleWith: ["All spreadsheet software, Python, SQL, R, text editors"],
    typicalSize: "10 KB – 50 MB",
    description: "Universal plain-text tabular data format separated by commas for seamless database interchange."
  },

  // ─── AUDIO ─────────────────────────────────────────────────────────
  mp3: {
    id: "mp3",
    name: "MPEG Audio Layer III",
    extension: "mp3",
    mimeType: "audio/mpeg",
    category: "audio",
    developer: "Fraunhofer IIS / MPEG",
    year: 1993,
    lossy: true,
    lossless: false,
    colorDepth: "16-bit / 44.1 kHz or 48 kHz stereo",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "Perceptual Psychoacoustic Lossy Masking",
    standard: "ISO/IEC 11172-3",
    primaryUse: "Music streaming, podcasts, audiobooks, portable media players, and voice recordings",
    strengths: [
      "Universal audio compatibility across 100% of digital players, car stereos, and browsers",
      "Drastically reduces audio file size by up to 90% compared to uncompressed CD audio",
      "ID3 metadata tag support for artist, album, track number, and embedded album art"
    ],
    limitations: [
      "Lossy compression permanently discards high-frequency audio information above 16–20 kHz",
      "Lower compression efficiency compared to modern AAC or Opus at low bitrates (<96 kbps)"
    ],
    compatibleWith: ["All operating systems, smartphones, browsers, and hardware media players"],
    typicalSize: "3 MB – 10 MB",
    description: "The most famous digital audio compression format in computing history, universally supported."
  },
  wav: {
    id: "wav",
    name: "Waveform Audio File Format",
    extension: "wav",
    mimeType: "audio/wav",
    category: "audio",
    developer: "Microsoft & IBM",
    year: 1991,
    lossy: false,
    lossless: true,
    colorDepth: "16, 24, 32-bit float PCM / up to 192 kHz",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Linear Pulse Code Modulation (LPCM)",
    standard: "RIFF Audio Container",
    primaryUse: "Studio audio recording, sound design, video editing mastering, and broadcast production",
    strengths: [
      "Pristine studio master audio quality with zero perceptual degradation",
      "Zero decompression latency: can be directly manipulated by Digital Audio Workstations (DAWs)",
      "Standard master delivery format for music mastering, sound effects, and film soundtracks"
    ],
    limitations: [
      "Extremely large file sizes (~10 MB per minute of standard stereo audio at 16-bit/44.1kHz)",
      "Impractical for bandwidth-constrained mobile web streaming"
    ],
    compatibleWith: ["All DAWs (Ableton, Logic, Pro Tools, FL Studio), media players, browsers"],
    typicalSize: "30 MB – 80 MB",
    description: "Uncompressed linear PCM audio container delivering bit-for-bit studio master reproduction."
  },
  flac: {
    id: "flac",
    name: "Free Lossless Audio Codec",
    extension: "flac",
    mimeType: "audio/flac",
    category: "audio",
    developer: "Xiph.Org Foundation",
    year: 2001,
    lossy: false,
    lossless: true,
    colorDepth: "Up to 32-bit / 655 kHz Hi-Res Audio",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "Linear Predictive Coding (Lossless Deflate)",
    standard: "Xiph.Org FLAC Specification",
    primaryUse: "Audiophile music libraries, CD ripping preservation, high-res audio downloads",
    strengths: [
      "Bit-perfect lossless reproduction: restores 100% of exact master studio audio samples",
      "Reduces raw PCM audio file sizes by 40–60% without losing a single bit of information",
      "Open, royalty-free standard supported by modern operating systems and audio equipment"
    ],
    limitations: [
      "Native playback requires third-party players on older Apple hardware (which favors ALAC)",
      "Still significantly larger than lossy formats like MP3 or AAC"
    ],
    compatibleWith: ["VLC, Foobar2000, Android, Windows 10+, modern browsers"],
    typicalSize: "20 MB – 50 MB",
    description: "Open, royalty-free lossless audio compression standard preferred by music purists and archivists."
  },
  m4a: {
    id: "m4a",
    name: "MPEG-4 Audio",
    extension: "m4a",
    mimeType: "audio/mp4",
    category: "audio",
    developer: "Apple / MPEG",
    year: 2004,
    lossy: true,
    lossless: false,
    colorDepth: "16-bit / 24-bit AAC or ALAC",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "Advanced Audio Coding (AAC) / ALAC",
    standard: "ISO/IEC 14496-3",
    primaryUse: "Apple Music, iTunes store purchases, iOS voice memos, and mobile podcast streaming",
    strengths: [
      "Superior audio quality compared to MP3 at equivalent or lower bitrates",
      "Native hardware decoding across all Apple and Android devices",
      "Efficient audio packaging within standard MPEG-4 container structure"
    ],
    limitations: [
      "Less universal on vintage car stereos or very old hardware players than MP3"
    ],
    compatibleWith: ["Apple ecosystem, Android, Windows Media Player, modern browsers"],
    typicalSize: "3 MB – 8 MB",
    description: "MPEG-4 container holding high-efficiency AAC audio, standard across Apple platforms."
  },
  ogg: {
    id: "ogg",
    name: "Ogg Vorbis Audio",
    extension: "ogg",
    mimeType: "audio/ogg",
    category: "audio",
    developer: "Xiph.Org Foundation",
    year: 2000,
    lossy: true,
    lossless: false,
    colorDepth: "Variable Bitrate (VBR) perceptual audio",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "Vorbis Acoustic Transform",
    standard: "RFC 3533 / RFC 3534",
    primaryUse: "Game audio soundtracks (Unity, Unreal Engine), Spotify web streaming, open-source media",
    strengths: [
      "Open, patent-free royalty-free alternative to MP3 with higher sonic clarity at lower bitrates",
      "Industry standard audio container for video game sound effects and background music",
      "Native HTML5 `<audio>` element playback support across web browsers"
    ],
    limitations: [
      "Requires third-party software on native iOS / macOS QuickTime players"
    ],
    compatibleWith: ["Spotify, VLC, web browsers, game engines, Audacity"],
    typicalSize: "3 MB – 8 MB",
    description: "Open-source multimedia container featuring Vorbis compression, widely used in video games."
  },

  // ─── VIDEO ─────────────────────────────────────────────────────────
  mp4: {
    id: "mp4",
    name: "MPEG-4 Part 14 Video",
    extension: "mp4",
    mimeType: "video/mp4",
    category: "video",
    developer: "MPEG / ISO",
    year: 2001,
    lossy: true,
    lossless: false,
    colorDepth: "H.264 / H.265 / AV1 video with AAC audio",
    supportsAlpha: false,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "Inter-frame motion estimation (H.264/AVC / H.265)",
    standard: "ISO/IEC 14496-14",
    primaryUse: "Web video streaming (YouTube, Vimeo), mobile video recording, social video, and TV broadcast",
    strengths: [
      "The undisputed global standard for digital video playback across every screen on earth",
      "Universal hardware decoding acceleration delivers seamless battery-efficient 4K/8K playback",
      "Streaming-optimized fast-start (MOOV atom) allows instant video buffering in web browsers"
    ],
    limitations: [
      "Does not support alpha transparency (unlike WebM or ProRes 4444)",
      "Strict patent licensing licensing terms on underlying H.264/HEVC codecs"
    ],
    compatibleWith: ["100% of modern devices, browsers, televisions, and video editing suites"],
    typicalSize: "10 MB – 500 MB",
    description: "The universal digital video standard compatible across all devices, browsers, and operating systems."
  },
  webm: {
    id: "webm",
    name: "WebM Video",
    extension: "webm",
    mimeType: "video/webm",
    category: "video",
    developer: "Google",
    year: 2010,
    lossy: true,
    lossless: false,
    colorDepth: "VP8, VP9, or AV1 video with Opus/Vorbis audio",
    supportsAlpha: true,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "VP9 / AV1 open inter-frame compression",
    standard: "Matroska-based Web Profile",
    primaryUse: "Modern HTML5 web video, transparent video overlays, WebRTC video conferencing",
    strengths: [
      "Royalty-free open media format built specifically for efficient HTML5 web video delivery",
      "Supports transparent video overlays on web pages (alpha channel video playback)",
      "High compression efficiency utilizing VP9 and AV1 codecs"
    ],
    limitations: [
      "Limited support in older legacy desktop video editing programs"
    ],
    compatibleWith: ["Chrome, Firefox, Safari 14.1+, Edge, VLC, Premiere Pro"],
    typicalSize: "5 MB – 200 MB",
    description: "Google's open-source video standard optimized for modern HTML5 web delivery and transparency."
  },
  mov: {
    id: "mov",
    name: "Apple QuickTime Movie",
    extension: "mov",
    mimeType: "video/quicktime",
    category: "video",
    developer: "Apple Inc.",
    year: 1991,
    lossy: true,
    lossless: true,
    colorDepth: "Apple ProRes, H.264, HEVC, or uncompressed video",
    supportsAlpha: true,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "ProRes 422/4444, H.264, or HEVC",
    standard: "Apple QuickTime File Format",
    primaryUse: "iPhone camera recordings, Final Cut Pro editing, broadcast post-production mastering",
    strengths: [
      "Premier format for professional film and video post-production editing pipelines",
      "Supports Apple ProRes 4444 with full alpha transparency and 12-bit color depth",
      "Native high-performance editing with zero playback latency in Final Cut and DaVinci Resolve"
    ],
    limitations: [
      "Can generate extremely large file sizes when using ProRes codecs",
      "Not as universal for direct web embedding as MP4 without transcoding"
    ],
    compatibleWith: ["macOS, iOS, Final Cut Pro, DaVinci Resolve, Adobe Premiere"],
    typicalSize: "20 MB – 2 GB",
    description: "Apple's QuickTime container utilized extensively in professional video editing and iPhone capture."
  },
  mkv: {
    id: "mkv",
    name: "Matroska Multimedia Container",
    extension: "mkv",
    mimeType: "video/x-matroska",
    category: "video",
    developer: "Matroska Team",
    year: 2002,
    lossy: true,
    lossless: true,
    colorDepth: "Any video codec (H.264, HEVC, AV1, VP9)",
    supportsAlpha: true,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "Extensible EBML container",
    standard: "IETF Matroska Specification (RFC)",
    primaryUse: "HD/4K movie preservation, multi-language anime releases, Blu-ray rips, and media servers",
    strengths: [
      "Unlimited capability: holds multiple audio tracks, multi-language subtitles, and chapter markers",
      "Resilient to corruption: can recover from incomplete downloads or streaming drops",
      "Universal container that can pack virtually any audio/video codec in existence"
    ],
    limitations: [
      "Not supported directly in native HTML5 `<video>` tags without browser extensions or transcode"
    ],
    compatibleWith: ["VLC, Plex, Kodi, IINA, HandBrake, FFmpeg"],
    typicalSize: "100 MB – 10 GB",
    description: "Versatile open-source media container capable of holding unlimited audio, video, and subtitle streams."
  },

  // ─── 3D ────────────────────────────────────────────────────────────
  glb: {
    id: "glb",
    name: "Binary glTF 3D Model",
    extension: "glb",
    mimeType: "model/gltf-binary",
    category: "3d",
    developer: "Khronos Group",
    year: 2015,
    lossy: false,
    lossless: true,
    colorDepth: "PBR Materials (Roughness, Metallic, Normal, Emissive)",
    supportsAlpha: true,
    supportsAnimation: true,
    supportsCompression: true,
    compressionType: "Draco / KHR_texture_basisu compressed mesh",
    standard: "Khronos glTF 2.0 Specification (ISO/IEC 12113)",
    primaryUse: "WebGL web 3D experiences, augmented reality (QuickLook, Scene Viewer), Three.js, Babylon.js",
    strengths: [
      "The 'JPEG of 3D': single self-contained binary file holding geometry, textures, shaders, and animations",
      "Fastest GPU upload speed: structured for direct zero-parse memory mapping into WebGL buffers",
      "Full Physically Based Rendering (PBR) realistic lighting and material standards"
    ],
    limitations: [
      "Binary format not human-readable without dedicated 3D viewers"
    ],
    compatibleWith: ["Three.js, Blender, Unity, Unreal Engine, Babylon.js, WebGL"],
    typicalSize: "1 MB – 20 MB",
    description: "The official binary packaging of glTF 2.0, standard for web 3D models and augmented reality."
  },
  stl: {
    id: "stl",
    name: "Stereolithography 3D Geometry",
    extension: "stl",
    mimeType: "model/stl",
    category: "3d",
    developer: "3D Systems",
    year: 1987,
    lossy: false,
    lossless: true,
    colorDepth: "Pure triangular mesh surface geometry (no color/materials)",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Raw ASCII or binary facet coordinates",
    standard: "De facto 3D Printing Standard",
    primaryUse: "3D printing slicing software (Cura, PrusaSlicer), rapid prototyping, and CAD modeling",
    strengths: [
      "The undisputed global standard for 3D printing and additive manufacturing",
      "Simple, robust geometry representation consisting of raw triangulated vertex coordinates",
      "Direct import into every slicing engine and computer-aided manufacturing tool"
    ],
    limitations: [
      "Stores only surface geometry: zero support for colors, textures, materials, or animations"
    ],
    compatibleWith: ["PrusaSlicer, Cura, Blender, Fusion 360, SolidWorks, FreeCAD"],
    typicalSize: "500 KB – 50 MB",
    description: "The foundational 3D printing format describing surface geometry with raw triangular facets."
  },
  obj: {
    id: "obj",
    name: "Wavefront 3D Object",
    extension: "obj",
    mimeType: "model/obj",
    category: "3d",
    developer: "Wavefront Technologies",
    year: 1990,
    lossy: false,
    lossless: true,
    colorDepth: "Vertex coordinates + external MTL material file",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Plain text ASCII polygon definition",
    standard: "Open Wavefront Specification",
    primaryUse: "3D asset interchange between modeling programs, game design assets, and CG rendering",
    strengths: [
      "Human-readable ASCII text structure that can be opened and edited in any text editor",
      "Universal import and export support in every 3D modeling application created since 1990",
      "Supports polygons, polygonal meshes, UV texture mapping coordinates, and normal vectors"
    ],
    limitations: [
      "Requires an external accompanying `.mtl` file and image files for material colors and textures",
      "No native support for skeletal bone rigging, skinning, or skeletal animation"
    ],
    compatibleWith: ["Blender, Maya, 3ds Max, ZBrush, Cinema 4D, Three.js"],
    typicalSize: "1 MB – 30 MB",
    description: "Classic open 3D geometry format universally supported across all digital modeling tools."
  },

  // ─── FONTS ─────────────────────────────────────────────────────────
  woff2: {
    id: "woff2",
    name: "Web Open Font Format 2.0",
    extension: "woff2",
    mimeType: "font/woff2",
    category: "fonts",
    developer: "W3C WebFonts Working Group / Google",
    year: 2015,
    lossy: false,
    lossless: true,
    colorDepth: "Vector glyph contours + Brotli compression",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "Brotli Compression Algorithm (RFC 7932)",
    standard: "W3C Recommendation",
    primaryUse: "High-performance web typography, responsive web fonts, Google Fonts delivery",
    strengths: [
      "Delivers ~30% smaller file size than original WOFF and over 50% smaller than raw TTF",
      "Customized preprocessing table transforms that optimize font glyph tables for Brotli",
      "Universal support across 98%+ of all modern web browsers"
    ],
    limitations: [
      "Designed specifically for web delivery; not natively installed in older desktop font managers"
    ],
    compatibleWith: ["All modern browsers (Chrome, Safari, Firefox, Edge)"],
    typicalSize: "15 KB – 80 KB",
    description: "The gold standard web font format delivering extreme Brotli compression for fast web typography."
  },
  ttf: {
    id: "ttf",
    name: "TrueType Font",
    extension: "ttf",
    mimeType: "font/ttf",
    category: "fonts",
    developer: "Apple & Microsoft",
    year: 1989,
    lossy: false,
    lossless: true,
    colorDepth: "Vector bezier curves and hinting bytecode",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Uncompressed font table collection",
    standard: "ISO/IEC 14496-22 (OpenType)",
    primaryUse: "Desktop font installation (Windows & macOS), graphic design typography, word processing",
    strengths: [
      "Universal installation support across Windows, macOS, and Linux operating systems",
      "Precise TrueType hinting instruction bytecode ensuring crisp pixel grid rendering on low-res screens",
      "Direct editing in type design software (FontForge, Glyphs, Robofont)"
    ],
    limitations: [
      "Significantly larger file sizes when served over the web compared to WOFF2"
    ],
    compatibleWith: ["Windows, macOS, Linux, Adobe Creative Cloud, Figma"],
    typicalSize: "50 KB – 300 KB",
    description: "The classic vector outline font standard installed natively across desktop operating systems."
  },

  // ─── ARCHIVES ──────────────────────────────────────────────────────
  zip: {
    id: "zip",
    name: "ZIP Archive",
    extension: "zip",
    mimeType: "application/zip",
    category: "archive",
    developer: "PKWARE (Phil Katz)",
    year: 1989,
    lossy: false,
    lossless: true,
    colorDepth: "Compressed multi-file directory container",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: true,
    compressionType: "DEFLATE (LZ77 + Huffman)",
    standard: "ISO/IEC 21320-1",
    primaryUse: "File bundling, software distribution, email attachments, digital downloads",
    strengths: [
      "Universal native extraction on 100% of modern operating systems without installing extra software",
      "Individual file random access: files can be extracted without decompressing the entire archive",
      "Supports password protection, AES encryption, and directory hierarchy retention"
    ],
    limitations: [
      "Moderate compression ratio compared to modern LZMA-based 7Z archives"
    ],
    compatibleWith: ["Windows Explorer, macOS Finder, Linux, 7-Zip, WinRAR"],
    typicalSize: "Variable (50 KB – several GB)",
    description: "The most widely used archive and data compression format in modern computing."
  },
  tar: {
    id: "tar",
    name: "Tape Archive",
    extension: "tar",
    mimeType: "application/x-tar",
    category: "archive",
    developer: "AT&T Bell Laboratories",
    year: 1979,
    lossy: false,
    lossless: true,
    colorDepth: "Unix file archive container with permissions",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Uncompressed sequential file tape stream",
    standard: "POSIX.1-1988 (pax / ustar)",
    primaryUse: "Linux server backups, software distribution, Docker containers, Unix system packaging",
    strengths: [
      "Preserves exact Unix file system metadata, file permissions, ownership (UID/GID), and symlinks",
      "Sequential streaming architecture ideal for network pipes and tape backup storage",
      "Standard base layer for compressed `.tar.gz` and `.tar.xz` packages"
    ],
    limitations: [
      "Provides zero file compression on its own unless paired with gzip or xz"
    ],
    compatibleWith: ["Linux/Unix CLI (`tar`), 7-Zip, macOS Terminal"],
    typicalSize: "Variable (100 KB – several GB)",
    description: "Standard Unix archive format designed to collect multiple files and permissions into a single file."
  },

  // ─── CODE ──────────────────────────────────────────────────────────
  json: {
    id: "json",
    name: "JavaScript Object Notation",
    extension: "json",
    mimeType: "application/json",
    category: "code",
    developer: "Douglas Crockford",
    year: 2001,
    lossy: false,
    lossless: true,
    colorDepth: "Structured key-value text data",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Plain text UTF-8",
    standard: "ECMA-404 / RFC 8259",
    primaryUse: "REST APIs, web configuration files, database records (MongoDB, PostgreSQL), data exchange",
    strengths: [
      "The de facto data exchange language of the internet and web APIs",
      "Native parsing support in 100% of modern programming languages and web browsers",
      "Lightweight, unambiguous key-value hierarchy"
    ],
    limitations: [
      "Does not support comments or trailing commas in standard specification",
      "More verbose than binary serialization formats like Protocol Buffers"
    ],
    compatibleWith: ["Every modern programming language, API, and database"],
    typicalSize: "1 KB – 5 MB",
    description: "Universal lightweight data-interchange text format based on JavaScript object syntax."
  },
  yaml: {
    id: "yaml",
    name: "YAML Ain't Markup Language",
    extension: "yaml",
    mimeType: "text/yaml",
    category: "code",
    developer: "Clark Evans, Ingy döt Net, Oren Ben-Kiki",
    year: 2001,
    lossy: false,
    lossless: true,
    colorDepth: "Human-friendly indentation-based structured data",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Plain text UTF-8",
    standard: "YAML 1.2 Specification",
    primaryUse: "Kubernetes configs, Docker Compose, GitHub Actions workflows, application configuration",
    strengths: [
      "Clean, human-readable syntax with zero punctuation clutter (no braces or quotes required)",
      "Full support for comments, multi-line strings, and data references (anchors & aliases)",
      "Industry standard for DevOps, cloud infrastructure, and CI/CD pipelines"
    ],
    limitations: [
      "Strict whitespace indentation sensitivity can lead to parsing errors if tabs are mixed"
    ],
    compatibleWith: ["Kubernetes, Docker, GitHub Actions, VS Code, Python, Node.js"],
    typicalSize: "1 KB – 100 KB",
    description: "Human-readable data serialization language widely adopted in DevOps and cloud configurations."
  },
  xml: {
    id: "xml",
    name: "Extensible Markup Language",
    extension: "xml",
    mimeType: "application/xml",
    category: "code",
    developer: "W3C",
    year: 1996,
    lossy: false,
    lossless: true,
    colorDepth: "Hierarchical tagged data tree",
    supportsAlpha: false,
    supportsAnimation: false,
    supportsCompression: false,
    compressionType: "Plain text UTF-8",
    standard: "W3C XML Recommendation",
    primaryUse: "Enterprise SOAP services, RSS/Atom feeds, SVG graphics, Android layout files",
    strengths: [
      "Strict hierarchical schema validation via XSD (XML Schema Definition) and DTDs",
      "Support for namespaces, attributes, and mixed content text models",
      "Foundational container format underlying Office OpenXML (DOCX, XLSX) and SVG"
    ],
    limitations: [
      "Significantly more verbose and heavier to parse than lightweight JSON or YAML"
    ],
    compatibleWith: ["Enterprise software, SOAP services, Android Studio, text editors"],
    typicalSize: "5 KB – 2 MB",
    description: "Strict, self-describing extensible markup standard powering enterprise systems and web feeds."
  }
};

/** Look up format spec by ID or extension */
export function getFormatSpec(idOrExt: string): FormatSpec | null {
  const normalized = idOrExt.toLowerCase().trim().replace(/^\./, "");
  
  if (FORMAT_REGISTRY[normalized]) {
    return FORMAT_REGISTRY[normalized];
  }

  // Search by extension or ID aliases
  const found = Object.values(FORMAT_REGISTRY).find(
    (f) => f.extension === normalized || f.id === normalized
  );

  return found || null;
}

/** Get all registered formats in a specific category */
export function getFormatsByCategory(category: string): FormatSpec[] {
  return Object.values(FORMAT_REGISTRY).filter((f) => f.category === category);
}

/** Get all registered formats across the application */
export function getAllRegisteredFormats(): FormatSpec[] {
  return Object.values(FORMAT_REGISTRY);
}
