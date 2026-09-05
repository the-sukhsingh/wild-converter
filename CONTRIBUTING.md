# Contributing to Wild Converter

First off, thank you for your interest in contributing to **Wild Converter**! 🎉

Wild Converter is an open-source, universal file converter designed with an uncompromising focus on **privacy, speed, and clean minimalist design**. All conversions execute **100% client-side in the browser** using WebAssembly (WASM) and client-side web technologies.

We welcome contributions of all kinds: adding new format support, improving conversion performance, squashing bugs, refining the UI/UX, or improving documentation.

---

## Table of Contents

1. [Core Principles & Architectural Invariants](#core-principles--architectural-invariants)
2. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Local Development Setup](#local-development-setup)
   - [Available Scripts](#available-scripts)
3. [Project Architecture](#project-architecture)
4. [Step-by-Step: Adding a New Format or Converter](#step-by-step-adding-a-new-format-or-converter)
5. [Code Style & Best Practices](#code-style--best-practices)
6. [Pull Request Workflow](#pull-request-workflow)
7. [Reporting Issues](#reporting-issues)
8. [Code of Conduct](#code-of-conduct)

---

## Core Principles & Architectural Invariants

Before writing code, please understand the non-negotiable principles of Wild Converter:

1. **100% Client-Side Processing**:
   - Every conversion MUST happen inside the user's browser via WebAssembly, Web Workers, Web Audio DSP, Canvas/WebGL, or pure JavaScript.
   - **Never** add server-side conversion endpoints, external APIs, or remote data processing.
2. **Zero Tracking & Privacy by Design**:
   - No tracking scripts, analytics, telemetries, cookie trackers, or advertising SDKs.
   - User files never leave their device.
3. **Open & Minimalist Design**:
   - Flat, utilitarian aesthetic with crisp typography and intentional spacing.
   - Constrained layout (`max-w-5xl`), dark/light theme fidelity, and full mobile responsiveness.
   - Respect user performance: avoid heavy dependencies or unnecessary background work.

---

## Getting Started

### Prerequisites

- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **npm**: v9+ (or `pnpm` / `yarn`)
- **Git**

### Local Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/the-sukhsingh/wild-converter.git
   cd wild-converter
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server with hot reload |
| `npm run build` | Builds production bundle using webpack configuration |
| `npm run start` | Runs the production build server |
| `npm run lint` | Runs ESLint across all TypeScript and React files |
| `npm run test:generate` | Generates sample files across formats for local testing |
| `npm run test:convert` | Runs test conversion suite across supported engines |

---

## Project Architecture

```
wild-converter/
├── public/                # Static assets, WASM binaries, worker scripts
├── scripts/               # Sample generation & automated conversion verification
│   ├── generate-sample-files.ts
│   └── test-conversions.ts
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (categories)/  # Dedicated category routes (/images, /documents, /audio, etc.)
│   │   ├── globals.css    # Tailwind CSS & global styling
│   │   ├── tokens.css     # Design system tokens (typography, spacing, colors)
│   │   └── page.tsx       # Root landing page with universal drop target & batch table
│   ├── components/        # React components
│   │   ├── app-shell.tsx  # Global layout shell (header, category nav, footer)
│   │   ├── batch-converter/ # Multi-file batch table, queue, and modals
│   │   └── [category]-converter/ # Category-specific UI and conversion settings
│   ├── lib/               # Core business logic & format engines
│   │   ├── supported-formats.ts      # Master category & format registry
│   │   ├── format-utils.ts           # Universal format detection
│   │   ├── dropped-file-context.tsx  # Cross-route drag-drop/paste file context
│   │   └── [category]-converter/     # Pure WASM/JS conversion routines
│   └── types/             # TypeScript type definitions
```

---

## Step-by-Step: Adding a New Format or Converter

Want to add support for a new file format? Follow this flow:

### 1. Register Format Detection
Open `src/lib/<category>-format-utils.ts` (e.g., `image-format-utils.ts`, `audio-format-utils.ts`, etc.):
- Add the extension and MIME type to the category format constants.
- Ensure `detect<Category>Format(file)` identifies the new format from file extension and magic bytes/header signatures.

### 2. Implement Client-Side Conversion
In `src/lib/<category>-converter/`:
- If the format uses an existing WASM package (e.g., `@jsquash`, `ffmpeg-wasm`, `pdf-lib`), write the transcode logic in a pure function or Web Worker.
- Ensure errors are handled gracefully and output is returned as a standard `Blob` or `Uint8Array`.
- Avoid blocking the main UI thread during heavy operations.

### 3. Update Category Dispatcher
Open `src/lib/supported-formats.ts`:
- Make sure the new format is properly recognized in `isCategorySupported(...)` so drag-and-drop and category routing work smoothly.

### 4. Expose UI Options (if applicable)
If the format supports customizable parameters (e.g., bitrate, quality, resolution, page range):
- Add corresponding controls in `src/components/<category>-converter/` or the batch converter modal.
- Adhere to the clean, flat UI aesthetic without bulky styling.

### 5. Add Verification Tests
- Add a sample generator or test entry in `scripts/generate-sample-files.ts`.
- Add an automated test case in `scripts/test-conversions.ts`.
- Run:
  ```bash
  npm run test:convert
  ```

---

## Code Style & Best Practices

- **TypeScript**: Use strict typing. Avoid `any` wherever possible. Define explicit interfaces for conversion parameters and options.
- **Components**: Functional components with React hooks. Keep components focused, modular, and reusable.
- **Styling**: Use Tailwind CSS utility classes and design system tokens (`var(--color-...)`). Do not introduce ad-hoc CSS rules or external component libraries without discussion.
- **Memory & Resource Cleanup**:
  - Always revoke Object URLs using `URL.revokeObjectURL(...)` when done.
  - Free WASM heap memory or destroy worker instances when component unmounts.
- **Accessibility**: Ensure keyboard navigation, ARIA attributes, and high-contrast focus rings are maintained.

---

## Pull Request Workflow

1. **Create a topic branch**:
   ```bash
   git checkout -b feat/add-webp-ls-support
   ```
2. **Commit your changes**:
   We recommend following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add AVIF to SVG vector tracer`
   - `fix: correct audio buffer sample rate clipping`
   - `docs: update README supported formats list`
   - `perf: offload font compilation to web worker`
3. **Run tests & verification**:
   Make sure all checks pass before pushing:
   ```bash
   npm run lint
   npm run build
   ```
4. **Push and open a PR**:
   ```bash
   git push origin feat/add-webp-ls-support
   ```
   - Provide a clear title and description.
   - Describe what formats were added or what bug was fixed.
   - Include sample input files or test results if applicable.

---

## Reporting Issues

If you find a bug, have an idea for a new format engine, or have suggestions:
- **Check existing issues** first at [Issues](https://github.com/the-sukhsingh/wild-converter/issues) to prevent duplicates.
- **Open a detailed issue**:
  - **For bugs**: Include browser version, OS, file format attempted, sample file (if non-sensitive), and console errors.
  - **For feature requests**: Explain the format, the target format, and recommended client-side WASM or npm library.

---

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for everyone, regardless of experience level, gender identity, sexual orientation, disability, personal appearance, race, ethnicity, age, religion, or nationality.

- Treat everyone with respect, kindness, and empathy.
- Focus on constructive feedback and positive collaboration.
- Respect differing viewpoints and experiences.

Thank you for helping make Wild Converter the fastest, cleanest, and most private converter on the web!
