"use client";

import { useState, useEffect, useCallback } from "react";
import * as opentype from "opentype.js";
import {
  parseFontFile,
  convertFont,
  type FontConversionOptions,
  type FontConversionResult,
  type FontMetadata,
} from "@/lib/font-converter";
import { type FontFormat } from "@/lib/font-format-utils";
import { FontDropzone } from "./font-dropzone";
import { FontHeader } from "./font-header";
import { FontFormatSelector } from "./font-format-selector";
import { FontOptions } from "./font-options";
import { FontActionBar } from "./font-action-bar";

interface FontConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function FontConverter({
  initialFile,
  onClearInitialFile,
}: FontConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fontAst, setFontAst] = useState<opentype.Font | null>(null);
  const [metadata, setMetadata] = useState<FontMetadata | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<FontFormat>("woff2");
  const [options, setOptions] = useState<FontConversionOptions>({
    format: "woff2",
    hinting: true,
    generateCssFace: true,
    subsetAsciiOnly: false,
  });

  const [isConverting, setIsConverting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<FontConversionResult | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setIsParsing(true);
    setError(null);
    setResult(null);

    try {
      const { font, metadata: meta } = await parseFontFile(selectedFile);
      setFile(selectedFile);
      setFontAst(font);
      setMetadata(meta);

      const defaultFmt: FontFormat = selectedFile.name.endsWith(".ttf")
        ? "woff2"
        : selectedFile.name.endsWith(".woff2")
        ? "ttf"
        : "woff2";
      setSelectedFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
        customFontFamily: meta.familyName,
      }));
    } catch (err: unknown) {
      console.error("Font parse error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse font file tables. The font file may be corrupted or use unsupported encryption."
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

  const handleFormatChange = (fmt: FontFormat) => {
    setSelectedFormat(fmt);
    setOptions((prev) => ({
      ...prev,
      format: fmt,
    }));
  };

  const handleClear = () => {
    setFile(null);
    setFontAst(null);
    setMetadata(null);
    setResult(null);
    setError(null);
    if (onClearInitialFile) {
      onClearInitialFile();
    }
  };

  const handleConvert = async () => {
    if (!fontAst || !file) return;

    setIsConverting(true);
    setProgressText("Compiling OpenType tables and compressing font stream...");
    setError(null);

    try {
      const res = await convertFont(fontAst, file.name, options);
      setResult(res);
    } catch (err: unknown) {
      console.error("Font conversion failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to convert font file. Please check settings and retry."
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
            <FontDropzone
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
            <FontHeader metadata={metadata} onClear={handleClear} />

            <FontFormatSelector
              selectedFormat={selectedFormat}
              onSelectFormat={handleFormatChange}
              disabled={isConverting}
            />

            <FontOptions
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
        <FontActionBar
          isConverting={isConverting}
          progressText={progressText}
          result={result}
          onConvert={handleConvert}
          onReset={() => setResult(null)}
          disabled={!fontAst}
        />
      )}
    </div>
  );
}
