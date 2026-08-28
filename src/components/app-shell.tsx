"use client";

import { useCallback, useEffect, type DragEvent, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDroppedFile } from "@/lib/dropped-file-context";

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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setDroppedFiles } = useDroppedFile();
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
      <footer className="shrink-0 h-9 sm:h-10 border-t border-(--border) bg-(--background) z-50">
        <div className="w-full max-w-5xl h-full mx-auto px-4 md:px-8 flex items-center justify-between text-[11px] sm:text-xs font-mono text-(--muted-foreground)">
          <span className="truncate max-w-70 sm:max-w-none">wild · {engineName}</span>
          <span className="hidden sm:inline shrink-0">100% private · zero server uploads</span>
        </div>
      </footer>
    </div>
  );
}
