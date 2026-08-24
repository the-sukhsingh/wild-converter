import type { AudioFormat } from "../audio-format-utils";

export interface AudioMetadata {
  duration: number; // in seconds
  sampleRate: number; // in Hz
  channels: number;
  bitDepth?: number;
  fileSizeBytes: number;
  name: string;
  format: AudioFormat | "unknown";
}

export interface AudioConversionOptions {
  format: AudioFormat;
  sampleRate: number; // e.g. 44100, 48000, 96000, 22050, 16000, 8000
  bitrate: number; // e.g. 320, 256, 192, 128, 96, 64 kbps
  channels: 1 | 2; // 1 = Mono, 2 = Stereo
  bitDepth: 16 | 24 | 32; // 16-bit, 24-bit, 32-bit Float
  normalize: boolean; // Peak volume normalization
  trimStart?: number; // In seconds
  trimEnd?: number; // In seconds
}

export interface AudioConversionResult {
  blob: Blob;
  mime: string;
  fileName: string;
  url: string;
  duration: number;
  sampleRate: number;
  channels: number;
  fileSizeBytes: number;
}
