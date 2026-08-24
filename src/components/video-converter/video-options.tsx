"use client";

import { VIDEO_FORMATS } from "@/lib/video-format-utils";
import type { VideoConversionOptions, VideoMetadata } from "@/lib/video-converter";

interface VideoOptionsProps {
  targetFormat: string;
  options: VideoConversionOptions;
  metadata: VideoMetadata | null;
  onOptionsChange: (options: VideoConversionOptions) => void;
}

export function VideoOptionsPanel({
  targetFormat,
  options,
  metadata,
  onOptionsChange,
}: VideoOptionsProps) {
  const formatInfo = VIDEO_FORMATS[options.format] || VIDEO_FORMATS.mp4;
  const isAudioOnly = formatInfo.category === "audio-extract";
  const isGif = options.format === "gif";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-[var(--border)]">
      {/* Target Resolution */}
      {!isAudioOnly && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Resolution</span>
            <span className="font-semibold text-[var(--foreground)]">
              {options.resolution.toUpperCase()}
            </span>
          </div>
          <select
            value={options.resolution}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                resolution: e.target.value as VideoConversionOptions["resolution"],
              })
            }
            className="w-full h-8 px-2.5 text-xs font-mono bg-[var(--card)] text-[var(--foreground)] rounded-md outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer"
          >
            <option value="original">Original ({metadata ? `${metadata.width}×${metadata.height}` : "Source"})</option>
            <option value="1080p">1080p Full HD</option>
            <option value="720p">720p HD</option>
            <option value="480p">480p SD</option>
            <option value="360p">360p Compact</option>
          </select>
        </div>
      )}

      {/* Frame Rate */}
      {!isAudioOnly && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Frame Rate</span>
            <span className="font-semibold text-[var(--foreground)]">
              {options.fps} fps
            </span>
          </div>
          <select
            value={options.fps}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                fps: Number(e.target.value) as VideoConversionOptions["fps"],
              })
            }
            className="w-full h-8 px-2.5 text-xs font-mono bg-[var(--card)] text-[var(--foreground)] rounded-md outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer"
          >
            {isGif ? (
              <>
                <option value={24}>24 fps (Smooth)</option>
                <option value={15}>15 fps (Recommended)</option>
                <option value={10}>10 fps (Compact)</option>
              </>
            ) : (
              <>
                <option value={60}>60 fps (Ultra Smooth)</option>
                <option value={30}>30 fps (Standard)</option>
                <option value={24}>24 fps (Cinematic)</option>
                <option value={15}>15 fps (Compact)</option>
              </>
            )}
          </select>
        </div>
      )}

      {/* Speed Multiplier */}
      {!isAudioOnly && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Playback Speed</span>
            <span className="font-semibold text-[var(--foreground)]">
              {options.speed}x
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 bg-[var(--card)] p-0.5 rounded-md h-8 items-center text-center">
            {([0.5, 1, 1.5, 2] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() =>
                  onOptionsChange({ ...options, speed: spd })
                }
                className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
                  options.speed === spd
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mute Audio or Loop Toggle */}
      <div className="flex flex-col justify-end">
        {isGif ? (
          <label
            className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
              options.gifLoop
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-medium"
                : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            <input
              type="checkbox"
              checked={options.gifLoop}
              onChange={(e) =>
                onOptionsChange({ ...options, gifLoop: e.target.checked })
              }
              className="rounded accent-[var(--foreground)] sr-only"
            />
            <span>Infinite GIF Loop</span>
          </label>
        ) : (
          <label
            className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
              options.mute
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-medium"
                : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            <input
              type="checkbox"
              checked={options.mute}
              onChange={(e) =>
                onOptionsChange({ ...options, mute: e.target.checked })
              }
              className="rounded accent-[var(--foreground)] sr-only"
            />
            <span>Mute / Remove Audio Track</span>
          </label>
        )}
      </div>
    </div>
  );
}
