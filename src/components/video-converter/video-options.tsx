"use client";

import { VIDEO_FORMATS, type VideoFormat } from "@/lib/video-format-utils";
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
  const formatInfo = VIDEO_FORMATS[options.format as VideoFormat] || VIDEO_FORMATS.mp4;
  const isAudioOnly = formatInfo.category === "audio-extract" || ["mp3", "wav", "aac"].includes(targetFormat);
  const isGif = options.format === "gif";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-3 border-y border-(--border) min-h-20.5 items-center">
      {/* Slot 1: Target Resolution or Audio Bitrate */}
      {!isAudioOnly ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-(--muted-foreground)">
            <span>Resolution</span>
            <span className="font-semibold text-(--foreground) uppercase tabular-nums">
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
            className="w-full h-8 px-2.5 text-xs font-mono bg-(--card) text-(--foreground) rounded-md outline-none focus:ring-1 focus:ring-(--ring) cursor-pointer"
          >
            <option value="original">Original ({metadata ? `${metadata.width}×${metadata.height}` : "Source"})</option>
            <option value="1080p">1080p Full HD</option>
            <option value="720p">720p HD</option>
            <option value="480p">480p SD</option>
            <option value="360p">360p Compact</option>
          </select>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-(--muted-foreground)">
            <span>Encoding Quality</span>
            <span className="font-semibold text-(--foreground)">High Spec</span>
          </div>
          <div className="flex items-center text-xs font-mono bg-(--card) h-8 px-2.5 rounded-md text-(--foreground)">
            192 kbps Direct Transcode
          </div>
        </div>
      )}

      {/* Slot 2: Frame Rate or Audio Sample Rate */}
      {!isAudioOnly ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-(--muted-foreground)">
            <span>Frame Rate</span>
            <span className="font-semibold text-(--foreground) tabular-nums">
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
            className="w-full h-8 px-2.5 text-xs font-mono bg-(--card) text-(--foreground) rounded-md outline-none focus:ring-1 focus:ring-(--ring) cursor-pointer"
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
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-(--muted-foreground)">
            <span>Sample Rate</span>
            <span className="font-semibold text-(--foreground)">48 kHz</span>
          </div>
          <div className="flex items-center text-xs font-mono bg-(--card) h-8 px-2.5 rounded-md text-(--foreground)">
            48 kHz Studio Broadcast
          </div>
        </div>
      )}

      {/* Slot 3: Speed Multiplier or Audio Channels */}
      {!isAudioOnly ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-(--muted-foreground)">
            <span>Playback Speed</span>
            <span className="font-semibold text-(--foreground) tabular-nums">
              {options.speed}x
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 bg-(--card) p-0.5 rounded-md h-8 items-center text-center">
            {([0.5, 1, 1.5, 2] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onOptionsChange({ ...options, speed: spd })}
                className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
                  options.speed === spd
                    ? "bg-(--foreground) text-(--background) font-medium"
                    : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-(--muted-foreground)">
            <span>Channel Layout</span>
            <span className="font-semibold text-(--foreground)">Stereo</span>
          </div>
          <div className="flex items-center text-xs font-mono bg-(--card) h-8 px-2.5 rounded-md text-(--foreground)">
            2-Channel Stereo Mix
          </div>
        </div>
      )}

      {/* Slot 4: Audio Track Mute / Include Toggle */}
      {!isAudioOnly && !isGif ? (
        <div className="flex flex-col justify-end">
          <label
            className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
              !options.mute
                ? "bg-(--primary) text-(--primary-foreground) font-medium"
                : "bg-(--card) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)"
            }`}
          >
            <input
              type="checkbox"
              checked={!options.mute}
              onChange={(e) =>
                onOptionsChange({ ...options, mute: !e.target.checked })
              }
              className="rounded accent-(--foreground) sr-only"
            />
            <span>Audio: {!options.mute ? "Included" : "Muted"}</span>
          </label>
        </div>
      ) : (
        <div className="flex flex-col justify-end">
          <div className="flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md bg-(--card) text-(--muted-foreground)">
            <span>100% Client-Side WASM</span>
          </div>
        </div>
      )}
    </div>
  );
}
