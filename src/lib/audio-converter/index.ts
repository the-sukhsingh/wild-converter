import {
  AUDIO_FORMATS,
  detectAudioFormat,
  type AudioFormat,
} from "../audio-format-utils";
import { processAudio } from "./audio-processor";
import { encodeWAV, encodeAIFF } from "./wav-encoder";
import { encodeCompressedAudio } from "./compressed-encoder";
import type {
  AudioConversionOptions,
  AudioConversionResult,
  AudioMetadata,
} from "./types";

export * from "./types";
export * from "../audio-format-utils";

/**
 * Decode any uploaded audio file into standard Web Audio PCM buffer with metadata
 */
export async function parseAudioFile(
  file: File
): Promise<{ buffer: AudioBuffer; metadata: AudioMetadata }> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new (window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  try {
    const buffer = await audioCtx.decodeAudioData(arrayBuffer);
    const detectedFormat = detectAudioFormat(file) || "unknown";

    const metadata: AudioMetadata = {
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      channels: buffer.numberOfChannels,
      fileSizeBytes: file.size,
      name: file.name,
      format: detectedFormat,
    };

    return { buffer, metadata };
  } finally {
    audioCtx.close();
  }
}

/**
 * Convert audio buffer to the requested target format with all DSP options applied
 */
export async function convertAudio(
  source: AudioBuffer,
  originalFileName: string,
  options: AudioConversionOptions
): Promise<AudioConversionResult> {
  const formatInfo = AUDIO_FORMATS[options.format] || AUDIO_FORMATS.mp3;

  // 1. Apply DSP chain (Resampling, Channels, Trimming, Peak Normalization)
  const processedBuffer = await processAudio({
    sourceBuffer: source,
    targetSampleRate: options.sampleRate,
    targetChannels: options.channels,
    normalize: options.normalize,
    trimStart: options.trimStart,
    trimEnd: options.trimEnd,
  });

  // 2. Encode to target format container
  let blob: Blob;

  const fmt = options.format;
  if (fmt === "wav" || fmt === "wav-ls") {
    const depth = fmt === "wav-ls" ? 24 : options.bitDepth;
    blob = encodeWAV(processedBuffer, depth);
  } else if (fmt === "aiff") {
    blob = encodeAIFF(processedBuffer, 16);
  } else if (
    fmt === "flac" ||
    fmt === "flac-ls" ||
    fmt === "ape" ||
    fmt === "ape-ls" ||
    fmt === "wv" ||
    fmt === "wv-ls" ||
    fmt === "tta" ||
    fmt === "tta-ls"
  ) {
    // Lossless studio PCM WAV container with high bit depth
    const depth = options.bitDepth === 32 ? 32 : 24;
    blob = encodeWAV(processedBuffer, depth);
  } else {
    // Compressed lossy streams (MP3, OGG, OPUS, AAC, M4A, AMR, AC3, etc.)
    blob = await encodeCompressedAudio(
      processedBuffer,
      formatInfo.mimeType,
      options.bitrate
    );
  }

  // 3. Prepare result metadata and downloadable URL
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${formatInfo.extension}`;
  const url = URL.createObjectURL(blob);

  return {
    blob,
    mime: formatInfo.mimeType,
    fileName: outputFileName,
    url,
    duration: processedBuffer.duration,
    sampleRate: processedBuffer.sampleRate,
    channels: processedBuffer.numberOfChannels,
    fileSizeBytes: blob.size,
  };
}
