"use client";

import { useState, useCallback, type DragEvent } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ImageConverter } from "@/components/image-converter";
import { DocumentConverter } from "@/components/document-converter";
import { AudioConverter } from "@/components/audio-converter";
import { VideoConverter } from "@/components/video-converter";
import { VectorConverter } from "@/components/vector-converter";
import { ThreeDConverter } from "@/components/three-d-converter";
import { FontConverter } from "@/components/font-converter";
import { ArchiveConverter } from "@/components/archive-converter";
import { CodeConverter } from "@/components/code-converter";

import { detectFormat } from "@/lib/format-utils";
import { isAudioFile } from "@/lib/audio-format-utils";
import { isVideoFile } from "@/lib/video-format-utils";
import { isVectorFile } from "@/lib/vector-format-utils";
import { isThreeDFile } from "@/lib/three-d-format-utils";
import { isFontFile } from "@/lib/font-format-utils";
import { isArchiveFile } from "@/lib/archive-format-utils";
import { isCodeFile } from "@/lib/code-format-utils";

import {
  ImageIcon,
  FileText,
  Music,
  Film,
  Compass,
  Box,
  Type,
  Archive,
  Code2,
} from "lucide-react";

export type ConverterCategory =
  | "images"
  | "documents"
  | "audio"
  | "video"
  | "vector"
  | "3d"
  | "fonts"
  | "archive"
  | "code";

interface CategoryTab {
  id: ConverterCategory;
  label: string;
  icon: typeof ImageIcon;
  engineName: string;
}

const CATEGORIES: CategoryTab[] = [
  { id: "images", label: "Images", icon: ImageIcon, engineName: "canvas & wasm image engine" },
  { id: "documents", label: "Docs", icon: FileText, engineName: "pure client-side wasm document engine" },
  { id: "audio", label: "Audio", icon: Music, engineName: "web audio dsp & pcm engine" },
  { id: "video", label: "Video", icon: Film, engineName: "canvas & mediastream transcode engine" },
  { id: "vector", label: "Vectors", icon: Compass, engineName: "svg dom & postscript vector compiler" },
  { id: "3d", label: "3D Models", icon: Box, engineName: "webgl 3d geometry & buffer engine" },
  { id: "fonts", label: "Fonts", icon: Type, engineName: "opentype & woff2 wasm engine" },
  { id: "archive", label: "Archives", icon: Archive, engineName: "deflate/tar streaming compressor" },
  { id: "code", label: "Code", icon: Code2, engineName: "ast tokenizer & syntax transpiler" },
];

function detectCategoryFromFile(file: File): ConverterCategory {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  
  if (isVectorFile(file) || ext === "svg" || ext === "eps" || ext === "ai" || ext === "dxf") {
    return "vector";
  }
  if (isThreeDFile(file) || ext === "stl" || ext === "obj" || ext === "glb" || ext === "gltf" || ext === "ply" || ext === "3mf") {
    return "3d";
  }
  if (isFontFile(file) || ext === "ttf" || ext === "otf" || ext === "woff" || ext === "woff2" || ext === "eot") {
    return "fonts";
  }
  if (isArchiveFile(file) || ext === "zip" || ext === "tar" || ext === "gz" || ext === "tgz" || ext === "7z" || ext === "rar") {
    return "archive";
  }
  if (isAudioFile(file) || file.type.startsWith("audio/")) {
    return "audio";
  }
  if (isVideoFile(file) || file.type.startsWith("video/")) {
    return "video";
  }
  if (isCodeFile(file) || ext === "ts" || ext === "js" || ext === "py" || ext === "rs" || ext === "go" || ext === "css" || ext === "json" || ext === "yaml" || ext === "sql") {
    return "code";
  }
  if (detectFormat(file) !== null || file.type.startsWith("image/")) {
    return "images";
  }
  return "documents";
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<ConverterCategory>("documents");
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
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

  const handleGlobalDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const category = detectCategoryFromFile(file);
      setActiveCategory(category);
      setDroppedFile(file);
    }
  };

  const handleClearDroppedFile = useCallback(() => {
    setDroppedFile(null);
  }, []);

  const activeCategoryInfo = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
      className={`h-[100dvh] flex flex-col justify-between overflow-hidden bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--foreground)] selection:text-[var(--background)] relative ${
        isDragOver ? "ring-2 ring-[var(--foreground)]/20" : ""
      }`}
    >
      {/* ─── Header: Minimal Open-Design Navigation ───────────────── */}
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--background)] z-50">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans font-bold text-lg tracking-tight text-[var(--foreground)]">
                wild
              </span>
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                / converter
              </span>
            </div>

            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </div>

          {/* Category Tabs Switcher */}
          <nav className="flex items-center bg-[var(--foreground)]/5 p-0.5 rounded text-xs font-mono overflow-x-auto max-w-full scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Main Workspace ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {activeCategory === "images" && (
          <ImageConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        )}
        {activeCategory === "documents" && (
          <DocumentConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        )}
        {activeCategory === "audio" && (
          <AudioConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        )}
        {activeCategory === "video" && (
          <VideoConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        )}
        {activeCategory === "vector" && (
          <VectorConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        )}
        {activeCategory === "3d" && (
          <ThreeDConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        )}
        {activeCategory === "fonts" && (
          <FontConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        )}
        {activeCategory === "archive" && (
          <ArchiveConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        )}
        {activeCategory === "code" && (
          <CodeConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        )}
      </main>

      {/* ─── Footer: Minimal Flat Single Line ────────────────────── */}
      <footer className="shrink-0 h-10 border-t border-[var(--border)] bg-[var(--background)] z-50">
        <div className="w-full max-w-5xl h-full mx-auto px-4 md:px-8 flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span className="truncate">
            wild · {activeCategoryInfo.engineName}
          </span>
          <span className="hidden sm:inline shrink-0">100% private · zero server uploads</span>
        </div>
      </footer>
    </div>
  );
}
