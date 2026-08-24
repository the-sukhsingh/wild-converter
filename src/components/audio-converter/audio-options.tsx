"use client";

import { AUDIO_FORMATS } from "@/lib/audio-format-utils";
import type { AudioConversionOptions, AudioMetadata } from "@/lib/audio-converter";

interface AudioOptionsProps {
  targetFormat: string;
  options: AudioConversionOptions;
  metadata: AudioMetadata | null;
  onOptionsChange: (options: AudioConversionOptions) => void;
}

export function AudioOptionsPanel({
  targetFormat,
  options,
  metadata,
  onOptionsChange,
}: AudioOptionsProps) {
  const formatInfo = AUDIO_FORMATS[options.format] || AUDIO_FORMATS.mp3;
  const isLossless = formatInfo.isLossless || targetFormat.endsWith("-ls");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-[var(--border)]">
      {/* Sample Rate */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>Sample Rate</span>
          <span className="font-semibold text-[var(--foreground)]">
            {options.sampleRate / 1000} kHz
          </span>
        </div>
        <select
          value={options.sampleRate}
          onChange={(e) =>
            onOptionsChange({ ...options, sampleRate: Number(e.target.value) })
          }
          className="w-full h-8 px-2.5 text-xs font-mono bg-[var(--card)] text-[var(--foreground)] rounded-md outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer"
        >
          <option value={96000}>96 kHz (Studio Master)</option>
          <option value={48000}>48 kHz (Broadcast / Video)</option>
          <option value={44100}>44.1 kHz (CD Standard)</option>
          <option value={32000}>32 kHz (Digital Radio)</option>
          <option value={22050}>22.05 kHz (Voice / Compact)</option>
          <option value={16000}>16 kHz (Speech)</option>
          <option value={8000}>8 kHz (Telephone)</option>
        </select>
      </div>

      {/* Bitrate (for lossy) or Bit Depth (for PCM) */}
      {!isLossless ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Bitrate</span>
            <span className="font-semibold text-[var(--foreground)]">
              {options.bitrate} kbps
            </span>
          </div>
          <select
            value={options.bitrate}
            onChange={(e) =>
              onOptionsChange({ ...options, bitrate: Number(e.target.value) })
            }
            className="w-full h-8 px-2.5 text-xs font-mono bg-[var(--card)] text-[var(--foreground)] rounded-md outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer"
          >
            <option value={320}>320 kbps (Maximum Quality)</option>
            <option value={256}>256 kbps (High Quality)</option>
            <option value={192}>192 kbps (Standard Quality)</option>
            <option value={128}>128 kbps (Compact)</option>
            <option value={96}>96 kbps (Voice / Podcast)</option>
            <option value={64}>64 kbps (Low Bandwidth)</option>
          </select>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
            <span>Bit Depth</span>
            <span className="font-semibold text-[var(--foreground)]">
              {options.bitDepth}-bit
            </span>
          </div>
          <select
            value={options.bitDepth}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                bitDepth: Number(e.target.value) as 16 | 24 | 32,
              })
            }
            className="w-full h-8 px-2.5 text-xs font-mono bg-[var(--card)] text-[var(--foreground)] rounded-md outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer"
          >
            <option value={16}>16-bit PCM (CD Audio)</option>
            <option value={24}>24-bit PCM (Studio Master)</option>
            <option value={32}>32-bit Float (Ultra Dynamic)</option>
          </select>
        </div>
      )}

      {/* Channels */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>Channels</span>
          <span className="font-semibold text-[var(--foreground)]">
            {options.channels === 1 ? "Mono" : "Stereo"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 bg-[var(--card)] p-0.5 rounded-md h-8 items-center">
          <button
            type="button"
            onClick={() => onOptionsChange({ ...options, channels: 2 })}
            className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
              options.channels === 2
                ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Stereo
          </button>
          <button
            type="button"
            onClick={() => onOptionsChange({ ...options, channels: 1 })}
            className={`h-7 text-xs font-mono rounded transition-colors cursor-pointer ${
              options.channels === 1
                ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Mono
          </button>
        </div>
      </div>

      {/* Normalize Audio Toggle */}
      <div className="flex flex-col justify-end">
        <label
          className={`flex items-center gap-2 text-xs font-mono h-8 px-2.5 rounded-md cursor-pointer select-none transition-colors ${
            options.normalize
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-medium"
              : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
        >
          <input
            type="checkbox"
            checked={options.normalize}
            onChange={(e) =>
              onOptionsChange({ ...options, normalize: e.target.checked })
            }
            className="rounded accent-[var(--foreground)] sr-only"
          />
          <span>Peak Volume Normalization (0 dB)</span>
        </label>
      </div>
    </div>
  );
}
