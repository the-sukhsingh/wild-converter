"use client";

import { useState, useEffect, useCallback } from "react";
import {
  parseVectorFile,
  convertVector,
  type VectorConversionOptions,
  type VectorConversionResult,
  type VectorMetadata,
} from "@/lib/vector-converter";
import { type VectorFormat } from "@/lib/vector-format-utils";
import { VectorDropzone } from "./vector-dropzone";
import { VectorHeader } from "./vector-header";
import { VectorFormatSelector } from "./vector-format-selector";
import { VectorOptions } from "./vector-options";
import { VectorActionBar } from "./vector-action-bar";

interface VectorConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function VectorConverter({
  initialFile,
  onClearInitialFile,
}: VectorConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VectorMetadata | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<VectorFormat>("eps");
  const [options, setOptions] = useState<VectorConversionOptions>({
    format: "eps",
    scale: 1,
    dpi: 300,
    background: "transparent",
    strokePrecision: 3,
    optimizeSvg: false,
    dxfVersion: "R2000",
  });

  const [isConverting, setIsConverting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<VectorConversionResult | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setIsParsing(true);
    setError(null);
    setResult(null);

    try {
      const meta = await parseVectorFile(selectedFile);
      setFile(selectedFile);
      setMetadata(meta);

      const defaultFmt: VectorFormat = selectedFile.name.endsWith(".svg") ? "eps" : "svg";
      setSelectedFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
      }));
    } catch (err: unknown) {
      console.error("Vector parse error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse vector graphic. File may contain malformed XML or binary data."
      );
    } finally {
      setIsParsing(false);
    }
  }, []);

  useEffect(() => {
    if (initialFile) {
      handleFileSelect(initialFile);
    }
  }, [initialFile, handleFileSelect]);

  const handleFormatChange = (fmt: VectorFormat) => {
    setSelectedFormat(fmt);
    setOptions((prev) => ({
      ...prev,
      format: fmt,
      dpi: fmt === "eps-ls" ? 300 : prev.dpi,
    }));
  };

  const handleClear = () => {
    setFile(null);
    setMetadata(null);
    setResult(null);
    setError(null);
    if (onClearInitialFile) {
      onClearInitialFile();
    }
  };

  const handleConvert = async () => {
    if (!metadata || !file) return;

    setIsConverting(true);
    setProgressText("Compiling vector paths & structures...");
    setError(null);

    try {
      const res = await convertVector(metadata, file.name, options);
      setResult(res);
    } catch (err: unknown) {
      console.error("Vector conversion failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to convert vector file. Please adjust options and retry."
      );
    } finally {
      setIsConverting(false);
      setProgressText("");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-4 flex-1 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        {!file || !metadata ? (
          <div className="space-y-4 py-8">
            <VectorDropzone
              onFileSelect={handleFileSelect}
              isProcessing={isParsing}
            />
            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <VectorHeader metadata={metadata} onClear={handleClear} />

            <VectorFormatSelector
              selectedFormat={selectedFormat}
              onSelectFormat={handleFormatChange}
              disabled={isConverting}
            />

            <VectorOptions
              options={options}
              metadata={metadata}
              onChange={setOptions}
              disabled={isConverting}
            />

            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {file && metadata && (
        <VectorActionBar
          isConverting={isConverting}
          progressText={progressText}
          result={result}
          onConvert={handleConvert}
          onReset={() => setResult(null)}
          disabled={!metadata}
        />
      )}
    </div>
  );
}
