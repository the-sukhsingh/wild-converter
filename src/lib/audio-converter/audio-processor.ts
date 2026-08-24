/**
 * Web Audio DSP audio processor
 * Supports resampling, peak normalization, mono/stereo mixing, and sub-second precision trimming
 */

export interface ProcessAudioParams {
  sourceBuffer: AudioBuffer;
  targetSampleRate?: number;
  targetChannels?: 1 | 2;
  normalize?: boolean;
  trimStart?: number;
  trimEnd?: number;
}

export async function processAudio(
  params: ProcessAudioParams
): Promise<AudioBuffer> {
  const {
    sourceBuffer,
    targetSampleRate = sourceBuffer.sampleRate,
    targetChannels = sourceBuffer.numberOfChannels === 1 ? 1 : 2,
    normalize = false,
    trimStart = 0,
    trimEnd,
  } = params;

  const duration = sourceBuffer.duration;
  const startSec = Math.max(0, Math.min(trimStart, duration));
  const endSec = trimEnd !== undefined ? Math.min(Math.max(startSec, trimEnd), duration) : duration;
  const targetDuration = Math.max(0.01, endSec - startSec);

  const targetLength = Math.round(targetDuration * targetSampleRate);

  const offlineCtx = new OfflineAudioContext(
    targetChannels,
    targetLength,
    targetSampleRate
  );

  const sourceNode = offlineCtx.createBufferSource();
  sourceNode.buffer = sourceBuffer;

  if (targetChannels === 1 && sourceBuffer.numberOfChannels > 1) {
    // Downmix to mono with equal gain
    const merger = offlineCtx.createChannelMerger(1);
    const splitter = offlineCtx.createChannelSplitter(sourceBuffer.numberOfChannels);
    sourceNode.connect(splitter);
    for (let i = 0; i < sourceBuffer.numberOfChannels; i++) {
      splitter.connect(merger, i, 0);
    }
    merger.connect(offlineCtx.destination);
  } else {
    sourceNode.connect(offlineCtx.destination);
  }

  sourceNode.start(0, startSec, targetDuration);
  const renderedBuffer = await offlineCtx.startRendering();

  if (normalize) {
    normalizeAudioBuffer(renderedBuffer);
  }

  return renderedBuffer;
}

/**
 * In-place peak amplitude normalization to 0 dBFS (-0.1 dB ceiling to prevent clipping)
 */
export function normalizeAudioBuffer(buffer: AudioBuffer): void {
  let peak = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
  }

  if (peak > 0 && peak < 0.99) {
    const gain = 0.98 / peak;
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < data.length; i++) {
        data[i] = data[i] * gain;
      }
    }
  }
}
