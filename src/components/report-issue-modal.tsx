"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import type { ReportIssueData } from "@/lib/report-issue-context";
import { formatFileSize } from "@/lib/format-utils";
import {
  X,
  Bug,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  Monitor,
  Info,
} from "lucide-react";

interface ReportIssueModalProps {
  isOpen: boolean;
  initialData?: ReportIssueData;
  onClose: () => void;
}

const CATEGORY_MAP: Record<
  string,
  { label: string; formats: string[] }
> = {
  images: {
    label: "Images",
    formats: ["png", "jpeg", "webp", "avif", "gif", "svg", "bmp", "tiff", "heic", "ico"],
  },
  documents: {
    label: "Documents",
    formats: ["pdf", "docx", "pptx", "xlsx", "txt", "csv", "odt", "rtf", "html", "md"],
  },
  audio: {
    label: "Audio",
    formats: ["mp3", "wav", "flac", "aac", "ogg", "m4a", "opus", "wma"],
  },
  video: {
    label: "Video",
    formats: ["mp4", "webm", "mkv", "mov", "avi", "flv", "wmv", "3gp"],
  },
  vector: {
    label: "Vectors",
    formats: ["svg", "eps", "ai", "cdr", "pdf", "dxf", "dwg"],
  },
  "3d": {
    label: "3D Models",
    formats: ["stl", "obj", "glb", "gltf", "fbx", "3ds", "ply"],
  },
  fonts: {
    label: "Fonts",
    formats: ["ttf", "otf", "woff", "woff2", "eot"],
  },
  archive: {
    label: "Archives",
    formats: ["zip", "tar", "gz", "7z", "rar", "bz2", "xz", "iso"],
  },
  code: {
    label: "Code & Data",
    formats: ["json", "yaml", "xml", "toml", "sql", "ts", "js", "py", "html", "css"],
  },
  other: {
    label: "Other",
    formats: [],
  },
};

function detectClientEnv() {
  if (typeof window === "undefined") {
    return {
      browser: "Unknown Browser",
      os: "Unknown OS",
      screen: "Unknown",
      hasWasm: false,
      userAgent: "",
    };
  }

  const ua = navigator.userAgent;
  let browser = "Browser";
  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";

  let os = "OS";
  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  const hasWasm = typeof WebAssembly === "object";
  const screen = `${window.screen?.width || 0}x${window.screen?.height || 0}`;

  return {
    browser,
    os,
    screen,
    hasWasm,
    userAgent: ua,
  };
}

export function ReportIssueModal({
  isOpen,
  initialData,
  onClose,
}: ReportIssueModalProps) {
  const [category, setCategory] = useState<string>(
    initialData?.category || "documents"
  );
  const [sourceFormat, setSourceFormat] = useState<string>(
    initialData?.sourceFormat || ""
  );
  const [targetFormat, setTargetFormat] = useState<string>(
    initialData?.targetFormat || ""
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    initialData?.errorMessage || ""
  );
  const [description, setDescription] = useState<string>(
    initialData?.description || ""
  );
  const [fileName, setFileName] = useState<string>(
    initialData?.fileName || ""
  );
  const [fileSize, setFileSize] = useState<number | undefined>(
    initialData?.fileSize
  );
  const [includeEnv, setIncludeEnv] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const backdropRef = useRef<HTMLDivElement>(null);

  // Sync initialData when opened or changed
  useEffect(() => {
    if (initialData) {
      if (initialData.category && CATEGORY_MAP[initialData.category]) {
        setCategory(initialData.category);
      }
      if (initialData.sourceFormat) setSourceFormat(initialData.sourceFormat);
      if (initialData.targetFormat) setTargetFormat(initialData.targetFormat);
      if (initialData.errorMessage) setErrorMessage(initialData.errorMessage);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.fileName) setFileName(initialData.fileName);
      if (initialData.fileSize !== undefined) setFileSize(initialData.fileSize);
    }
  }, [initialData]);

  // Keyboard accessibility
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const env = useMemo(() => detectClientEnv(), []);

  const activeCategoryFormats = useMemo(() => {
    return CATEGORY_MAP[category]?.formats || [];
  }, [category]);

  const issueMarkdown = useMemo(() => {
    const src = (sourceFormat || "UNKNOWN").toUpperCase();
    const tgt = (targetFormat || "UNKNOWN").toUpperCase();
    const catLabel = CATEGORY_MAP[category]?.label || category;

    const sections = [
      `### Description`,
      description.trim() || `Conversion failed when attempting to convert from ${src} to ${tgt}.`,
      ``,
      `### Conversion Details`,
      `- **Category**: ${catLabel}`,
      `- **Source Format**: \`${src}\``,
      `- **Target Format**: \`${tgt}\``,
    ];

    if (fileName) {
      sections.push(`- **File Name**: \`${fileName}\``);
    }
    if (fileSize !== undefined && fileSize > 0) {
      sections.push(`- **File Size**: \`${formatFileSize(fileSize)}\``);
    }

    sections.push(
      ``,
      `### Error Message`,
      `\`\`\``,
      errorMessage.trim() || `No explicit error message captured.`,
      `\`\`\``
    );

    if (includeEnv) {
      sections.push(
        ``,
        `### System & Environment`,
        `- **Browser**: ${env.browser}`,
        `- **OS**: ${env.os}`,
        `- **Screen Resolution**: ${env.screen}`,
        `- **WebAssembly Available**: ${env.hasWasm ? "Yes" : "No"}`,
        `- **User Agent**: \`${env.userAgent}\``,
        `- **App URL**: \`${typeof window !== "undefined" ? window.location.href : "https://wild-converter.local"}\``,
        `- **Engine**: 100% Client-Side WASM`
      );
    }

    sections.push(
      ``,
      `---`,
      `_Reported via Wild Converter in-app bug reporter_`
    );

    return sections.join("\n");
  }, [
    category,
    sourceFormat,
    targetFormat,
    errorMessage,
    description,
    fileName,
    fileSize,
    includeEnv,
    env,
  ]);

  const githubIssueUrl = useMemo(() => {
    const src = (sourceFormat || "file").toUpperCase();
    const tgt = (targetFormat || "format").toUpperCase();
    const title = `[Bug]: Conversion error from ${src} to ${tgt}`;

    const baseUrl = "https://github.com/the-sukhsingh/wild-converter/issues/new";
    const params = new URLSearchParams({
      title,
      body: issueMarkdown,
      labels: "bug,conversion",
    });

    return `${baseUrl}?${params.toString()}`;
  }, [sourceFormat, targetFormat, issueMarkdown]);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(issueMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleOpenGitHub = () => {
    window.open(githubIssueUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-issue-title"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-(--background) border border-(--border) rounded-xl shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border) bg-(--card)/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="report-issue-title"
                className="text-sm sm:text-base font-medium text-(--foreground) tracking-tight"
              >
                Report Conversion Issue
              </h2>
              <p className="text-[11px] font-mono text-(--muted-foreground)">
                File a bug report directly on GitHub
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-md text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted) transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
          {/* Category Selection */}
          <div>
            <label
              htmlFor="issue-category"
              className="block font-medium text-(--foreground) mb-1.5"
            >
              Conversion Category
            </label>
            <select
              id="issue-category"
              value={category}
              onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                // Pre-fill target if empty
                const defaultFmts = CATEGORY_MAP[newCat]?.formats || [];
                if (defaultFmts.length > 0 && !targetFormat) {
                  setTargetFormat(defaultFmts[0]);
                }
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-(--border) bg-(--card) text-(--foreground) font-mono text-xs focus:outline-none focus:ring-1 focus:ring-(--ring)"
            >
              {Object.entries(CATEGORY_MAP).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Types (From & To) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="source-format"
                className="block font-medium text-(--foreground) mb-1.5"
              >
                Source Format (From)
              </label>
              <div className="relative">
                <input
                  id="source-format"
                  type="text"
                  placeholder="e.g. PPTX, PNG, MKV"
                  value={sourceFormat}
                  onChange={(e) => setSourceFormat(e.target.value.toLowerCase())}
                  className="w-full px-3 py-1.5 rounded-lg border border-(--border) bg-(--card) text-(--foreground) font-mono uppercase text-xs placeholder:normal-case placeholder:text-(--muted-foreground) focus:outline-none focus:ring-1 focus:ring-(--ring)"
                />
              </div>
              {/* Quick Format Chips */}
              {activeCategoryFormats.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-1.5">
                  <span className="text-[10px] font-mono text-(--muted-foreground)">quick:</span>
                  {activeCategoryFormats.slice(0, 5).map((fmt) => (
                    <button
                      key={`src-${fmt}`}
                      type="button"
                      onClick={() => setSourceFormat(fmt)}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                        sourceFormat === fmt
                          ? "border-(--foreground) bg-(--foreground) text-(--background)"
                          : "border-(--border) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="target-format"
                className="block font-medium text-(--foreground) mb-1.5 flex items-center gap-1"
              >
                <ArrowRight className="w-3 h-3 text-(--muted-foreground)" />
                Target Format (To)
              </label>
              <div className="relative">
                <input
                  id="target-format"
                  type="text"
                  placeholder="e.g. PDF, WEBP, MP4"
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value.toLowerCase())}
                  className="w-full px-3 py-1.5 rounded-lg border border-(--border) bg-(--card) text-(--foreground) font-mono uppercase text-xs placeholder:normal-case placeholder:text-(--muted-foreground) focus:outline-none focus:ring-1 focus:ring-(--ring)"
                />
              </div>
              {/* Quick Format Chips */}
              {activeCategoryFormats.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-1.5">
                  <span className="text-[10px] font-mono text-(--muted-foreground)">quick:</span>
                  {activeCategoryFormats.slice(0, 5).map((fmt) => (
                    <button
                      key={`tgt-${fmt}`}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                        targetFormat === fmt
                          ? "border-(--foreground) bg-(--foreground) text-(--background)"
                          : "border-(--border) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional File Name */}
          {fileName && (
            <div className="p-2 rounded-lg bg-(--muted)/40 border border-(--border) flex items-center justify-between text-[11px] font-mono text-(--muted-foreground)">
              <span className="truncate max-w-72">File: {fileName}</span>
              {fileSize !== undefined && fileSize > 0 && (
                <span className="shrink-0">{formatFileSize(fileSize)}</span>
              )}
            </div>
          )}

          {/* Error Message */}
          <div>
            <label
              htmlFor="issue-error-message"
              className="block font-medium text-(--foreground) mb-1.5 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Error Message or Status</span>
            </label>
            <input
              id="issue-error-message"
              type="text"
              placeholder="e.g. Memory access out of bounds in WASM engine"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-(--border) bg-(--card) font-mono text-xs text-rose-600 dark:text-rose-400 placeholder:text-(--muted-foreground) focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="issue-description"
              className="block font-medium text-(--foreground) mb-1.5"
            >
              Description & Reproduction (Optional)
            </label>
            <textarea
              id="issue-description"
              rows={3}
              placeholder="Describe what happened: e.g. dropped a 20-page document, conversion stalled at 50%, or resulting image had distorted colors..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--card) text-xs text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-1 focus:ring-(--ring) resize-none"
            />
          </div>

          {/* System & Diagnostic Preview */}
          <div className="p-3 rounded-lg border border-(--border) bg-(--muted)/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-(--muted-foreground)" />
                <span className="font-medium text-xs text-(--foreground)">
                  Diagnostic Snapshot
                </span>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] font-mono text-(--muted-foreground) cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeEnv}
                  onChange={(e) => setIncludeEnv(e.target.checked)}
                  className="rounded border-(--border)"
                />
                <span>Include in report</span>
              </label>
            </div>

            {includeEnv && (
              <p className="font-mono text-[11px] text-(--muted-foreground)">
                {env.browser} · {env.os} · {env.screen} · WASM: {env.hasWasm ? "Supported" : "Unavailable"}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t border-(--border) bg-(--card)/40 shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-mono text-(--muted-foreground)">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Opens GitHub in a new tab</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border border-(--border) bg-(--card) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted) transition-colors"
              title="Copy formatted markdown to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenGitHub}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-(--foreground) text-(--background) hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
            >
              <span>Create Issue on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
