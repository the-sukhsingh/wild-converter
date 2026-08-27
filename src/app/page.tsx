/* Hallmark · genre: modern-minimal · macrostructure: Marquee Hero · tone: utilitarian · anchor hue: warm-coral
 * enrichment: none · pre-emit critique: P5 H5 E5 S5 R5 V5
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { BatchTable } from "@/components/batch-converter/batch-table";

/* ── category detection ─────────────────────────────────────── */

type Category = "images" | "documents" | "audio" | "video" | "vector" | "3d" | "fonts" | "archive";

const EXT: Record<string, Category> = {
  jpg: "images", jpeg: "images", png: "images", webp: "images", gif: "images",
  avif: "images", heic: "images", heif: "images", bmp: "images", tiff: "images",
  tif: "images", ico: "images", tga: "images",
  svg: "vector", eps: "vector", ai: "vector", dxf: "vector", dwg: "vector",
  wmf: "vector", emf: "vector", ps: "vector",
  stl: "3d", obj: "3d", glb: "3d", gltf: "3d", fbx: "3d",
  "3ds": "3d", dae: "3d", amf: "3d", "3mf": "3d", ply: "3d",
  ttf: "fonts", otf: "fonts", woff: "fonts", woff2: "fonts", eot: "fonts",
  mp3: "audio", wav: "audio", flac: "audio", aac: "audio", ogg: "audio",
  m4a: "audio", opus: "audio", wma: "audio", amr: "audio", ape: "audio",
  mp4: "video", webm: "video", mkv: "video", mov: "video", avi: "video",
  flv: "video", wmv: "video", m4v: "video", "3gp": "video", ogv: "video",
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive",
  gz: "archive", bz2: "archive", xz: "archive", iso: "archive",
  pdf: "documents", doc: "documents", docx: "documents", txt: "documents",
  rtf: "documents", md: "documents", html: "documents", htm: "documents",
  odt: "documents", xls: "documents", xlsx: "documents", csv: "documents",
  ppt: "documents", pptx: "documents",
};

const ROUTES: Record<Category, string> = {
  images: "/images", documents: "/documents", audio: "/audio",
  video: "/video", vector: "/vector", "3d": "/3d", fonts: "/fonts", archive: "/archive",
};

function detect(file: File): Category {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (EXT[ext]) return EXT[ext];
  if (file.type.startsWith("image/")) return "images";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  return "documents";
}

/* ── page ───────────────────────────────────────────────────── */

export default function Home() {
  const router = useRouter();
  const { droppedFiles, setDroppedFiles, clearDroppedFiles } = useDroppedFile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;

      if (files.length === 1) {
        const file = files[0];
        setDroppedFiles(files);
        router.push(ROUTES[detect(file)]);
      } else {
        // Multiple files: check if all same category or mixed
        const firstCat = detect(files[0]);
        const allSame = files.every((f) => detect(f) === firstCat);
        setDroppedFiles(files);

        if (allSame) {
          router.push(ROUTES[firstCat]);
        }
        // If mixed, staying on homepage with droppedFiles will render the BatchTable!
      }
    },
    [router, setDroppedFiles]
  );

  // If there are multiple files in context on the homepage, render the BatchTable directly
  if (droppedFiles && droppedFiles.length > 1) {
    return (
      <BatchTable
        initialFiles={droppedFiles}
        onClearInitialFiles={clearDroppedFiles}
      />
    );
  }

  return (
    <>
      {/* The entire viewport area is the drop target */}
      <div
        id="homepage-dropzone"
        role="button"
        tabIndex={0}
        aria-label="Drop files or click to choose"
        data-over={over}
        className="drop-stage"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragEnter={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
          }
        }}
      >
        <div className="drop-content">
          <p className="drop-label" data-over={over}>
            {over ? "release to convert" : "drop files to convert"}
          </p>
          <p className="drop-hint">supports multiple files · click anywhere to browse</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="*/*"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(Array.from(e.target.files));
            }
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </div>

      <style>{`
        .drop-stage {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          outline: none;
          transition: background 200ms ease;
          -webkit-user-select: none;
          user-select: none;
        }

        .drop-stage[data-over="true"] {
          background: var(--card);
        }

        .drop-stage:focus-visible {
          outline: 2px solid var(--ring);
          outline-offset: -3px;
        }

        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          pointer-events: none;
        }

        .drop-label {
          font-family: var(--font-sans);
          font-size: clamp(1rem, 2vw + 0.5rem, 1.375rem);
          font-weight: 500;
          color: var(--foreground);
          letter-spacing: -0.02em;
          margin: 0;
          transition: opacity 150ms ease;
        }

        .drop-hint {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--muted-foreground);
          margin: 0;
          transition: opacity 150ms ease;
        }

        .drop-stage[data-over="true"] .drop-hint {
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .drop-stage, .drop-label, .drop-hint { transition: none; }
        }
      `}</style>
    </>
  );
}
