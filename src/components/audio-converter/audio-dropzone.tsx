"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { isAudioFile } from "@/lib/audio-format-utils";

interface AudioDropzoneProps {
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
}

export function AudioDropzone({ onFileSelect, onFilesSelect }: AudioDropzoneProps) {
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
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-[var(--foreground)]">
          Convert audio
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[var(--muted-foreground)] mt-1.5 sm:mt-2 max-w-lg leading-relaxed">
          Batch convert & transcode audio files with pure client-side DSP. 100% private.
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
        className={`w-full max-w-xl p-4 sm:p-8 rounded-xl bg-[var(--card)] hover:bg-[var(--muted)]/70 transition-all cursor-pointer flex flex-col gap-3 group focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 ${
          isDragging ? "bg-[var(--muted)] ring-2 ring-[var(--accent)]" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--background)] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm md:text-base font-medium text-[var(--foreground)]">
              Drop audio files here, or choose files
            </div>
            <div className="text-xs font-mono text-[var(--muted-foreground)] mt-0.5">
              Supports multiple files · MP3 · WAV · FLAC · OGG · AAC · M4A · OPUS · AIFF · AMR · AC3 · WMA
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus,.wma,.amr,.ac3,.ape,.ra,.rm,.spx,.tta,.wv,.dff,.dsf,.aiff,.webm"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
