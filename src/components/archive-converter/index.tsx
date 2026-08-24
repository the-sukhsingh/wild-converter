"use client";

import { useState, useEffect, useCallback } from "react";
import {
  parseArchiveFile,
  convertArchive,
  type ArchiveConversionOptions,
  type ArchiveConversionResult,
  type ArchiveMetadata,
} from "@/lib/archive-converter";
import { type ArchiveFormat } from "@/lib/archive-format-utils";
import { ArchiveDropzone } from "./archive-dropzone";
import { ArchiveHeader } from "./archive-header";
import { ArchiveFileTree } from "./archive-file-tree";
import { ArchiveFormatSelector } from "./archive-format-selector";
import { ArchiveOptions } from "./archive-options";
import { ArchiveActionBar } from "./archive-action-bar";

interface ArchiveConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function ArchiveConverter({
  initialFile,
  onClearInitialFile,
}: ArchiveConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<ArchiveFormat>("tgz");
  const [options, setOptions] = useState<ArchiveConversionOptions>({
    format: "tgz",
    compressionLevel: 6,
    stripRootFolder: false,
  });

  const [isConverting, setIsConverting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<ArchiveConversionResult | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setIsParsing(true);
    setError(null);
    setResult(null);

    try {
      const meta = await parseArchiveFile(selectedFile);
      setFile(selectedFile);
      setMetadata(meta);

      const defaultFmt: ArchiveFormat = selectedFile.name.endsWith(".zip")
        ? "tgz"
        : selectedFile.name.endsWith(".tar.gz") || selectedFile.name.endsWith(".tgz")
        ? "zip"
        : "zip";
      setSelectedFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
      }));
    } catch (err: unknown) {
      console.error("Archive parse error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to inspect archive container. Archive might be password protected or corrupted."
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

  const handleFormatChange = (fmt: ArchiveFormat) => {
    setSelectedFormat(fmt);
    setOptions((prev) => ({
      ...prev,
      format: fmt,
      compressionLevel: fmt.endsWith("-ls") ? 9 : prev.compressionLevel,
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
    setProgressText("Compressing files and rebuilding archive index...");
    setError(null);

    try {
      const res = await convertArchive(metadata, file.name, options);
      setResult(res);
    } catch (err: unknown) {
      console.error("Archive conversion failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to convert archive container. Please adjust settings and retry."
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
            <ArchiveDropzone
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
            <ArchiveHeader metadata={metadata} onClear={handleClear} />

            <ArchiveFileTree entries={metadata.entries} />

            <ArchiveFormatSelector
              selectedFormat={selectedFormat}
              onSelectFormat={handleFormatChange}
              disabled={isConverting}
            />

            <ArchiveOptions
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
        <ArchiveActionBar
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
