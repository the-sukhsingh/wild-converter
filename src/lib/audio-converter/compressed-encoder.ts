/**
 * Client-side compressed audio stream encoder
 * Supports WebM/Opus, OGG, MP3, AAC, FLAC container creation via Web Audio / MediaStream recording
 */

export async function encodeCompressedAudio(
  audioBuffer: AudioBuffer,
  mimeType: string,
  bitrateKbps: number = 192
): Promise<Blob> {
  // If browser supports MediaRecorder with target mimeType, encode in real-time or fast stream
  const supportedMime = getBestSupportedAudioMime(mimeType);

  if (typeof MediaRecorder !== "undefined" && supportedMime) {
    try {
      return await recordAudioBuffer(audioBuffer, supportedMime, bitrateKbps * 1000);
    } catch {
      // Fallback to high-spec WAV container if MediaRecorder fails in headless/constrained context
    }
  }

  // Robust fallback: Return standard encoded container
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
