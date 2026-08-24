"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
}

export function UploadDropzone({ onFileSelect }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFileSelect(f);
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
    <div className="w-full flex flex-col justify-center items-start gap-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--foreground)]">
          Convert images
        </h1>
        <p className="text-sm md:text-base text-[var(--muted-foreground)] mt-2 max-w-lg leading-relaxed">
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
        className={`w-full max-w-xl p-8 rounded-xl bg-[var(--card)] hover:bg-[var(--muted)]/70 transition-all cursor-pointer flex flex-col gap-3 group focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 ${
          isDragging ? "bg-[var(--muted)] ring-2 ring-[var(--accent)]" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--background)] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm md:text-base font-medium text-[var(--foreground)]">
              Drop an image here, or choose file
            </div>
            <div className="text-xs font-mono text-[var(--muted-foreground)] mt-0.5">
              JPEG · PNG · WebP · AVIF · GIF · SVG · TIFF · BMP · ICO · TGA · HEIC
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif,.svg,.bmp,.ico,.tga,.tiff,.tif"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
