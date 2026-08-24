"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { ImageConverter } from "@/components/image-converter";

export default function Home() {
  return (
    <div className="h-[100dvh] flex flex-col justify-between overflow-hidden bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--foreground)] selection:text-[var(--background)]">
      {/* ─── Header: Minimal Tailwind Nav ───────────────────────── */}
      <header className="shrink-0 h-14 border-b border-[var(--border)] bg-[var(--background)] z-50">
        <div className="w-full max-w-5xl h-full mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-bold text-lg tracking-tight text-[var(--foreground)]">
              wild
            </span>
            <span className="font-mono text-xs text-[var(--muted-foreground)]">
              / image converter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Main Workspace ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        <ImageConverter />
      </main>

      {/* ─── Footer: Minimal Tailwind Single Line ────────────────── */}
      <footer className="shrink-0 h-10 border-t border-[var(--border)] bg-[var(--background)] z-50">
        <div className="w-full max-w-5xl h-full mx-auto px-4 md:px-8 flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>wild · client-side wasm / canvas engine</span>
          <span className="hidden sm:inline">100% private · zero server uploads</span>
        </div>
      </footer>
    </div>
  );
}
