"use client";

import { Sliders, Volume2, Scissors } from "lucide-react";
import { AUDIO_FORMATS } from "@/lib/audio-format-utils";
import type { AudioConversionOptions, AudioMetadata } from "@/lib/audio-converter";

interface AudioOptionsProps {
  options: AudioConversionOptions;
  metadata: AudioMetadata;
  onChange: (options: AudioConversionOptions) => void;
  disabled?: boolean;
}

export function AudioOptions({
  options,
  metadata,
  onChange,
  disabled = false,
}: AudioOptionsProps) {
  const formatInfo = AUDIO_FORMATS[options.format] || AUDIO_FORMATS.mp3;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
        <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          DSP & Audio Encoding Options
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Sample Rate */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>Sample Rate</span>
            <span className="text-[var(--foreground)] font-medium">
              {options.sampleRate >= 1000
                ? `${options.sampleRate / 1000} kHz`
                : `${options.sampleRate} Hz`}
            </span>
          </label>
          <select
            value={options.sampleRate}
            disabled={disabled}
            onChange={(e) =>
              onChange({ ...options, sampleRate: Number(e.target.value) })
            }
            className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
          >
            <option value={96000}>96.0 kHz (Studio Master)</option>
            <option value={48000}>48.0 kHz (Broadcast / Video)</option>
            <option value={44100}>44.1 kHz (CD Audio Standard)</option>
            <option value={32000}>32.0 kHz (Digital Radio)</option>
            <option value={22050}>22.05 kHz (Compact Voice)</option>
            <option value={16000}>16.0 kHz (Wideband Voice)</option>
            <option value={8000}>8.0 kHz (Telephone Speech)</option>
          </select>
        </div>

        {/* Channels (Stereo / Mono) */}
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
            <span>Channels</span>
            <span className="text-[var(--foreground)] font-medium">
              {options.channels === 1 ? "Mono (1ch)" : "Stereo (2ch)"}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[var(--foreground)]/5 p-0.5 rounded border border-[var(--border)]">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...options, channels: 2 })}
              className={`text-xs py-1 rounded transition-colors cursor-pointer ${
                options.channels === 2
                  ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Stereo
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...options, channels: 1 })}
              className={`text-xs py-1 rounded transition-colors cursor-pointer ${
                options.channels === 1
                  ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Mono
            </button>
          </div>
        </div>

        {/* Bitrate (if applicable) */}
        {formatInfo.supportsBitrate && (
          <div className="space-y-1.5">
            <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
              <span>Bitrate</span>
              <span className="text-[var(--foreground)] font-medium">
                {options.bitrate} kbps
              </span>
            </label>
            <select
              value={options.bitrate}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...options, bitrate: Number(e.target.value) })
              }
              className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
            >
              <option value={320}>320 kbps (Maximum Quality)</option>
              <option value={256}>256 kbps (High Quality)</option>
              <option value={192}>192 kbps (Standard Quality)</option>
              <option value={128}>128 kbps (Efficient)</option>
              <option value={96}>96 kbps (Voice / Podcast)</option>
              <option value={64}>64 kbps (Low Bandwidth)</option>
            </select>
          </div>
        )}

        {/* Bit Depth (if PCM / Lossless) */}
        {formatInfo.supportsBitDepth && (
          <div className="space-y-1.5">
            <label className="text-xs text-[var(--muted-foreground)] font-mono flex items-center justify-between">
              <span>Bit Depth</span>
              <span className="text-[var(--foreground)] font-medium">
                {options.bitDepth}-bit PCM
              </span>
            </label>
            <select
              value={options.bitDepth}
              disabled={disabled}
              onChange={(e) =>
                onChange({
                  ...options,
                  bitDepth: Number(e.target.value) as 16 | 24 | 32,
                })
              }
              className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer"
            >
              <option value={16}>16-bit Integer (CD Quality)</option>
              <option value={24}>24-bit Integer (Studio Master)</option>
              <option value={32}>32-bit Float (Ultra Dynamic Range)</option>
            </select>
          </div>
        )}

        {/* Peak Normalization */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label
            className={`flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] cursor-pointer select-none ${
              options.normalize
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.02]"
            }`}
          >
            <input
              type="checkbox"
              checked={options.normalize}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...options, normalize: e.target.checked })
              }
              className="rounded accent-[var(--foreground)]"
            />
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span>Normalize Peak Volume (0 dB)</span>
          </label>
        </div>

        {/* Trim controls summary */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <div className="flex items-center gap-2 text-xs font-mono p-2 rounded border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--foreground)]/[0.02]">
            <Scissors className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              Full Duration: {metadata.duration.toFixed(2)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
