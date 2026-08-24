"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Music, UploadCloud } from "lucide-react";
import { isAudioFile } from "@/lib/audio-format-utils";

interface AudioDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function AudioDropzone({
  onFileSelect,
  isProcessing = false,
}: AudioDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (isAudioFile(file) || file.type.startsWith("audio/")) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative w-full border border-dashed rounded-lg p-8 sm:p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center select-none ${
        isDragOver
          ? "border-[var(--foreground)] bg-[var(--foreground)]/[0.03]"
          : "border-[var(--border)] hover:border-[var(--muted-foreground)]/50 hover:bg-[var(--foreground)]/[0.01]"
      } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus,.wma,.amr,.ac3,.ape,.ra,.rm,.spx,.tta,.wv,.dff,.dsf,.aiff,.webm"
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="w-12 h-12 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center mb-4 text-[var(--foreground)]">
        {isDragOver ? (
          <UploadCloud className="w-6 h-6 animate-bounce" />
        ) : (
          <Music className="w-6 h-6" />
        )}
      </div>

      <div className="space-y-1.5 mb-3">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Drop your audio file here, or{" "}
          <span className="underline underline-offset-4">browse</span>
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Supports MP3, WAV, FLAC, OGG, AAC, M4A, OPUS, AIFF, AMR, AC3, APE & 25+ audio types
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md pt-2">
        {["MP3", "WAV", "FLAC", "OGG", "AAC", "M4A", "OPUS", "AIFF", "AMR", "AC3", "APE", "WMA"].map(
          (ext) => (
            <span
              key={ext}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--foreground)]/5 text-[var(--muted-foreground)]"
            >
              .{ext.toLowerCase()}
            </span>
          )
        )}
      </div>
    </div>
  );
}
