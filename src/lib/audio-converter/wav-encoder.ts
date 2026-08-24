/**
 * High-performance browser PCM audio encoders (WAV & AIFF)
 * Supports 16-bit, 24-bit, and 32-bit float encoding with proper RIFF/IFF headers
 */

export function encodeWAV(
  audioBuffer: AudioBuffer,
  bitDepth: 16 | 24 | 32 = 16
): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // Write ASCII string helper
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // "fmt " sub-chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, bitDepth === 32 ? 3 : 1, true); // AudioFormat (1 = PCM, 3 = IEEE Float)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // "data" sub-chunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave and write sample data
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));

      if (bitDepth === 16) {
        const s = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, s, true);
        offset += 2;
      } else if (bitDepth === 24) {
        const s = sample < 0 ? sample * 0x800000 : sample * 0x7fffff;
        const intVal = Math.floor(s);
        view.setUint8(offset, intVal & 0xff);
        view.setUint8(offset + 1, (intVal >> 8) & 0xff);
        view.setUint8(offset + 2, (intVal >> 16) & 0xff);
        offset += 3;
      } else if (bitDepth === 32) {
        view.setFloat32(offset, sample, true);
        offset += 4;
      }
    }
  }

  return new Blob([view], { type: "audio/wav" });
}

export function encodeAIFF(
  audioBuffer: AudioBuffer,
  bitDepth: 16 | 24 = 16
): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const bytesPerSample = bitDepth / 8;
  const dataSize = length * numChannels * bytesPerSample;
  const bufferSize = 54 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // FORM AIFF container (Big Endian)
  writeString(0, "FORM");
  view.setUint32(4, 46 + dataSize, false);
  writeString(8, "AIFF");

  // COMM chunk
  writeString(12, "COMM");
  view.setUint32(16, 18, false); // Chunk size
  view.setUint16(20, numChannels, false);
  view.setUint32(22, length, false);
  view.setUint16(26, bitDepth, false);

  // 80-bit IEEE 754 extended float for sampleRate
  view.setUint16(28, 16398, false); // Exponent for typical 44100/48000
  view.setUint32(30, (sampleRate << 16) >>> 0, false);
  view.setUint32(34, 0, false);

  // SSND chunk
  writeString(38, "SSND");
  view.setUint32(42, dataSize + 8, false);
  view.setUint32(46, 0, false); // offset
  view.setUint32(50, 0, false); // blockSize

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }

  let offset = 54;
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      if (bitDepth === 16) {
        const s = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, s, false);
        offset += 2;
      } else {
        const s = sample < 0 ? sample * 0x800000 : sample * 0x7fffff;
        const intVal = Math.floor(s);
        view.setUint8(offset, (intVal >> 16) & 0xff);
        view.setUint8(offset + 1, (intVal >> 8) & 0xff);
        view.setUint8(offset + 2, intVal & 0xff);
        offset += 3;
      }
    }
  }

  return new Blob([view], { type: "audio/aiff" });
}
