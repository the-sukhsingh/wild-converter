"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { isArchiveFile } from "@/lib/archive-format-utils";

interface ArchiveDropzoneProps {
  onFileSelect: (file: File) => void;
}

export function ArchiveDropzone({ onFileSelect }: ArchiveDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f && isArchiveFile(f)) {
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
    <div className="w-full flex flex-col justify-center items-start gap-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--foreground)]">
          Convert archives
        </h1>
        <p className="text-sm md:text-base text-[var(--muted-foreground)] mt-2 max-w-lg leading-relaxed">
          Client-side streaming decompression and archive repackager. Transcode ZIP, TAR, TGZ (tar.gz), 7Z, and GZ archives with zero server uploads.
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
              Drop an archive here, or choose file
            </div>
            <div className="text-xs font-mono text-[var(--muted-foreground)] mt-0.5">
              ZIP · TAR · TGZ (tar.gz) · GZ · 7Z · RAR · BZ2 · XZ · ISO · JAR · APK
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.tar,.gz,.tgz,.7z,.rar,.bz2,.xz,.iso,.dmg,.cab,.arj,.ace,.lzh,.lha,.jar,.war,.ear,.hpi,.nsf,.apk,.ipa,.deb,.rpm"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
