"use client";

import { useCallback, useEffect, type DragEvent, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { useReportIssue } from "@/lib/report-issue-context";

import { isAudioFile } from "@/lib/audio-format-utils";
import { isVideoFile } from "@/lib/video-format-utils";
import { isVectorFile } from "@/lib/vector-format-utils";
import { isThreeDFile } from "@/lib/three-d-format-utils";
import { isFontFile } from "@/lib/font-format-utils";
import { isArchiveFile } from "@/lib/archive-format-utils";
import { detectFormat } from "@/lib/format-utils";

type ConverterCategory =
  | "images"
  | "documents"
  | "audio"
  | "video"
  | "vector"
  | "3d"
  | "fonts"
  | "archive";

interface CategoryTab {
  id: ConverterCategory;
  label: string;
  href: string;
  engineName: string;
}

const CATEGORIES: CategoryTab[] = [
  { id: "images",    label: "Images",   href: "/images",    engineName: "canvas & wasm image engine" },
  { id: "documents", label: "Docs",     href: "/documents", engineName: "pure client-side wasm document engine" },
  { id: "audio",     label: "Audio",    href: "/audio",     engineName: "web audio dsp & pcm engine" },
  { id: "video",     label: "Video",    href: "/video",     engineName: "canvas & mediastream transcode engine" },
  { id: "vector",    label: "Vectors",  href: "/vector",    engineName: "svg dom & postscript vector compiler" },
  { id: "3d",        label: "3D",       href: "/3d",        engineName: "webgl 3d geometry & buffer engine" },
  { id: "fonts",     label: "Fonts",    href: "/fonts",     engineName: "opentype & woff2 wasm engine" },
  { id: "archive",   label: "Archives", href: "/archive",   engineName: "deflate/tar streaming compressor" },
];

// Document extensions that must be checked BEFORE vector (PDF is in VECTOR_FORMATS but belongs to documents)
const DOCUMENT_EXTS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "md", "odt", "ods", "odp", "csv", "html", "htm"]);
const DOCUMENT_MIMES = ["application/pdf", "application/msword", "application/vnd.ms-excel", "application/vnd.ms-powerpoint", "text/plain", "text/csv", "text/html", "text/markdown"];

function detectCategoryFromFile(file: File): ConverterCategory {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  const mime = file.type.toLowerCase();

  // Documents must be checked first — PDF extension exists in VECTOR_FORMATS but is a document
  if (DOCUMENT_EXTS.has(ext)) return "documents";
  if (DOCUMENT_MIMES.some((m) => mime.startsWith(m))) return "documents";
  if (mime.includes("officedocument") || mime.includes("opendocument")) return "documents";

  if (isFontFile(file) || ext === "ttf" || ext === "otf" || ext === "woff" || ext === "woff2" || ext === "eot") return "fonts";
  if (isArchiveFile(file) || ext === "zip" || ext === "tar" || ext === "gz" || ext === "tgz" || ext === "7z" || ext === "rar") return "archive";
  if (isAudioFile(file) || mime.startsWith("audio/")) return "audio";
  if (isVideoFile(file) || mime.startsWith("video/")) return "video";
  // Check images before vector (SVG has image/ MIME type)
  if (detectFormat(file) !== null || (mime.startsWith("image/") && !mime.includes("svg"))) return "images";
  if (isVectorFile(file) || ext === "svg" || ext === "eps" || ext === "ai" || ext === "dxf" || ext === "cdr") return "vector";
  if (isThreeDFile(file) || ext === "stl" || ext === "obj" || ext === "glb" || ext === "gltf" || ext === "ply" || ext === "3mf") return "3d";
  if (mime.startsWith("image/")) return "images";
  return "documents";
}

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setDroppedFiles } = useDroppedFile();
  const { openReportIssue } = useReportIssue();
  const [isDragOver, setIsDragOver] = useState(false);

  // ── Feature 1: Clipboard paste ──────────────────────────────────────────
  useEffect(() => {
    async function handlePaste(e: ClipboardEvent) {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || target.isContentEditable) return;

      const items = Array.from(e.clipboardData?.items ?? []);

      // Collect all file-kind items from clipboard
      const fileItems = items.filter((item) => item.kind === "file");
      if (fileItems.length === 0) return;

      e.preventDefault();

      const files = fileItems
        .map((item) => {
          const f = item.getAsFile();
          if (!f) return null;

          // If the file has no name/extension (raw OS clipboard data like a screenshot),
          // synthesize a filename from its MIME type so detection works correctly.
          if (!f.name || f.name === "image" || !f.name.includes(".")) {
            const ext = f.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "bin";
            return new File([f], `pasted-${Date.now()}.${ext}`, { type: f.type });
          }
          return f;
        })
        .filter((f): f is File => f !== null);

      if (files.length === 0) return;

      setDroppedFiles(files);
      const firstCat = detectCategoryFromFile(files[0]);
      const allSame = files.every((f) => detectCategoryFromFile(f) === firstCat);

      if (allSame) {
        const cat = CATEGORIES.find((c) => c.id === firstCat)!;
        router.push(cat.href);
      } else {
        router.push("/");
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [router, setDroppedFiles]);

  const handleGlobalDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleGlobalDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleGlobalDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        setDroppedFiles(files);

        // If all files belong to a specific category, route there directly
        const firstCat = detectCategoryFromFile(files[0]);
        const allSameCat = files.every((f) => detectCategoryFromFile(f) === firstCat);

        if (allSameCat) {
          const target = CATEGORIES.find((c) => c.id === firstCat)!;
          router.push(target.href);
        } else {
          // If mixed files, route to homepage batch table
          router.push("/");
        }
      }
    },
    [router, setDroppedFiles]
  );

  const activeCategory = CATEGORIES.find(
    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
  );
  const engineName = activeCategory?.engineName ?? "pure client-side wasm engine";

  return (
    <div
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
      className={`h-dvh flex flex-col justify-between overflow-hidden bg-(--background) text-(--foreground) selection:bg-(--foreground) selection:text-(--background) relative ${
        isDragOver ? "ring-2 ring-(--foreground)/20" : ""
      }`}
    >
      {/* ─── Header ───────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-(--border) bg-(--background) z-50">
        {/* Top Bar */}
        <div className="w-full max-w-5xl h-13 sm:h-14 mx-auto px-4 md:px-8 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-baseline gap-1.5 shrink-0 select-none py-1">
            <span className="font-sans font-semibold text-base sm:text-lg tracking-tight text-(--foreground)">
              wild
            </span>
            <span className="font-mono text-xs text-(--muted-foreground)">
              / converter
            </span>
          </Link>

          {/* Desktop Category Navigation */}
          <nav className="hidden sm:flex items-center gap-0.5 overflow-x-auto no-scrollbar py-1 px-1">
            {CATEGORIES.map((cat) => {
              const isActive =
                pathname === cat.href || pathname.startsWith(cat.href + "/");
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className={`flex items-center justify-center py-1.5 px-2.5 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-(--card) text-(--foreground)"
                      : "text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/40"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="shrink-0 flex items-center gap-1">
            <a
              href="https://github.com/the-sukhsingh/wild-converter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/50 transition-colors focus-visible:outline-2 focus-visible:outline-(--ring) focus-visible:outline-offset-2"
              aria-label="GitHub repository"
              title="GitHub repository"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Horizontal Category Scroller */}
        <div className="sm:hidden relative border-t border-(--border)/50 bg-(--background)">
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-1.5">
            {CATEGORIES.map((cat) => {
              const isActive =
                pathname === cat.href || pathname.startsWith(cat.href + "/");
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className={`flex items-center justify-center h-7 px-2.5 rounded-full text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-(--foreground) text-(--background) shadow-xs"
                      : "bg-(--card)/80 text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ─── Main Workspace ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
        {children}
      </main>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-(--border) bg-(--background) z-50">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-2 sm:h-10 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs font-mono text-(--muted-foreground)">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Engine active" />
            <span className="truncate">wild · {engineName}</span>
            <span className="hidden md:inline text-(--muted-foreground)/40">/</span>
            <span className="hidden md:inline shrink-0">100% private · client-side wasm</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <a
              href="https://github.com/the-sukhsingh/wild-converter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-(--foreground) transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>github</span>
            </a>
            <span className="text-(--muted-foreground)/40">·</span>
            <a
              href="https://github.com/the-sukhsingh/wild-converter/blob/master/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-(--foreground) transition-colors"
            >
              contribute
            </a>
            <span className="text-(--muted-foreground)/40">·</span>
            <a
              href="https://github.com/the-sukhsingh/wild-converter/blob/master/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-(--foreground) transition-colors"
            >
              mit license
            </a>
            <span className="text-(--muted-foreground)/40">·</span>
            <button
              type="button"
              onClick={() => {
                const rawCat = pathname.replace("/", "").split("/")[0];
                openReportIssue({
                  category: rawCat && rawCat !== "" ? rawCat : undefined,
                });
              }}
              className="hover:text-rose-500 transition-colors cursor-pointer"
            >
              report issue
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
