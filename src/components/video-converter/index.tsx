"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  type VideoFormat,
  VIDEO_FORMATS,
  detectVideoFormat,
} from "@/lib/video-format-utils";
import {
  parseVideoFile,
  convertVideo,
  type VideoConversionOptions,
  type VideoMetadata,
  type VideoConversionResult,
} from "@/lib/video-converter";
import { VideoDropzone } from "./video-dropzone";
import { VideoHeader } from "./video-header";
import { VideoFormatSelector } from "./video-format-selector";
import { VideoOptionsPanel } from "./video-options";
import { VideoActionBar } from "./video-action-bar";
import { ConversionErrorBanner } from "@/components/conversion-error-banner";

interface OnConversionCompletePayload {
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

interface VideoConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
  onConversionComplete?: (payload: OnConversionCompletePayload) => void;
}

export function VideoConverter({
  initialFile,
  onClearInitialFile,
  onConversionComplete,
}: VideoConverterProps = {}) {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [targetFormat, setTargetFormat] = useState<VideoFormat>("mp4");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<VideoConversionOptions>({
    format: "mp4",
    resolution: "original",
    fps: 30,
    speed: 1,
    mute: false,
    quality: 0.85,
    gifLoop: true,
  });

  const [exactProbedSize, setExactProbedSize] = useState<number | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatusText, setConversionStatusText] = useState("");
  const [conversionResult, setConversionResult] = useState<VideoConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = useCallback(async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setConversionResult(null);
    try {
      const { videoElement: el, metadata: meta } = await parseVideoFile(f);
      setVideoElement(el);
      setMetadata(meta);

      const defaultFmt: VideoFormat = meta.format === "mp4" ? "webm" : "mp4";
      setTargetFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
        fps: 30,
      }));
    } catch (err) {
      console.error("Video parse error:", err);
      setFile(null);
      setVideoElement(null);
      setMetadata(null);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load video file");
    }
  }, []);

  // Sync initialFile
  useEffect(() => {
    if (initialFile) {
      if (initialFile !== file) {
        handleFileSelect(initialFile);
      }
    } else if (file) {
      setFile(null);
      setVideoElement(null);
      setMetadata(null);
      setConversionResult(null);
      setErrorMsg(null);
    }
  }, [initialFile, file, handleFileSelect]);

  // Live estimated size calculation
  useEffect(() => {
    if (!metadata || !targetFormat) {
      setExactProbedSize(null);
      return;
    }
    const duration = metadata.duration;
    const formatInfo = VIDEO_FORMATS[targetFormat];
    let estBytes = 0;

    if (formatInfo.category === "audio-extract") {
      estBytes = Math.round((duration * 192 * 1000) / 8);
    } else if (targetFormat === "gif") {
      const scale = options.resolution === "360p" ? 0.3 : options.resolution === "480p" ? 0.5 : 0.7;
      const w = metadata.width * scale;
      const h = metadata.height * scale;
      const totalFrames = duration * options.fps;
      estBytes = Math.round(w * h * 0.4 * Math.min(totalFrames, 120));
    } else {
      let targetBitrate = 2500; // 2.5 Mbps default
      if (options.resolution === "1080p") targetBitrate = 4500;
      if (options.resolution === "720p") targetBitrate = 2500;
      if (options.resolution === "480p") targetBitrate = 1200;
      if (options.resolution === "360p") targetBitrate = 700;
      estBytes = Math.round((duration * targetBitrate * 1000) / 8);
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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConverting(false);
    setConversionProgress(0);
    setConversionStatusText("");
  }, []);

  const handleRemove = useCallback(() => {
    handleCancel();
    setFile(null);
    setVideoElement(null);
    setMetadata(null);
    setConversionResult(null);
    setErrorMsg(null);
    if (onClearInitialFile) onClearInitialFile();
  }, [handleCancel, onClearInitialFile]);

  const handleConvert = useCallback(async () => {
    if (!videoElement || !file) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsConverting(true);
    setErrorMsg(null);
    setConversionProgress(5);
    setConversionStatusText("Starting video transcode pipeline...");

    try {
      const res = await convertVideo(
        videoElement,
        file.name,
        {
          ...options,
          format: targetFormat,
        },
        (progress, text) => {
          setConversionProgress(progress);
          setConversionStatusText(text);
        },
        controller.signal,
        file
      );
      setConversionResult(res);
      setConversionProgress(100);
      setIsConverting(false);
      onConversionComplete?.({
        inputFileName: file.name,
        outputFileName: `${file.name.replace(/\.[^/.]+$/, "")}.${VIDEO_FORMATS[targetFormat]?.extension || "mp4"}`,
        inputSize: file.size,
        outputSize: res.blob.size,
        status: "done",
      });
    } catch (err) {
      if (controller.signal.aborted) {
        setIsConverting(false);
        setConversionProgress(0);
        setConversionStatusText("");
        return;
      }
      console.error("Conversion error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Video conversion failed");
      setIsConverting(false);
    }
  }, [videoElement, file, targetFormat, options, onConversionComplete]);

  const isReady = Boolean(file && metadata);
  const targetMeta = VIDEO_FORMATS[targetFormat];
  const outputName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}.${targetMeta?.extension || "mp4"}`
    : "";

  const sizeDiffPercent = useMemo(() => {
    if (!exactProbedSize || !file?.size) return null;
    return Math.round(((exactProbedSize - file.size) / file.size) * 100);
  }, [exactProbedSize, file?.size]);

  return (
    <div className="relative flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 overflow-hidden">
      {/* State 1: Dropzone */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-4 sm:py-6 overflow-y-auto flex flex-col justify-center transition-opacity duration-200 ${
          !isReady ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={isReady}
      >
        <VideoDropzone onFileSelect={handleFileSelect} />
        {errorMsg && !isReady && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-mono max-w-xl">
            {errorMsg}
          </div>
        )}
      </div>

      {/* State 2: Active Workspace */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-4 sm:py-6 overflow-y-auto min-h-0 transition-opacity duration-200 ${
          isReady ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isReady}
      >
        {file && metadata && (
          <div className="min-h-full flex flex-col justify-between gap-3 sm:gap-4">
            {/* Header */}
            <VideoHeader metadata={metadata} onRemove={handleRemove} />

            {/* Format Selector */}
            <VideoFormatSelector
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
            <VideoOptionsPanel
              targetFormat={targetFormat}
              options={options}
              metadata={metadata}
              onOptionsChange={setOptions}
            />

            {/* Action Bar */}
            <VideoActionBar
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
              <ConversionErrorBanner
                errorMsg={errorMsg}
                category="video"
                sourceFormat={file?.name.split(".").pop() || "video"}
                targetFormat={targetFormat}
                fileName={file?.name}
                fileSize={file?.size}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
