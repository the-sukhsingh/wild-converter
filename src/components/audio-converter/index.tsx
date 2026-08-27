"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  type AudioFormat,
  AUDIO_FORMATS,
  detectAudioFormat,
} from "@/lib/audio-format-utils";
import {
  parseAudioFile,
  convertAudio,
  type AudioConversionOptions,
  type AudioMetadata,
  type AudioConversionResult,
} from "@/lib/audio-converter";
import { AudioDropzone } from "./audio-dropzone";
import { AudioHeader } from "./audio-header";
import { AudioFormatSelector } from "./audio-format-selector";
import { AudioOptionsPanel } from "./audio-options";
import { AudioActionBar } from "./audio-action-bar";
import { BatchTable } from "@/components/batch-converter/batch-table";

interface OnConversionCompletePayload {
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

interface AudioConverterProps {
  initialFile?: File | null;
  initialFiles?: File[];
  onClearInitialFile?: () => void;
  onConversionComplete?: (payload: OnConversionCompletePayload) => void;
}

export function AudioConverter({
  initialFile,
  initialFiles,
  onClearInitialFile,
  onConversionComplete,
}: AudioConverterProps = {}) {
  const [batchFiles, setBatchFiles] = useState<File[]>(
    initialFiles && initialFiles.length > 1 ? initialFiles : []
  );

  const [file, setFile] = useState<File | null>(
    initialFiles && initialFiles.length === 1 ? initialFiles[0] : initialFile || null
  );
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
  const [targetFormat, setTargetFormat] = useState<AudioFormat>("mp3");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<AudioConversionOptions>({
    format: "mp3",
    bitrate: 256,
    sampleRate: 44100,
    channels: 2,
    normalize: false,
    bitDepth: 16,
  });

  const [exactProbedSize, setExactProbedSize] = useState<number | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatusText, setConversionStatusText] = useState("");
  const [conversionResult, setConversionResult] = useState<AudioConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isCancelledRef = useRef(false);

  const handleFileSelect = useCallback(async (f: File) => {
    setBatchFiles([]);
    setFile(f);
    setErrorMsg(null);
    setConversionResult(null);
    try {
      const { buffer, metadata: meta } = await parseAudioFile(f);
      setAudioBuffer(buffer);
      setMetadata(meta);

      const defaultFmt: AudioFormat = meta.format === "mp3" ? "wav" : "mp3";
      setTargetFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
        sampleRate: buffer.sampleRate,
        channels: Math.min(buffer.numberOfChannels, 2) as 1 | 2,
      }));
    } catch (err) {
      console.error("Audio parse error:", err);
      setFile(null);
      setAudioBuffer(null);
      setMetadata(null);
      setErrorMsg(err instanceof Error ? err.message : "Failed to decode audio file");
    }
  }, []);

  const handleFilesSelect = useCallback((files: File[]) => {
    if (files.length > 1) {
      setBatchFiles(files);
      setFile(null);
    } else if (files.length === 1) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Sync initialFiles / initialFile from props
  useEffect(() => {
    if (initialFiles && initialFiles.length > 1) {
      setBatchFiles(initialFiles);
      setFile(null);
    } else if (initialFiles && initialFiles.length === 1) {
      handleFileSelect(initialFiles[0]);
    } else if (initialFile) {
      handleFileSelect(initialFile);
    }
  }, [initialFile, initialFiles, handleFileSelect]);

  // Live estimated size calculation
  useEffect(() => {
    if (!metadata || !targetFormat) {
      setExactProbedSize(null);
      return;
    }
    const duration = metadata.duration;
    const formatInfo = AUDIO_FORMATS[targetFormat];
    let estBytes = 0;

    if (formatInfo.category === "lossless" || targetFormat === "wav" || targetFormat === "wav-ls") {
      const bytesPerSample = (options.bitDepth || 16) / 8;
      estBytes = Math.round(duration * options.sampleRate * options.channels * bytesPerSample) + 44;
    } else {
      estBytes = Math.round((duration * (options.bitrate * 1000)) / 8);
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
    setBatchFiles([]);
    setAudioBuffer(null);
    setMetadata(null);
    setConversionResult(null);
    setErrorMsg(null);
    if (onClearInitialFile) onClearInitialFile();
  }, [handleCancel, onClearInitialFile]);

  const handleConvert = useCallback(async () => {
    if (!audioBuffer || !file) return;
    isCancelledRef.current = false;
    setIsConverting(true);
    setErrorMsg(null);
    setConversionProgress(10);
    setConversionStatusText("Initializing audio DSP pipeline...");

    try {
      const res = await convertAudio(
        audioBuffer,
        file.name,
        {
          ...options,
          format: targetFormat,
        },
        (progress, text) => {
          if (!isCancelledRef.current) {
            setConversionProgress(progress);
            setConversionStatusText(text);
          }
        }
      );
      if (isCancelledRef.current) return;
      setConversionResult(res);
      setConversionProgress(100);
      setIsConverting(false);
      onConversionComplete?.({
        inputFileName: file.name,
        outputFileName: `${file.name.replace(/\.[^/.]+$/, "")}.${AUDIO_FORMATS[targetFormat]?.extension || "mp3"}`,
        inputSize: file.size,
        outputSize: res.blob.size,
        status: "done",
      });
    } catch (err) {
      if (isCancelledRef.current) return;
      console.error("Conversion error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Audio conversion failed");
      setIsConverting(false);
    }
  }, [audioBuffer, file, targetFormat, options, onConversionComplete]);

  const isReady = Boolean(file && metadata);
  const targetMeta = AUDIO_FORMATS[targetFormat];
  const outputName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}.${targetMeta?.extension || "mp3"}`
    : "";

  const sizeDiffPercent = useMemo(() => {
    if (!exactProbedSize || !file?.size) return null;
    return Math.round(((exactProbedSize - file.size) / file.size) * 100);
  }, [exactProbedSize, file?.size]);

  // If in batch mode
  if (batchFiles.length > 0) {
    return (
      <BatchTable
        initialFiles={batchFiles}
        onClearInitialFiles={handleRemove}
        defaultCategory="audio"
      />
    );
  }

  return (
    <div className="relative flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 overflow-hidden">
      {/* State 1: Dropzone */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-6 flex flex-col justify-center transition-opacity duration-200 ${
          !isReady ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={isReady}
      >
        <AudioDropzone
          onFileSelect={handleFileSelect}
          onFilesSelect={handleFilesSelect}
        />
        {errorMsg && !isReady && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-mono max-w-xl">
            {errorMsg}
          </div>
        )}
      </div>

      {/* State 2: Active Workspace */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-6 flex flex-col justify-between transition-opacity duration-200 ${
          isReady ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isReady}
      >
        {file && metadata && (
          <div className="h-full flex flex-col justify-between gap-4">
            {/* Header */}
            <AudioHeader metadata={metadata} onRemove={handleRemove} />

            {/* Format Selector */}
            <AudioFormatSelector
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
            <AudioOptionsPanel
              targetFormat={targetFormat}
              options={options}
              metadata={metadata}
              onOptionsChange={setOptions}
            />

            {/* Action Bar */}
            <AudioActionBar
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
