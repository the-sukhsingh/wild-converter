"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  type VectorFormat,
  VECTOR_FORMATS,
  detectVectorFormat,
} from "@/lib/vector-format-utils";
import {
  parseVectorFile,
  convertVector,
  type VectorConversionOptions,
  type VectorMetadata,
  type VectorConversionResult,
} from "@/lib/vector-converter";
import { VectorDropzone } from "./vector-dropzone";
import { VectorHeader } from "./vector-header";
import { VectorFormatSelector } from "./vector-format-selector";
import { VectorOptionsPanel } from "./vector-options";
import { VectorActionBar } from "./vector-action-bar";

interface VectorConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function VectorConverter({
  initialFile,
  onClearInitialFile,
}: VectorConverterProps = {}) {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [metadata, setMetadata] = useState<VectorMetadata | null>(null);
  const [targetFormat, setTargetFormat] = useState<VectorFormat>("eps");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<VectorConversionOptions>({
    format: "eps",
    scale: 2,
    dpi: 300,
    background: "transparent",
    strokePrecision: 3,
    dxfVersion: "R2000",
    optimizeSvg: true,
  });

  const [exactProbedSize, setExactProbedSize] = useState<number | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<VectorConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync initialFile
  useEffect(() => {
    if (initialFile && initialFile !== file) {
      handleFileSelect(initialFile);
    }
  }, [initialFile]);

  const handleFileSelect = useCallback(async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setConversionResult(null);
    try {
      const meta = await parseVectorFile(f);
      setMetadata(meta);

      const defaultFmt: VectorFormat = meta.format === "svg" ? "eps" : "svg";
      setTargetFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
      }));
    } catch (err) {
      console.error("Vector parse error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse vector graphic");
    }
  }, []);

  // Live estimated size calculation
  useEffect(() => {
    if (!metadata || !targetFormat) {
      setExactProbedSize(null);
      return;
    }
    const formatInfo = VECTOR_FORMATS[targetFormat];
    let estBytes = 0;

    if (formatInfo.category === "rasterize") {
      const w = metadata.width * options.scale;
      const h = metadata.height * options.scale;
      estBytes = Math.round(w * h * (targetFormat === "png" ? 0.35 : 0.15));
    } else if (targetFormat === "dxf") {
      estBytes = Math.round(metadata.pathCount * 180 + 2048);
    } else if (targetFormat === "eps" || targetFormat === "ai" || targetFormat === "ps") {
      estBytes = Math.round(metadata.svgContent.length * 1.2 + 1024);
    } else if (targetFormat === "pdf") {
      estBytes = Math.round(metadata.svgContent.length * 1.5 + 4096);
    } else {
      estBytes = Math.round(metadata.svgContent.length * 0.9);
    }

    setExactProbedSize(estBytes);
  }, [metadata, targetFormat, options]);

  // Reset conversion state on parameter changes
  useEffect(() => {
    setConversionResult(null);
    setErrorMsg(null);
  }, [file, targetFormat, options]);

  const handleRemove = useCallback(() => {
    setFile(null);
    setMetadata(null);
    setConversionResult(null);
    setErrorMsg(null);
    if (onClearInitialFile) onClearInitialFile();
  }, [onClearInitialFile]);

  const handleConvert = useCallback(async () => {
    if (!file || !metadata) return;
    setIsConverting(true);
    setErrorMsg(null);

    try {
      const res = await convertVector(metadata, file.name, {
        ...options,
        format: targetFormat,
      });
      setConversionResult(res);
      setIsConverting(false);
    } catch (err) {
      console.error("Conversion error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Vector conversion failed");
      setIsConverting(false);
    }
  }, [file, metadata, targetFormat, options]);

  const hasFile = !!file;
  const targetMeta = VECTOR_FORMATS[targetFormat];
  const outputName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}.${targetMeta?.extension || "eps"}`
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
        <VectorDropzone onFileSelect={handleFileSelect} />
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
            <VectorHeader metadata={metadata} onRemove={handleRemove} />

            {/* Format Selector */}
            <VectorFormatSelector
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
            <VectorOptionsPanel
              targetFormat={targetFormat}
              options={options}
              metadata={metadata}
              onOptionsChange={setOptions}
            />

            {/* Action Bar */}
            <VectorActionBar
              targetFormat={targetFormat}
              exactProbedSize={exactProbedSize}
              sizeDiffPercent={sizeDiffPercent}
              isProbing={isProbing}
              isConverting={isConverting}
              resultUrl={conversionResult?.url || null}
              resultBlob={conversionResult?.blob || null}
              outputName={outputName}
              onConvert={handleConvert}
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
