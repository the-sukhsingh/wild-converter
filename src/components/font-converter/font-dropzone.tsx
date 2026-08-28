"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { isFontFile } from "@/lib/font-format-utils";

interface FontDropzoneProps {
  onFileSelect: (file: File) => void;
}

export function FontDropzone({ onFileSelect }: FontDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f && isFontFile(f)) {
        onFileSelect(f);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) onFileSelect(f);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onFileSelect]
  );

  return (
    <div className="w-full flex flex-col justify-center items-start gap-4 sm:gap-6 md:gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-(--foreground)">
          Convert fonts
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-(--muted-foreground) mt-1.5 sm:mt-2 max-w-lg leading-relaxed">
          Client-side converter. No file uploads, no tracking, 100% private.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`w-full max-w-xl p-4 sm:p-8 rounded-xl bg-(--card) hover:bg-(--muted)/70 transition-all cursor-pointer flex flex-col gap-3 group focus-visible:outline-2 focus-visible:outline-(--ring) focus-visible:outline-offset-2 ${
          isDragging ? "bg-(--muted) ring-2 ring-(--accent)" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-(--background) text-(--muted-foreground) group-hover:text-(--foreground) transition-colors shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm md:text-base font-medium text-(--foreground)">
              Drop a font file here, or choose file
            </div>
            <div className="text-xs font-mono text-(--muted-foreground) mt-0.5">
              WOFF2 · WOFF · TTF (TrueType) · OTF (OpenType) · EOT · SVG Font
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2,.eot,.svg,font/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
