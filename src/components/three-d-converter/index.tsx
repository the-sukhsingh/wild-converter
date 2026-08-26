"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  type ThreeDFormat,
  THREE_D_FORMATS,
  detectThreeDFormat,
} from "@/lib/three-d-format-utils";
import {
  parseThreeDFile,
  convertThreeD,
  type ThreeDConversionOptions,
  type ThreeDMetadata,
  type ThreeDConversionResult,
} from "@/lib/three-d-converter";
import { ThreeDDropzone } from "./three-d-dropzone";
import { ThreeDHeader } from "./three-d-header";
import { ThreeDFormatSelector } from "./three-d-format-selector";
import { ThreeDOptionsPanel } from "./three-d-options";
import { ThreeDActionBar } from "./three-d-action-bar";

interface OnConversionCompletePayload {
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

interface ThreeDConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
  onConversionComplete?: (payload: OnConversionCompletePayload) => void;
}

export function ThreeDConverter({
  initialFile,
  onClearInitialFile,
  onConversionComplete,
}: ThreeDConverterProps = {}) {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [metadata, setMetadata] = useState<ThreeDMetadata | null>(null);
  const [targetFormat, setTargetFormat] = useState<ThreeDFormat>("glb");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<ThreeDConversionOptions>({
    format: "glb",
    scale: 1,
    upAxis: "Y",
    binary: true,
    computeNormals: false,
    centerMesh: false,
  });

  const [exactProbedSize, setExactProbedSize] = useState<number | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatusText, setConversionStatusText] = useState("");
  const [conversionResult, setConversionResult] = useState<ThreeDConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isCancelledRef = useRef(false);

  const handleFileSelect = useCallback(async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setConversionResult(null);
    try {
      const meta = await parseThreeDFile(f);
      setMetadata(meta);

      const defaultFmt: ThreeDFormat = meta.format === "glb" ? "obj" : "glb";
      setTargetFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
      }));
    } catch (err) {
      console.error("3D parse error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse 3D geometry");
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
    const faceCount = metadata.faceCount;
    let estBytes = 0;

    if (targetFormat === "stl") {
      estBytes = options.binary ? 84 + faceCount * 50 : faceCount * 250;
    } else if (targetFormat === "obj") {
      estBytes = Math.round(faceCount * 120);
    } else if (targetFormat === "glb") {
      estBytes = Math.round(faceCount * 36 + 1024);
    } else if (targetFormat === "gltf") {
      estBytes = Math.round(faceCount * 80 + 2048);
    } else {
      estBytes = Math.round(faceCount * 40);
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
    if (!file || !metadata) return;
    isCancelledRef.current = false;
    setIsConverting(true);
    setErrorMsg(null);
    setConversionProgress(25);
    setConversionStatusText("Compiling 3D vertex & normal buffers...");

    try {
      setConversionProgress(65);
      setConversionStatusText(`Serializing ${targetFormat.toUpperCase()} geometry format...`);
      const res = await convertThreeD(metadata, file.name, {
        ...options,
        format: targetFormat,
      });
      if (isCancelledRef.current) return;
      setConversionResult(res);
      setConversionProgress(100);
      setIsConverting(false);
      onConversionComplete?.({
        inputFileName: file.name,
        outputFileName: `${file.name.replace(/\.[^/.]+$/, "")}.${THREE_D_FORMATS[targetFormat]?.extension || "glb"}`,
        inputSize: file.size,
        outputSize: res.blob.size,
        status: "done",
      });
    } catch (err) {
      if (isCancelledRef.current) return;
      console.error("Conversion error:", err);
      setErrorMsg(err instanceof Error ? err.message : "3D mesh conversion failed");
      setIsConverting(false);
    }
  }, [file, metadata, targetFormat, options, onConversionComplete]);

  const hasFile = !!file;
  const targetMeta = THREE_D_FORMATS[targetFormat];
  const outputName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}.${targetMeta?.extension || "glb"}`
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
        <ThreeDDropzone onFileSelect={handleFileSelect} />
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
            <ThreeDHeader metadata={metadata} onRemove={handleRemove} />

            {/* Format Selector */}
            <ThreeDFormatSelector
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
            <ThreeDOptionsPanel
              targetFormat={targetFormat}
              options={options}
              metadata={metadata}
              onOptionsChange={setOptions}
            />

            {/* Action Bar */}
            <ThreeDActionBar
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
