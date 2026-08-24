"use client";

import { useState, useEffect, useCallback } from "react";
import {
  parseVideoFile,
  convertVideo,
  type VideoConversionOptions,
  type VideoConversionResult,
  type VideoMetadata,
} from "@/lib/video-converter";
import { type VideoFormat } from "@/lib/video-format-utils";
import { VideoDropzone } from "./video-dropzone";
import { VideoHeader } from "./video-header";
import { VideoFormatSelector } from "./video-format-selector";
import { VideoOptions } from "./video-options";
import { VideoActionBar } from "./video-action-bar";

interface VideoConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function VideoConverter({
  initialFile,
  onClearInitialFile,
}: VideoConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<VideoFormat>("mp4");
  const [options, setOptions] = useState<VideoConversionOptions>({
    format: "mp4",
    resolution: "original",
    fps: 30,
    speed: 1,
    mute: false,
    quality: 0.85,
    gifLoop: true,
  });

  const [isConverting, setIsConverting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<VideoConversionResult | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setIsParsing(true);
    setError(null);
    setResult(null);

    try {
      const { videoElement: elem, metadata: meta } = await parseVideoFile(selectedFile);
      setFile(selectedFile);
      setVideoElement(elem);
      setMetadata(meta);

      const defaultFmt: VideoFormat = selectedFile.name.endsWith(".gif") ? "mp4" : "webm";
      setSelectedFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
      }));
    } catch (err: unknown) {
      console.error("Video parse error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to decode video container. Video might use an unsupported browser codec."
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

  const handleFormatChange = (fmt: VideoFormat) => {
    setSelectedFormat(fmt);
    setOptions((prev) => ({
      ...prev,
      format: fmt,
      fps: fmt === "gif" ? 15 : 30,
    }));
  };

  const handleClear = () => {
    setFile(null);
    setVideoElement(null);
    setMetadata(null);
    setResult(null);
    setError(null);
    if (onClearInitialFile) {
      onClearInitialFile();
    }
  };

  const handleConvert = async () => {
    if (!videoElement || !file) return;

    setIsConverting(true);
    setProgressText("Initializing video transcoding pipeline...");
    setError(null);

    try {
      const res = await convertVideo(
        videoElement,
        file.name,
        options,
        (progress) => setProgressText(progress)
      );
      setResult(res);
    } catch (err: unknown) {
      console.error("Video conversion failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to convert video file. Please adjust options and try again."
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
            <VideoDropzone
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
            <VideoHeader metadata={metadata} onClear={handleClear} />

            <VideoFormatSelector
              selectedFormat={selectedFormat}
              onSelectFormat={handleFormatChange}
              disabled={isConverting}
            />

            <VideoOptions
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
        <VideoActionBar
          isConverting={isConverting}
          progressText={progressText}
          result={result}
          onConvert={handleConvert}
          onReset={() => setResult(null)}
          disabled={!videoElement}
        />
      )}
    </div>
  );
}
