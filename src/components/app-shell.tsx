"use client";

import { useCallback, type DragEvent, useState } from "react";
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

function detectCategoryFromFile(file: File): ConverterCategory {
  const ext = file.name.toLowerCase().split(".").pop() || "";

  if (isVectorFile(file) || ext === "svg" || ext === "eps" || ext === "ai" || ext === "dxf") return "vector";
  if (isThreeDFile(file) || ext === "stl" || ext === "obj" || ext === "glb" || ext === "gltf" || ext === "ply" || ext === "3mf") return "3d";
  if (isFontFile(file) || ext === "ttf" || ext === "otf" || ext === "woff" || ext === "woff2" || ext === "eot") return "fonts";
  if (isArchiveFile(file) || ext === "zip" || ext === "tar" || ext === "gz" || ext === "tgz" || ext === "7z" || ext === "rar") return "archive";
  if (isAudioFile(file) || file.type.startsWith("audio/")) return "audio";
  if (isVideoFile(file) || file.type.startsWith("video/")) return "video";
  if (detectFormat(file) !== null || file.type.startsWith("image/")) return "images";
  return "documents";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setDroppedFile } = useDroppedFile();
  const [isDragOver, setIsDragOver] = useState(false);

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
        const file = e.dataTransfer.files[0];
        const category = detectCategoryFromFile(file);
        const target = CATEGORIES.find((c) => c.id === category)!;
        setDroppedFile(file);
        router.push(target.href);
      }
    },
    [router, setDroppedFile]
  );

  const activeCategory = CATEGORIES.find(
    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
  );
  const engineName = activeCategory?.engineName ?? "client-side wasm engine";

  return (
    <div
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
      className={`h-[100dvh] flex flex-col justify-between overflow-hidden bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--foreground)] selection:text-[var(--background)] relative ${
        isDragOver ? "ring-2 ring-[var(--foreground)]/20" : ""
      }`}
    >
      {/* ─── Header ───────────────────────────────────────────────── */}
      <header className="shrink-0 h-14 border-b border-[var(--border)] bg-[var(--background)] z-50">
        <div className="w-full max-w-5xl h-full mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-baseline gap-1.5 shrink-0 select-none">
            <span className="font-sans font-semibold text-base tracking-tight text-[var(--foreground)]">
              wild
            </span>
            <span className="font-mono text-xs text-[var(--muted-foreground)]">
              / converter
            </span>
          </Link>

          <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => {
              const isActive =
                pathname === cat.href || pathname.startsWith(cat.href + "/");
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className={`flex items-center justify-center py-2 px-2.5 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[var(--card)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/40"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Main Workspace ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
        {children}
      </main>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="shrink-0 h-10 border-t border-[var(--border)] bg-[var(--background)] z-50">
        <div className="w-full max-w-5xl h-full mx-auto px-4 md:px-8 flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span className="truncate">wild · {engineName}</span>
          <span className="hidden sm:inline shrink-0">100% private · zero server uploads</span>
        </div>
      </footer>
    </div>
  );
}
