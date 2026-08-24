"use client";

import { useState, useEffect, useCallback } from "react";
import {
  parseAudioFile,
  convertAudio,
  type AudioConversionOptions,
  type AudioConversionResult,
  type AudioMetadata,
} from "@/lib/audio-converter";
import { AUDIO_FORMATS, type AudioFormat } from "@/lib/audio-format-utils";
import { AudioDropzone } from "./audio-dropzone";
import { AudioHeader } from "./audio-header";
import { AudioFormatSelector } from "./audio-format-selector";
import { AudioOptions } from "./audio-options";
import { AudioActionBar } from "./audio-action-bar";

interface AudioConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function AudioConverter({
  initialFile,
  onClearInitialFile,
}: AudioConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFormat, setSelectedFormat] = useState<AudioFormat>("mp3");
  const [options, setOptions] = useState<AudioConversionOptions>({
    format: "mp3",
    sampleRate: 44100,
    bitrate: 192,
    channels: 2,
    bitDepth: 16,
    normalize: false,
  });

  const [isConverting, setIsConverting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<AudioConversionResult | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setIsParsing(true);
    setError(null);
    setResult(null);

    try {
      const { buffer, metadata: meta } = await parseAudioFile(selectedFile);
      setFile(selectedFile);
      setAudioBuffer(buffer);
      setMetadata(meta);

      // Default target format: if source is mp3 -> wav, else -> mp3
      const defaultFmt: AudioFormat = meta.format === "mp3" ? "wav" : "mp3";
      setSelectedFormat(defaultFmt);
      setOptions((prev) => ({
        ...prev,
        format: defaultFmt,
        sampleRate: buffer.sampleRate >= 48000 ? 48000 : 44100,
        channels: buffer.numberOfChannels === 1 ? 1 : 2,
      }));
    } catch (err: unknown) {
      console.error("Audio parse error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to decode audio file. Format might be corrupted or unsupported."
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

  const handleFormatChange = (fmt: AudioFormat) => {
    setSelectedFormat(fmt);
    const fmtInfo = AUDIO_FORMATS[fmt];
    setOptions((prev) => ({
      ...prev,
      format: fmt,
      bitrate: fmt.endsWith("-ls") ? 320 : prev.bitrate,
      bitDepth: fmtInfo.isLossless || fmt.endsWith("-ls") ? 24 : prev.bitDepth,
    }));
  };

  const handleClear = () => {
    setFile(null);
    setAudioBuffer(null);
    setMetadata(null);
    setResult(null);
    setError(null);
    if (onClearInitialFile) {
      onClearInitialFile();
    }
  };

  const handleConvert = async () => {
    if (!audioBuffer || !file) return;

    setIsConverting(true);
    setProgressText("Applying DSP & audio encoding...");
    setError(null);

    try {
      const res = await convertAudio(audioBuffer, file.name, options);
      setResult(res);
    } catch (err: unknown) {
      console.error("Audio conversion failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to convert audio stream. Please adjust options and retry."
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
            <AudioDropzone
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
            <AudioHeader metadata={metadata} onClear={handleClear} />

            <AudioFormatSelector
              selectedFormat={selectedFormat}
              onSelectFormat={handleFormatChange}
              disabled={isConverting}
            />

            <AudioOptions
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
        <AudioActionBar
          isConverting={isConverting}
          progressText={progressText}
          result={result}
          onConvert={handleConvert}
          onReset={() => setResult(null)}
          disabled={!audioBuffer}
        />
      )}
    </div>
  );
}
