"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  type FontFormat,
  FONT_FORMATS,
  detectFontFormat,
} from "@/lib/font-format-utils";
import {
  parseFontFile,
  convertFont,
  type FontConversionOptions,
  type FontMetadata,
  type FontConversionResult,
} from "@/lib/font-converter";
import type { Font } from "opentype.js";
import { FontDropzone } from "./font-dropzone";
import { FontHeader } from "./font-header";
import { FontFormatSelector } from "./font-format-selector";
import { FontOptionsPanel } from "./font-options";
import { FontActionBar } from "./font-action-bar";

interface FontConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function FontConverter({
  initialFile,
  onClearInitialFile,
}: FontConverterProps = {}) {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [font, setFont] = useState<Font | null>(null);
  const [metadata, setMetadata] = useState<FontMetadata | null>(null);
  const [targetFormat, setTargetFormat] = useState<FontFormat>("woff2");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<FontConversionOptions>({
    format: "woff2",
    generateCssFace: true,
    hinting: true,
    subsetAsciiOnly: false,
  });

  const [exactProbedSize, setExactProbedSize] = useState<number | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatusText, setConversionStatusText] = useState("");
  const [conversionResult, setConversionResult] = useState<FontConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isCancelledRef = useRef(false);

  const handleFileSelect = useCallback(async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setConversionResult(null);
    try {
      const { font: parsedFont, metadata: meta } = await parseFontFile(f);
      setFont(parsedFont);
      setMetadata(meta);

      const defaultFmt: FontFormat = meta.format === "woff2" ? "woff" : "woff2";
      setTargetFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
        customFontFamily: meta.familyName,
      }));
    } catch (err) {
      console.error("Font parse error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse OpenType font file");
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
    const srcBytes = metadata.fileSizeBytes;
    let estBytes = 0;

    if (targetFormat === "woff2") {
      estBytes = Math.round(srcBytes * 0.45);
    } else if (targetFormat === "woff") {
      estBytes = Math.round(srcBytes * 0.6);
    } else if (targetFormat === "eot") {
      estBytes = Math.round(srcBytes * 0.7);
    } else if (targetFormat === "svg") {
      estBytes = Math.round(srcBytes * 1.8);
    } else {
      estBytes = srcBytes;
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
    setFont(null);
    setMetadata(null);
    setConversionResult(null);
    setErrorMsg(null);
    if (onClearInitialFile) onClearInitialFile();
  }, [handleCancel, onClearInitialFile]);

  const handleConvert = useCallback(async () => {
    if (!font || !file || !metadata) return;
    isCancelledRef.current = false;
    setIsConverting(true);
    setErrorMsg(null);
    setConversionProgress(25);
    setConversionStatusText("Compiling OpenType glyph tables...");

    try {
      setConversionProgress(65);
      setConversionStatusText(`Encoding ${targetFormat.toUpperCase()} font container...`);
      const res = await convertFont(font, file.name, {
        ...options,
        format: targetFormat,
      });
      if (isCancelledRef.current) return;
      setConversionResult(res);
      setConversionProgress(100);
      setIsConverting(false);
    } catch (err) {
      if (isCancelledRef.current) return;
      console.error("Conversion error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Font compilation failed");
      setIsConverting(false);
    }
  }, [font, file, metadata, targetFormat, options]);

  const hasFile = !!file;
  const targetMeta = FONT_FORMATS[targetFormat];
  const outputName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}.${targetMeta?.extension || "woff2"}`
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
        <FontDropzone onFileSelect={handleFileSelect} />
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
            <FontHeader metadata={metadata} onRemove={handleRemove} />

            {/* Format Selector */}
            <FontFormatSelector
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
            <FontOptionsPanel
              targetFormat={targetFormat}
              options={options}
              metadata={metadata}
              onOptionsChange={setOptions}
            />

            {/* Action Bar */}
            <FontActionBar
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
