"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type ImageFormat,
  detectFormat,
  buildOutputName,
  estimateOutputSize,
} from "@/lib/format-utils";
import { convertImage, type ConversionOptions } from "@/lib/image-converter";
import { UploadDropzone } from "./upload-dropzone";
import { FileHeader } from "./file-header";
import { FormatSelector } from "./format-selector";
import { ConversionOptionsPanel } from "./conversion-options";
import { ActionBar } from "./action-bar";

type ConvertState = "idle" | "converting" | "done" | "error";

export function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [inputFormat, setInputFormat] = useState<ImageFormat | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("webp");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<ConversionOptions>({
    quality: 0.85,
    width: 0,
    height: 0,
    lockAspect: true,
  });

  const [imageDimensions, setImageDimensions] = useState<{ w: number; h: number } | null>(null);
  const [exactProbedSize, setExactProbedSize] = useState<number | null>(null);
  const [probedBlob, setProbedBlob] = useState<Blob | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [state, setState] = useState<ConvertState>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Read dimensions when file changes
  useEffect(() => {
    if (!file) {
      setImageDimensions(null);
      return;
    }
    let active = true;
    createImageBitmap(file)
      .then((bmp) => {
        if (active) setImageDimensions({ w: bmp.width, h: bmp.height });
        bmp.close();
      })
      .catch(() => {
        if (active) setImageDimensions({ w: 1920, h: 1080 });
      });
    return () => {
      active = false;
    };
  }, [file]);

  // Live exact size background probe (debounced 40ms)
  useEffect(() => {
    if (!file || !targetFormat) {
      setExactProbedSize(null);
      setProbedBlob(null);
      return;
    }

    if (imageDimensions) {
      const synEst = estimateOutputSize(imageDimensions.w, imageDimensions.h, targetFormat, options);
      setExactProbedSize(synEst);
    }

    let active = true;
    setIsProbing(true);
    const timer = setTimeout(async () => {
      try {
        const blob = await convertImage(file, targetFormat, options);
        if (active) {
          setExactProbedSize(blob.size);
          setProbedBlob(blob);
          setIsProbing(false);
        }
      } catch {
        if (active) setIsProbing(false);
      }
    }, 40);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [file, targetFormat, options, imageDimensions]);

  // Reset conversion state when parameters change
  useEffect(() => {
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setState("idle");
    setErrorMsg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, targetFormat, options.quality, options.width, options.height, options.lockAspect]);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    const detected = detectFormat(f);
    setInputFormat(detected);
    setTargetFormat(detected === "webp" ? "png" : "webp");
    setSearchQuery("");
  }, []);

  const handleRemove = useCallback(() => {
    setFile(null);
    setInputFormat(null);
    setImageDimensions(null);
    setExactProbedSize(null);
    setProbedBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResultBlob(null);
    setState("idle");
  }, [resultUrl]);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setState("converting");
    setErrorMsg(null);
    try {
      let blob = probedBlob;
      if (!blob) {
        blob = await convertImage(file, targetFormat, options);
      }
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      setState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Conversion failed");
      setState("error");
    }
  }, [file, targetFormat, options, probedBlob]);

  const hasFile = !!file;
  const outputName = file ? buildOutputName(file.name, targetFormat) : "";

  const sizeDiffPercent = useMemo(() => {
    if (!exactProbedSize || !file?.size) return null;
    return Math.round(((exactProbedSize - file.size) / file.size) * 100);
  }, [exactProbedSize, file?.size]);

  return (
    <div className="relative flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 overflow-hidden">
      {/* State 1: Upload / Dropzone */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-6 flex flex-col justify-center transition-opacity duration-200 ${
          !hasFile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={hasFile}
      >
        <UploadDropzone onFileSelect={handleFileSelect} />
      </div>

      {/* State 2: Active Workspace */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-6 flex flex-col justify-between transition-opacity duration-200 ${
          hasFile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!hasFile}
        id="main-content"
      >
        {file && (
          <div className="h-full flex flex-col justify-between gap-4 overflow-hidden">
            {/* File Info Header */}
            <FileHeader
              file={file}
              inputFormat={inputFormat}
              dimensions={imageDimensions}
              onRemove={handleRemove}
            />

            {/* Searchable Format Selector */}
            <FormatSelector
              selectedFormat={targetFormat}
              inputFormat={inputFormat}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectFormat={(fmt) => {
                setTargetFormat(fmt);
                setSearchQuery("");
              }}
            />

            {/* Options Panel */}
            <ConversionOptionsPanel
              targetFormat={targetFormat}
              options={options}
              dimensions={imageDimensions}
              onOptionsChange={setOptions}
            />

            {/* Action Bar (Live Stats + Convert / Download) */}
            <ActionBar
              targetFormat={targetFormat}
              exactProbedSize={exactProbedSize}
              sizeDiffPercent={sizeDiffPercent}
              isProbing={isProbing}
              isConverting={state === "converting"}
              resultUrl={resultUrl}
              resultBlob={resultBlob}
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
