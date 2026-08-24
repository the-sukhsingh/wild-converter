"use client";

import { useState, useEffect, useCallback } from "react";
import {
  parseCodeFile,
  convertCode,
  type CodeConversionOptions,
  type CodeConversionResult,
  type CodeMetadata,
} from "@/lib/code-converter";
import { type CodeFormat } from "@/lib/code-format-utils";
import { CodeDropzone } from "./code-dropzone";
import { CodeHeader } from "./code-header";
import { CodeFormatSelector } from "./code-format-selector";
import { CodeOptions } from "./code-options";
import { CodeActionBar } from "./code-action-bar";

interface CodeConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function CodeConverter({
  initialFile,
  onClearInitialFile,
}: CodeConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<CodeMetadata | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<CodeFormat>("ts");
  const [options, setOptions] = useState<CodeConversionOptions>({
    format: "ts",
    indentation: 2,
    minify: false,
    stripComments: false,
    addLineNumbers: false,
  });

  const [isConverting, setIsConverting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<CodeConversionResult | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setIsParsing(true);
    setError(null);
    setResult(null);

    try {
      const meta = await parseCodeFile(selectedFile);
      setFile(selectedFile);
      setMetadata(meta);

      const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";
      const defaultFmt: CodeFormat = ext === "js" ? "ts" : ext === "json" ? "yaml" : ext === "md" ? "html" : "ts";
      setSelectedFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
      }));
    } catch (err: unknown) {
      console.error("Code parse error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to read text source file. File might contain unsupported binary characters."
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

  const handleFormatChange = (fmt: CodeFormat) => {
    setSelectedFormat(fmt);
    setOptions((prev) => ({
      ...prev,
      format: fmt,
      minify: fmt.endsWith("-ls") ? false : prev.minify,
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
    setProgressText("Tokenizing and transpiling syntax tree...");
    setError(null);

    try {
      const res = await convertCode(metadata, file.name, options);
      setResult(res);
    } catch (err: unknown) {
      console.error("Code conversion failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to format code. Please adjust settings and retry."
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
            <CodeDropzone
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
            <CodeHeader metadata={metadata} onClear={handleClear} />

            <CodeFormatSelector
              selectedFormat={selectedFormat}
              onSelectFormat={handleFormatChange}
              disabled={isConverting}
            />

            <CodeOptions
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
        <CodeActionBar
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
