"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  type ArchiveFormat,
  ARCHIVE_FORMATS,
  detectArchiveFormat,
} from "@/lib/archive-format-utils";
import {
  parseArchiveFile,
  convertArchive,
  type ArchiveConversionOptions,
  type ArchiveMetadata,
  type ArchiveConversionResult,
} from "@/lib/archive-converter";
import { ArchiveDropzone } from "./archive-dropzone";
import { ArchiveHeader } from "./archive-header";
import { ArchiveFormatSelector } from "./archive-format-selector";
import { ArchiveOptionsPanel } from "./archive-options";
import { ArchiveActionBar } from "./archive-action-bar";

interface OnConversionCompletePayload {
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

interface ArchiveConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
  onConversionComplete?: (payload: OnConversionCompletePayload) => void;
}

export function ArchiveConverter({
  initialFile,
  onClearInitialFile,
  onConversionComplete,
}: ArchiveConverterProps = {}) {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
  const [targetFormat, setTargetFormat] = useState<ArchiveFormat>("tgz");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<ArchiveConversionOptions>({
    format: "tgz",
    compressionLevel: 6,
    stripRootFolder: false,
  });

  const [exactProbedSize, setExactProbedSize] = useState<number | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatusText, setConversionStatusText] = useState("");
  const [conversionResult, setConversionResult] = useState<ArchiveConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isCancelledRef = useRef(false);

  const handleFileSelect = useCallback(async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setConversionResult(null);
    try {
      const meta = await parseArchiveFile(f);
      setMetadata(meta);

      const defaultFmt: ArchiveFormat = f.name.endsWith(".zip") ? "tgz" : "zip";
      setTargetFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
      }));
    } catch (err) {
      console.error("Archive parse error:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Failed to unpack archive. Archive might be password protected or corrupted."
      );
    }
  }, []);

  // Sync initialFile
  useEffect(() => {
    if (initialFile && initialFile !== file) {
      handleFileSelect(initialFile);
    }
  }, [initialFile, file, handleFileSelect]);

  // Live estimated size calculation
  useEffect(() => {
    if (!metadata || !targetFormat) {
      setExactProbedSize(null);
      return;
    }
    const uncomp = metadata.uncompressedSize;
    let estBytes = 0;

    if (targetFormat === "zip") {
      estBytes = Math.round(uncomp * 0.48);
    } else if (targetFormat === "tgz") {
      estBytes = Math.round(uncomp * 0.42);
    } else if (targetFormat === "tar") {
      estBytes = uncomp + metadata.totalFiles * 512;
    } else if (targetFormat === "7z") {
      estBytes = Math.round(uncomp * 0.35);
    } else {
      estBytes = Math.round(uncomp * 0.5);
    }

    setExactProbedSize(estBytes);
  }, [metadata, targetFormat, options]);

  // Reset conversion state on parameter changes
  useEffect(() => {
    setConversionResult(null);
    setErrorMsg(null);
    setConversionProgress(0);
    setConversionStatusText("");
  }, [file, targetFormat, options]);

  const handleCancel = useCallback(() => {
    isCancelledRef.current = true;
    setIsConverting(false);
    setConversionProgress(0);
    setConversionStatusText("");
  }, []);

  const handleRemove = useCallback(() => {
    handleCancel();
    setFile(null);
    setMetadata(null);
    setConversionResult(null);
    setErrorMsg(null);
    if (onClearInitialFile) onClearInitialFile();
  }, [handleCancel, onClearInitialFile]);

  const handleConvert = useCallback(async () => {
    if (!metadata || !file) return;
    isCancelledRef.current = false;
    setIsConverting(true);
    setErrorMsg(null);
    setConversionProgress(10);
    setConversionStatusText("Preparing archive stream...");

    try {
      const res = await convertArchive(
        metadata,
        file.name,
        {
          ...options,
          format: targetFormat,
        },
        (progress, text) => {
          if (!isCancelledRef.current) {
            setConversionProgress(progress);
            setConversionStatusText(text);
          }
        }
      );
      if (isCancelledRef.current) return;
      setConversionResult(res);
      setConversionProgress(100);
      setIsConverting(false);
      onConversionComplete?.({
        inputFileName: file.name,
        outputFileName: `${file.name.replace(/\.[^/.]+$/, "")}.${ARCHIVE_FORMATS[targetFormat]?.extension || "zip"}`,
        inputSize: file.size,
        outputSize: res.blob.size,
        status: "done",
      });
    } catch (err) {
      if (isCancelledRef.current) return;
      console.error("Conversion error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Archive repackaging failed");
      setIsConverting(false);
    }
  }, [metadata, file, targetFormat, options, onConversionComplete]);

  const hasFile = !!file;
  const targetMeta = ARCHIVE_FORMATS[targetFormat];
  const outputName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}.${targetMeta?.extension || "zip"}`
    : "";

  const sizeDiffPercent = useMemo(() => {
    if (!exactProbedSize || !file?.size) return null;
    return Math.round(((exactProbedSize - file.size) / file.size) * 100);
  }, [exactProbedSize, file?.size]);

  return (
    <div className="relative flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 overflow-hidden">
      {/* State 1: Dropzone */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-6 flex flex-col justify-center transition-opacity duration-200 ${
          !hasFile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={hasFile}
      >
        <ArchiveDropzone onFileSelect={handleFileSelect} />
      </div>

      {/* State 2: Active Workspace */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-6 flex flex-col justify-between transition-opacity duration-200 ${
          hasFile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!hasFile}
      >
        {file && metadata && (
          <div className="h-full flex flex-col justify-between gap-4">
            {/* Header */}
            <ArchiveHeader metadata={metadata} onRemove={handleRemove} />

            {/* Format Selector */}
            <ArchiveFormatSelector
              selectedFormat={targetFormat}
              inputFormat={metadata.format}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectFormat={(fmt) => {
                setTargetFormat(fmt);
                setSearchQuery("");
              }}
            />

            {/* Options Panel */}
            <ArchiveOptionsPanel
              targetFormat={targetFormat}
              options={options}
              metadata={metadata}
              onOptionsChange={setOptions}
            />

            {/* Action Bar */}
            <ArchiveActionBar
              targetFormat={targetFormat}
              exactProbedSize={exactProbedSize}
              sizeDiffPercent={sizeDiffPercent}
              isProbing={isProbing}
              isConverting={isConverting}
              progress={conversionProgress}
              progressText={conversionStatusText}
              resultUrl={conversionResult?.url || null}
              resultBlob={conversionResult?.blob || null}
              outputName={outputName}
              onConvert={handleConvert}
              onCancel={handleCancel}
            />

            {errorMsg && (
              <div className="text-xs font-mono text-destructive">
                {errorMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
