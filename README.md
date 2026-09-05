# Wild Converter

<p align="center">
  <strong>The universal, 100% client-side file converter running entirely in your browser.</strong><br>
  Zero server uploads. Zero ads. Zero tracking. Pure WebAssembly speed.
</p>

<p align="center">
  <a href="https://github.com/the-sukhsingh/wild-converter/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3-black.svg?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61dafb.svg?style=flat-square&logo=react" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-3178c6.svg?style=flat-square&logo=typescript" alt="TypeScript" /></a>
  <a href="https://webassembly.org"><img src="https://img.shields.io/badge/Engine-WebAssembly-654ff0.svg?style=flat-square&logo=webassembly" alt="WebAssembly" /></a>
  <a href="https://github.com/the-sukhsingh/wild-converter/blob/master/CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
  <img src="https://img.shields.io/badge/Privacy-100%25%20In--Browser-success.svg?style=flat-square" alt="100% In-Browser Privacy" />
</p>

---

## Overview

Most online file converters force you to upload sensitive files to remote servers, wait in processing queues, deal with file size paywalls, and endure ad trackers.

**Wild Converter** replaces all of that with a modern, single-page application built on WebAssembly and client-side web APIs:

- **100% Private**: Your files never leave your device. All decoding, transcoding, compiling, and encoding happens entirely in your local browser sandbox.
- **Zero Server Overhead**: Instant start, no server queues, and no limits on file conversion count.
- **Minimalist, Open Design**: Utilitarian, flat layout with zero visual clutter, constrained width (`max-w-5xl`), dark/light themes, and keyboard accessibility.
- **Batch Processing**: Convert multiple files of different types simultaneously in a unified batch table.
- **Clipboard & Drag-and-Drop**: Drag files from anywhere or simply press `Ctrl+V` / `Cmd+V` with a file or screenshot in your clipboard.

---

## Supported Formats

Wild Converter supports extensive cross-format conversion across 9 distinct categories:

### 🖼️ Images
- **Formats**: `jpeg`, `png`, `webp`, `gif`, `svg`, `bmp`, `tiff`, `heic`, `heif`, `avif`, `ico`, `tga`, and lossless variants (`-ls`).
- **Features**: Quality sliders, pixel dimension scaling, lossless compression via `@jsquash` (Oxipng, MozJPEG, WebP, AVIF).

### 📄 Documents
- **Formats**: `pdf`, `docx`, `doc`, `pptx`, `ppt`, `xlsx`, `xls`, `csv`, `odt`, `ods`, `odp`, `rtf`, `txt`, `html`, `md`, `markdown`.
- **Features**: Image-to-PDF compilation, markdown rendering, presentation slide extraction, spreadsheet export.

### 🎵 Audio
- **Formats**: `mp3`, `wav`, `flac`, `aac`, `ogg`, `m4a`, `opus`, `wma`, `amr`, `ape`, `ac3`, and lossless variants.
- **Features**: Web Audio DSP pipeline, PCM channel re-sampling, LAME MP3 encoding, bitrate control.

### 🎬 Video
- **Formats**: `mp4`, `webm`, `mkv`, `mov`, `avi`, `flv`, `wmv`, `m4v`, `3gp`, `ogv`, `mpg`, `mpeg`.
- **Features**: HTML5 Canvas and MediaStream transcoding, frame extraction, WebM/MP4 container packaging.

### 📐 Vectors
- **Formats**: `svg`, `eps`, `ai`, `cdr`, `pdf` (vector), `dxf`, `dwg`, `wmf`, `emf`, `ps`.
- **Features**: SVG path rasterization, DXF geometry parsing, PostScript conversion, PDF-to-Vector compilation.

### 🧊 3D Models
- **Formats**: `stl`, `obj`, `glb`, `gltf`, `fbx`, `3ds`, `dae`, `amf`, `3mf`, `ply`.
- **Features**: Three.js WebGL geometry compilation, mesh buffer extraction, STL/OBJ/GLTF export.

### 🔤 Fonts
- **Formats**: `ttf`, `otf`, `woff`, `woff2`, `eot`, `svg` font.
- **Features**: OpenType parsing, WOFF2 WebAssembly decompressor and compiler, glyph preservation.

### 📦 Archives
- **Formats**: `zip`, `tar`, `gz`, `tgz`, `7z`, `rar`, `bz2`, `xz`, `iso`.
- **Features**: Pure client-side streaming Deflate/Tar unpacker and repackager with zero memory leaks.

### 💻 Code & Structured Data
- **Formats**: `json`, `yaml`, `xml`, `toml`, `csv`, `tsv`, `sql`, `html`, `css`, `js`, `ts`, `py`, `rust`, `go`, `cpp`, and more.
- **Features**: Syntax formatting, data serializing, format transposition.

---

## How It Works

```
┌────────────────────────────────────────────────────────┐
│                      Your Browser                      │
│                                                        │
│  [File Input / Paste / Drop]                           │
│             │                                          │
│             ▼                                          │
│  [Format & MIME Sniffer] (magic bytes + extension)     │
│             │                                          │
│             ▼                                          │
│  [WASM / Web Workers / WebGL / Canvas / Web Audio]     │
│             │                                          │
│             ▼                                          │
│  [In-Memory Binary Buffer / Blob Generation]           │
│             │                                          │
│             ▼                                          │
│  [Instant Local Download]                              │
└────────────────────────────────────────────────────────┘
          (Zero packets sent to any remote server)
```

1. **Detection**: Sniffs format via file headers, magic byte signatures, and extension parsing.
2. **Off-Thread Processing**: Intensive computations execute inside Web Workers and WASM threads to keep the UI smooth and responsive at 60fps.
3. **Download**: Converted files are synthesized as client-side `Blob` objects and triggered as standard browser downloads.

---

## Getting Started

### Prerequisites

- **Node.js**: v18.17.0 or higher
- **npm** (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/the-sukhsingh/wild-converter.git
   cd wild-converter
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Launch local development server on `localhost:3000` |
| `npm run build` | Compile production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint across code files |
| `npm run test:generate` | Generate test input files across multiple formats |
| `npm run test:convert` | Run automated test verification suite for converters |

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with Hallmark Utilitarian design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **WASM & Media Libraries**:
  - `@jsquash` (MozJPEG, Oxipng, WebP, AVIF)
  - `pdf-lib` & `pdfjs-dist`
  - `three` (WebGL 3D geometry engine)
  - `opentype.js` & `wawoff2` (Font compilation)
  - `fflate` & `jszip` (Streaming compression)
  - `@breezystack/lamejs` & Web Audio API
  - `docx`, `mammoth`, `pptxgenjs`, `xlsx`, `papaparse`

---

## Contributing

Contributions are warmly welcomed! Whether you are interested in:
- Adding support for new file formats or engines
- Optimizing WASM memory and execution speed
- Improving conversion fidelity and edge cases
- Enhancing documentation and guides

Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

---

## Community & Support

- **Bug Reports & Requests**: Please open an issue on [GitHub Issues](https://github.com/the-sukhsingh/wild-converter/issues).
- **Discussions & Feedback**: Feel free to open a discussion or pull request.

---

## License

This project is licensed under the [MIT License](LICENSE) &copy; 2026 Sukhjit Singh ([@the-sukhsingh](https://github.com/the-sukhsingh)).
