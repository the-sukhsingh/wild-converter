/**
 * Client-side genuine MP3 encoder via @breezystack/lamejs
 * Encodes Web Audio PCM float32 buffers directly into valid MPEG-1 Audio Layer III (.mp3)
 */
export async function encodeMp3(audioBuffer: AudioBuffer, kbps: number = 192): Promise<Blob> {
  const lamejsModule = await import("@breezystack/lamejs");
  const Mp3EncoderClass =
    lamejsModule.Mp3Encoder ||
    (lamejsModule as unknown as { default?: { Mp3Encoder?: typeof lamejsModule.Mp3Encoder } }).default?.Mp3Encoder;

  if (!Mp3EncoderClass) {
    throw new Error("Unable to load Mp3Encoder from @breezystack/lamejs");
  }

  const channels = Math.min(2, audioBuffer.numberOfChannels);
  const sampleRate = audioBuffer.sampleRate;
  const validSampleRates = [48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000];
  const targetRate = validSampleRates.includes(sampleRate) ? sampleRate : 44100;

  const mp3encoder = new Mp3EncoderClass(channels, targetRate, kbps);
  const mp3Data: Uint8Array[] = [];

  const left = audioBuffer.getChannelData(0);
  const right = channels > 1 ? audioBuffer.getChannelData(1) : left;

  const sampleCount = audioBuffer.length;
  const leftInt16 = new Int16Array(sampleCount);
  const rightInt16 = new Int16Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const sL = Math.max(-1, Math.min(1, left[i]));
    leftInt16[i] = sL < 0 ? sL * 0x8000 : sL * 0x7fff;
    const sR = Math.max(-1, Math.min(1, right[i]));
    rightInt16[i] = sR < 0 ? sR * 0x8000 : sR * 0x7fff;
  }

  const sampleBlockSize = 1152;
  for (let i = 0; i < sampleCount; i += sampleBlockSize) {
    const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
    const rightChunk = channels > 1 ? rightInt16.subarray(i, i + sampleBlockSize) : leftChunk;
    const mp3buf =
      channels === 1
        ? mp3encoder.encodeBuffer(leftChunk)
        : mp3encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }
  }

  const endBuf = mp3encoder.flush();
  if (endBuf.length > 0) {
    mp3Data.push(new Uint8Array(endBuf));
  }

  return new Blob(mp3Data as unknown as BlobPart[], { type: "audio/mpeg" });
}

/**
 * Universal compressed audio encoder supporting MP3, OGG, WebM, AAC, FLAC
 */
export async function encodeCompressedAudio(
  audioBuffer: AudioBuffer,
  mimeType: string,
  bitrateKbps: number = 192
): Promise<Blob> {
  // 1. Direct pure MP3 encoding
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) {
    try {
      return await encodeMp3(audioBuffer, bitrateKbps);
    } catch (e) {
      console.warn("lamejs MP3 encode error, fallback:", e);
    }
  }

  // 2. MediaRecorder container recording
  const supportedMime = getBestSupportedAudioMime(mimeType);

  if (typeof MediaRecorder !== "undefined" && supportedMime) {
    try {
      return await recordAudioBuffer(audioBuffer, supportedMime, bitrateKbps * 1000);
    } catch {
      // Fallback
    }
  }

  // 3. Fallback to uncompressed high-spec WAV container
  const { encodeWAV } = await import("./wav-encoder");
  return encodeWAV(audioBuffer, 16);
}

function getBestSupportedAudioMime(preferred: string): string | null {
  if (typeof MediaRecorder === "undefined") return null;

  const candidates = [
    preferred,
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
    "audio/aac",
  ];

  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function recordAudioBuffer(
  audioBuffer: AudioBuffer,
  mimeType: string,
  bitsPerSecond: number
): Promise<Blob> {
  const ctx = new AudioContext({ sampleRate: audioBuffer.sampleRate });
  const destination = ctx.createMediaStreamDestination();
  const sourceNode = ctx.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(destination);

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(destination.stream, {
    mimeType,
    audioBitsPerSecond: bitsPerSecond,
  });

  return new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      ctx.close();
      const outputBlob = new Blob(chunks, { type: mimeType.split(";")[0] });
      resolve(outputBlob);
    };

    recorder.onerror = (err) => {
      ctx.close();
      reject(err);
    };

    recorder.start(100);
    sourceNode.start(0);

    sourceNode.onended = () => {
      setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }, 150);
    };
  });
}
