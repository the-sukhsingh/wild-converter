"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface UploadDropzoneProps {
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
}

export function UploadDropzone({ onFileSelect, onFilesSelect }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const fileArr = Array.from(files);
      if (fileArr.length > 1 && onFilesSelect) {
        onFilesSelect(fileArr);
      } else if (fileArr.length === 1) {
        if (onFilesSelect) onFilesSelect(fileArr);
        else if (onFileSelect) onFileSelect(fileArr[0]);
      } else if (onFilesSelect) {
        onFilesSelect(fileArr);
      }
    },
    [onFileSelect, onFilesSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleFiles]
  );

  return (
    <div className="w-full flex flex-col justify-center items-start gap-4 sm:gap-6 md:gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-(--foreground)">
          Convert images
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-(--muted-foreground) mt-1.5 sm:mt-2 max-w-lg leading-relaxed">
          Batch convert, compress & reorder images to PDF. 100% private in browser.
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
              Drop images here, or choose files
            </div>
            <div className="text-xs font-mono text-(--muted-foreground) mt-0.5">
              Supports multiple files · JPEG · PNG · WebP · AVIF · GIF · SVG · TIFF · BMP · HEIC
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.heic,.heif,.svg,.bmp,.ico,.tga,.tiff,.tif"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
