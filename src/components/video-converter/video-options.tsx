"use client";

import { Sliders, VolumeX, Repeat, Sparkles } from "lucide-react";
import { VIDEO_FORMATS } from "@/lib/video-format-utils";
import type { VideoConversionOptions, VideoMetadata, VideoResolutionPreset } from "@/lib/video-converter";

interface VideoOptionsProps {
  options: VideoConversionOptions;
  metadata: VideoMetadata;
  onChange: (options: VideoConversionOptions) => void;
  disabled?: boolean;
}

export function VideoOptions({
  options,
  metadata,
  onChange,
  disabled = false,
}: VideoOptionsProps) {
  const formatInfo = VIDEO_FORMATS[options.format] || VIDEO_FORMATS.mp4;
  const isGif = options.format === "gif";
  const isAudioExtract = formatInfo.category === "audio-extract";

  if (isAudioExtract) {
    return (
      <div className="p-4 rounded bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs font-mono text-[var(--muted-foreground)] space-y-1">
        <p className="font-medium text-[var(--foreground)]">Direct Audio Soundtrack Demuxing</p>
        <p>Will extract uncompressed master soundtrack at native audio sampling frequency.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Resolution, Framerate & Encoding
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Target Resolution */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>Resolution</span>
            <span className="text-[var(--foreground)] font-medium uppercase">
              {options.resolution}
            </span>
          </label>
          <select
            value={options.resolution}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...options,
                resolution: e.target.value as VideoResolutionPreset,
              })
            }
            className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
          >
            <option value="original">Original ({metadata.width}×{metadata.height})</option>
            <option value="4k">4K Ultra HD (3840×2160)</option>
            <option value="1080p">1080p Full HD (1920×1080)</option>
            <option value="720p">720p HD (1280×720)</option>
            <option value="480p">480p SD (854×480)</option>
            <option value="360p">360p Compact (640×360)</option>
          </select>
        </div>

        {/* Framerate (FPS) */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>Framerate</span>
            <span className="text-[var(--foreground)] font-medium">
              {options.fps} FPS
            </span>
          </label>
          <select
            value={options.fps}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...options,
                fps: Number(e.target.value) as 60 | 30 | 24 | 15 | 10,
              })
            }
            className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
          >
            <option value={60}>60 FPS (Ultra Smooth)</option>
            <option value={30}>30 FPS (Standard Video)</option>
            <option value={24}>24 FPS (Cinematic 24p)</option>
            <option value={15}>15 FPS (Compact Animation / GIF)</option>
            <option value={10}>10 FPS (Low Bandwidth)</option>
          </select>
        </div>

        {/* Playback Speed */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>Speed Multiplier</span>
            <span className="text-[var(--foreground)] font-medium">
              {options.speed}x
            </span>
          </label>
          <select
            value={options.speed}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                ...options,
                speed: Number(e.target.value) as 0.5 | 1 | 1.5 | 2,
              })
            }
            className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
          >
            <option value={0.5}>0.5x (Slow Motion)</option>
            <option value={1}>1.0x (Normal Speed)</option>
            <option value={1.5}>1.5x (Faster)</option>
            <option value={2}>2.0x (Double Speed / Timelapse)</option>
          </select>
        </div>

        {/* Mute Audio or GIF loop */}
        {isGif ? (
          <div className="space-y-1.5 flex flex-col justify-end">
            <label
              className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
                options.gifLoop
                  ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
              }`}
            >
              <input
                type="checkbox"
                checked={options.gifLoop}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...options, gifLoop: e.target.checked })
                }
                className="rounded accent-[var(--foreground)]"
              />
              <Repeat className="w-3.5 h-3.5 shrink-0" />
              <span>Infinite Looping GIF</span>
            </label>
          </div>
        ) : (
          <div className="space-y-1.5 flex flex-col justify-end">
            <label
              className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
                options.mute
                  ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
              }`}
            >
              <input
                type="checkbox"
                checked={options.mute}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...options, mute: e.target.checked })
                }
                className="rounded accent-[var(--foreground)]"
              />
              <VolumeX className="w-3.5 h-3.5 shrink-0" />
              <span>Mute Audio Track</span>
            </label>
          </div>
        )}

        {/* Quality preset indicator */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <div className="flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--foreground)]/[0.02]">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="truncate">WASM Canvas Transcode</span>
          </div>
        </div>
      </div>
    </div>
  );
}
