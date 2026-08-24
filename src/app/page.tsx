"use client";

import { useState, useCallback, type DragEvent } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ImageConverter } from "@/components/image-converter";
import { DocumentConverter } from "@/components/document-converter";
import { detectFileMainCategory } from "@/lib/document-format-utils";
import { ImageIcon, FileText } from "lucide-react";

type ConverterCategory = "images" | "documents";

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
      const category = detectFileMainCategory(file);

      if (category === "image") {
        setActiveCategory("images");
      } else {
        setActiveCategory("documents");
      }

      setDroppedFile(file);
    }
  };

  const handleClearDroppedFile = useCallback(() => {
    setDroppedFile(null);
  }, []);

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
      <header className="shrink-0 h-14 border-b border-[var(--border)] bg-[var(--background)] z-50">
        <div className="w-full max-w-5xl h-full mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans font-bold text-lg tracking-tight text-[var(--foreground)]">
                wild
              </span>
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                / converter
              </span>
            </div>

            {/* Category Mode Switcher */}
            <div className="flex items-center bg-[var(--foreground)]/5 p-0.5 rounded text-xs font-mono ml-2 sm:ml-4">
              <button
                type="button"
                onClick={() => setActiveCategory("images")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeCategory === "images"
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Images</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory("documents")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeCategory === "documents"
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Documents</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Main Workspace ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {activeCategory === "images" ? (
          <ImageConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        ) : (
          <DocumentConverter
            initialFile={droppedFile}
            onClearInitialFile={handleClearDroppedFile}
          />
        )}
      </main>

      {/* ─── Footer: Minimal Flat Single Line ────────────────────── */}
      <footer className="shrink-0 h-10 border-t border-[var(--border)] bg-[var(--background)] z-50">
        <div className="w-full max-w-5xl h-full mx-auto px-4 md:px-8 flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span className="truncate">
            wild · {activeCategory === "images" ? "canvas & wasm image engine" : "pure client-side wasm document engine"}
          </span>
          <span className="hidden sm:inline shrink-0">100% private · zero server uploads</span>
        </div>
      </footer>
    </div>
  );
}
