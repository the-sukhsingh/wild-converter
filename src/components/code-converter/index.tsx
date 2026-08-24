"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  type CodeFormat,
  CODE_FORMATS,
  detectCodeFormat,
} from "@/lib/code-format-utils";
import {
  parseCodeFile,
  convertCode,
  type CodeConversionOptions,
  type CodeMetadata,
  type CodeConversionResult,
} from "@/lib/code-converter";
import { CodeDropzone } from "./code-dropzone";
import { CodeHeader } from "./code-header";
import { CodeFormatSelector } from "./code-format-selector";
import { CodeOptionsPanel } from "./code-options";
import { CodeActionBar } from "./code-action-bar";

interface CodeConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function CodeConverter({
  initialFile,
  onClearInitialFile,
}: CodeConverterProps = {}) {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [metadata, setMetadata] = useState<CodeMetadata | null>(null);
  const [targetFormat, setTargetFormat] = useState<CodeFormat>("ts");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<CodeConversionOptions>({
    format: "ts",
    indentation: 2,
    minify: false,
    stripComments: false,
    addLineNumbers: false,
  });

  const [exactProbedSize, setExactProbedSize] = useState<number | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<CodeConversionResult | null>(null);
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
      const meta = await parseCodeFile(f);
      setMetadata(meta);

      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      const defaultFmt: CodeFormat =
        ext === "js" ? "ts" : ext === "json" ? "yaml" : ext === "md" ? "html" : "ts";
      setTargetFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
      }));
    } catch (err) {
      console.error("Code parse error:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Failed to read source code text. Binary or unsupported encoding detected."
      );
    }
  }, []);

  // Live estimated size calculation
  useEffect(() => {
    if (!metadata || !targetFormat) {
      setExactProbedSize(null);
      return;
    }
    const rawLen = metadata.charCount;
    let estBytes = rawLen;

    if (options.minify) {
      estBytes = Math.round(rawLen * 0.65);
    } else if (options.stripComments) {
      estBytes = Math.round(rawLen * 0.85);
    } else if (options.addLineNumbers) {
      estBytes = Math.round(rawLen + metadata.lineCount * 6);
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
    if (!metadata || !file) return;
    setIsConverting(true);
    setErrorMsg(null);

    try {
      const res = await convertCode(metadata, file.name, {
        ...options,
        format: targetFormat,
      });
      setConversionResult(res);
      setIsConverting(false);
    } catch (err) {
      console.error("Conversion error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Code conversion failed");
      setIsConverting(false);
    }
  }, [metadata, file, targetFormat, options]);

  const hasFile = !!file;
  const targetMeta = CODE_FORMATS[targetFormat];
  const outputName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}.${targetMeta?.extension || "ts"}`
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
        <CodeDropzone onFileSelect={handleFileSelect} />
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
            <CodeHeader metadata={metadata} onRemove={handleRemove} />

            {/* Format Selector */}
            <CodeFormatSelector
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
            <CodeOptionsPanel
              targetFormat={targetFormat}
              options={options}
              metadata={metadata}
              onOptionsChange={setOptions}
            />

            {/* Action Bar */}
            <CodeActionBar
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
