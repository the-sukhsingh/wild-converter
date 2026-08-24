import type { VideoFormat } from "../video-format-utils";

export interface VideoMetadata {
  duration: number; // in seconds
  width: number;
  height: number;
  aspectRatio: string;
  fileSizeBytes: number;
  name: string;
  format: VideoFormat | "unknown";
  hasAudio?: boolean;
}

export type VideoResolutionPreset = "original" | "4k" | "1080p" | "720p" | "480p" | "360p";

export interface VideoConversionOptions {
  format: VideoFormat;
  resolution: VideoResolutionPreset;
  fps: 60 | 30 | 24 | 15 | 10;
  speed: 0.5 | 1 | 1.5 | 2;
  mute: boolean;
  quality: number; // 0.1 to 1.0
  gifLoop: boolean;
  trimStart?: number;
  trimEnd?: number;
}

export interface VideoConversionResult {
  blob: Blob;
  mime: string;
  fileName: string;
  url: string;
  duration: number;
  width: number;
  height: number;
  fileSizeBytes: number;
  isAnimation?: boolean;
  isAudio?: boolean;
}
