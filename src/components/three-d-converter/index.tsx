"use client";

import { useState, useEffect, useCallback } from "react";
import {
  parseThreeDFile,
  convertThreeD,
  type ThreeDConversionOptions,
  type ThreeDConversionResult,
  type ThreeDMetadata,
} from "@/lib/three-d-converter";
import { type ThreeDFormat } from "@/lib/three-d-format-utils";
import { ThreeDDropzone } from "./three-d-dropzone";
import { ThreeDHeader } from "./three-d-header";
import { ThreeDFormatSelector } from "./three-d-format-selector";
import { ThreeDOptions } from "./three-d-options";
import { ThreeDActionBar } from "./three-d-action-bar";

interface ThreeDConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function ThreeDConverter({
  initialFile,
  onClearInitialFile,
}: ThreeDConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ThreeDMetadata | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<ThreeDFormat>("glb");
  const [options, setOptions] = useState<ThreeDConversionOptions>({
    format: "glb",
    binary: true,
    scale: 1,
    upAxis: "Y",
    computeNormals: true,
    centerMesh: false,
  });

  const [isConverting, setIsConverting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<ThreeDConversionResult | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setIsParsing(true);
    setError(null);
    setResult(null);

    try {
      const meta = await parseThreeDFile(selectedFile);
      setFile(selectedFile);
      setMetadata(meta);

      const defaultFmt: ThreeDFormat = selectedFile.name.endsWith(".stl")
        ? "glb"
        : selectedFile.name.endsWith(".glb")
        ? "stl"
        : "glb";
      setSelectedFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
      }));
    } catch (err: unknown) {
      console.error("3D parse error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse 3D file geometry. File format might be corrupted or unsupported."
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

  const handleFormatChange = (fmt: ThreeDFormat) => {
    setSelectedFormat(fmt);
    setOptions((prev) => ({
      ...prev,
      format: fmt,
      binary: fmt.endsWith("-ls") ? true : prev.binary,
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
    setProgressText("Processing 3D vertex buffers & exporting mesh...");
    setError(null);

    try {
      const res = await convertThreeD(metadata, file.name, options);
      setResult(res);
    } catch (err: unknown) {
      console.error("3D conversion failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to convert 3D model. Please adjust options and retry."
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
            <ThreeDDropzone
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
            <ThreeDHeader metadata={metadata} onClear={handleClear} />

            <ThreeDFormatSelector
              selectedFormat={selectedFormat}
              onSelectFormat={handleFormatChange}
              disabled={isConverting}
            />

            <ThreeDOptions
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
        <ThreeDActionBar
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
