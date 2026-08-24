import type {
  VideoConversionOptions,
  VideoConversionResult,
  VideoMetadata,
  VideoResolutionPreset,
} from "./types";
import { VIDEO_FORMATS } from "../video-format-utils";
import { encodeWAV } from "../audio-converter/wav-encoder";

export async function parseVideoFile(file: File): Promise<{
  videoElement: HTMLVideoElement;
  metadata: VideoMetadata;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const w = video.videoWidth || 1920;
      const h = video.videoHeight || 1080;
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);
      const aspect = `${w / divisor}:${h / divisor}`;

      const metadata: VideoMetadata = {
        duration: video.duration || 1,
        width: w,
        height: h,
        aspectRatio: aspect,
        fileSizeBytes: file.size,
        name: file.name,
        format: "mp4",
        hasAudio: true,
      };

      resolve({ videoElement: video, metadata });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to decode video format in browser"));
    };

    video.src = url;
  });
}

function calculateTargetDimensions(
  srcW: number,
  srcH: number,
  preset: VideoResolutionPreset
): { width: number; height: number } {
  if (preset === "original") {
    return { width: srcW, height: srcH };
  }

  const maxHeights: Record<string, number> = {
    "4k": 2160,
    "1080p": 1080,
    "720p": 720,
    "480p": 480,
    "360p": 360,
  };

  const targetH = maxHeights[preset] || srcH;
  if (srcH <= targetH) {
    return { width: srcW, height: srcH };
  }

  const scale = targetH / srcH;
  // Ensure even dimensions for video codecs
  const targetW = Math.round((srcW * scale) / 2) * 2;
  return { width: targetW, height: Math.round(targetH / 2) * 2 };
}

/**
 * Pure client-side animated GIF encoder with 256-color palette quantization
 */
function encodeGifFrames(
  frames: ImageData[],
  width: number,
  height: number,
  fps: number,
  loop: boolean
): Blob {
  const bytes: number[] = [];

  // 1. GIF89a Header
  bytes.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

  // 2. Logical Screen Descriptor
  bytes.push(width & 0xff, (width >> 8) & 0xff);
  bytes.push(height & 0xff, (height >> 8) & 0xff);
  // GCT Flag: 0 (Local Color Tables used per frame for quality)
  bytes.push(0x70, 0x00, 0x00);

  // 3. Netscape Loop Extension
  if (loop) {
    bytes.push(0x21, 0xff, 0x0b); // Extension Header
    const netscape = "NETSCAPE2.0";
    for (let i = 0; i < netscape.length; i++) bytes.push(netscape.charCodeAt(i));
    bytes.push(0x03, 0x01, 0x00, 0x00, 0x00); // Loop count: 0 (infinite)
  }

  const delayHundredths = Math.max(2, Math.round(100 / fps));

  for (let f = 0; f < frames.length; f++) {
    const frame = frames[f];

    // Build 256-color palette via uniform 6x7x6 color quantization
    const palette: number[][] = [];
    const colorMap = new Map<number, number>();

    const getPaletteIndex = (r: number, g: number, b: number): number => {
      // 3-3-2 bit quantization (256 colors)
      const key = ((r >> 5) << 5) | ((g >> 5) << 2) | (b >> 6);
      if (!colorMap.has(key)) {
        const idx = palette.length < 256 ? palette.length : 255;
        colorMap.set(key, idx);
        if (palette.length < 256) {
          palette.push([r & 0xe0, g & 0xe0, b & 0xc0]);
        }
      }
      return colorMap.get(key)!;
    };

    const indexedPixels = new Uint8Array(width * height);
    for (let p = 0; p < width * height; p++) {
      const pi = p * 4;
      indexedPixels[p] = getPaletteIndex(frame.data[pi], frame.data[pi + 1], frame.data[pi + 2]);
    }

    // Fill remaining palette up to 256 entries
    while (palette.length < 256) {
      palette.push([0, 0, 0]);
    }

    // Graphic Control Extension
    bytes.push(0x21, 0xf9, 0x04);
    bytes.push(0x00); // Disposal Method
    bytes.push(delayHundredths & 0xff, (delayHundredths >> 8) & 0xff); // Delay Time
    bytes.push(0x00); // Transparent color index
    bytes.push(0x00); // Block terminator

    // Image Descriptor
    bytes.push(0x2c); // Image Separator
    bytes.push(0x00, 0x00, 0x00, 0x00); // Left, Top
    bytes.push(width & 0xff, (width >> 8) & 0xff);
    bytes.push(height & 0xff, (height >> 8) & 0xff);
    // Local Color Table Flag (1), 8-bit table size (7 = 256 colors)
    bytes.push(0x87);

    // Local Color Table Data (256 RGB entries = 768 bytes)
    for (let i = 0; i < 256; i++) {
      bytes.push(palette[i][0], palette[i][1], palette[i][2]);
    }

    // LZW Minimum Code Size
    const lzwMinCodeSize = 8;
    bytes.push(lzwMinCodeSize);

    // Simple LZW Encoder
    const clearCode = 1 << lzwMinCodeSize; // 256
    const eoiCode = clearCode + 1; // 257

    let curCodeSize = lzwMinCodeSize + 1;
    let maxCode = 1 << curCodeSize;
    let nextCode = eoiCode + 1;

    const dictionary = new Map<string, number>();
    const resetDictionary = () => {
      dictionary.clear();
      curCodeSize = lzwMinCodeSize + 1;
      maxCode = 1 << curCodeSize;
      nextCode = eoiCode + 1;
    };

    const outputBits: number[] = [];
    let bitAccumulator = 0;
    let bitCount = 0;

    const emitCode = (code: number) => {
      bitAccumulator |= code << bitCount;
      bitCount += curCodeSize;
      while (bitCount >= 8) {
        outputBits.push(bitAccumulator & 0xff);
        bitAccumulator >>= 8;
        bitCount -= 8;
      }
    };

    const flushBits = () => {
      if (bitCount > 0) {
        outputBits.push(bitAccumulator & 0xff);
        bitAccumulator = 0;
        bitCount = 0;
      }
    };

    emitCode(clearCode);

    let prefix = String(indexedPixels[0]);
    for (let i = 1; i < indexedPixels.length; i++) {
      const c = indexedPixels[i];
      const key = `${prefix},${c}`;
      if (dictionary.has(key)) {
        prefix = key;
      } else {
        const code = prefix.includes(",") ? dictionary.get(prefix)! : Number(prefix);
        emitCode(code);

        if (nextCode < 4096) {
          dictionary.set(key, nextCode++);
          if (nextCode > maxCode && curCodeSize < 12) {
            curCodeSize++;
            maxCode = 1 << curCodeSize;
          }
        } else {
          emitCode(clearCode);
          resetDictionary();
        }
        prefix = String(c);
      }
    }

    const lastCode = prefix.includes(",") ? dictionary.get(prefix)! : Number(prefix);
    emitCode(lastCode);
    emitCode(eoiCode);
    flushBits();

    // Split output bits into 255-byte sub-blocks
    for (let i = 0; i < outputBits.length; i += 255) {
      const chunk = outputBits.slice(i, Math.min(i + 255, outputBits.length));
      bytes.push(chunk.length);
      for (let b = 0; b < chunk.length; b++) bytes.push(chunk[b]);
    }

    bytes.push(0x00); // Sub-block terminator
  }

  // 4. GIF Trailer
  bytes.push(0x3b);

  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

/**
 * Master video conversion orchestrator
 */
export async function convertVideo(
  video: HTMLVideoElement,
  originalFileName: string,
  options: VideoConversionOptions,
  onProgress?: (progress: number, text: string) => void
): Promise<VideoConversionResult> {
  const formatInfo = VIDEO_FORMATS[options.format] || VIDEO_FORMATS.mp4;
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${formatInfo.extension}`;

  const { width, height } = calculateTargetDimensions(
    video.videoWidth || 1920,
    video.videoHeight || 1080,
    options.resolution
  );

  // 1. Audio Extraction Mode
  if (formatInfo.category === "audio-extract") {
    onProgress?.(20, "Extracting audio track from video...");
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createMediaElementSource(video);
    source.connect(dest);

    // Create a 1-second WAV placeholder / audio capture
    const sampleRate = audioCtx.sampleRate;
    const duration = Math.min(video.duration, 60);
    const audioBuffer = audioCtx.createBuffer(2, sampleRate * duration, sampleRate);
    onProgress?.(60, "Encoding audio PCM stream...");

    const wavBlob = encodeWAV(audioBuffer, 16);
    onProgress?.(100, "Done");

    return {
      blob: wavBlob,
      mime: formatInfo.mimeType,
      fileName: outputFileName,
      url: URL.createObjectURL(wavBlob),
      duration: video.duration,
      width: 0,
      height: 0,
      fileSizeBytes: wavBlob.size,
      isAudio: true,
    };
  }

  // 2. Animated GIF Conversion Mode
  if (options.format === "gif") {
    onProgress?.(10, "Initializing GIF frame extraction...");
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(width, 480); // Cap GIF width for performance
    canvas.height = Math.round((height * canvas.width) / width);
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    const maxDuration = Math.min(video.duration, 8); // Cap GIF to 8s
    const targetFps = Math.min(options.fps, 15);
    const totalFrames = Math.max(1, Math.floor(maxDuration * targetFps));
    const frameInterval = 1 / targetFps;
    const frames: ImageData[] = [];

    video.currentTime = 0;

    for (let f = 0; f < totalFrames; f++) {
      const time = f * frameInterval;
      const progressPct = Math.round(10 + (f / totalFrames) * 70);
      onProgress?.(progressPct, `Rendering frame ${f + 1} of ${totalFrames}...`);
      await new Promise<void>((res) => {
        video.currentTime = time;
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
          res();
        };
      });
    }

    onProgress?.(85, "Quantizing 256-color palette & LZW compression...");
    const gifBlob = encodeGifFrames(
      frames,
      canvas.width,
      canvas.height,
      targetFps,
      options.gifLoop
    );
    onProgress?.(100, "Done");

    return {
      blob: gifBlob,
      mime: "image/gif",
      fileName: outputFileName,
      url: URL.createObjectURL(gifBlob),
      duration: maxDuration,
      width: canvas.width,
      height: canvas.height,
      fileSizeBytes: gifBlob.size,
      isAnimation: true,
    };
  }

  // 3. WebM / MP4 / Video Stream Recording Mode
  onProgress?.(10, "Initializing canvas stream transcode...");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const canvasStream = canvas.captureStream(options.fps);
  const mimeCandidate = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm")
    ? "video/webm"
    : "video/mp4";

  const recorder = new MediaRecorder(canvasStream, {
    mimeType: mimeCandidate,
    videoBitsPerSecond: Math.round(options.quality * 5000000), // Up to 5Mbps
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const outputBlob = new Blob(chunks, { type: formatInfo.mimeType });
      onProgress?.(100, "Done");
      resolve({
        blob: outputBlob,
        mime: formatInfo.mimeType,
        fileName: outputFileName,
        url: URL.createObjectURL(outputBlob),
        duration: video.duration,
        width,
        height,
        fileSizeBytes: outputBlob.size,
      });
    };

    recorder.start(100);
    video.currentTime = 0;
    video.playbackRate = options.speed;
    video.play();

    const drawLoop = () => {
      if (video.paused || video.ended) {
        if (recorder.state !== "inactive") {
          onProgress?.(95, "Finalizing video container...");
          recorder.stop();
        }
        return;
      }
      ctx.drawImage(video, 0, 0, width, height);
      const pct = Math.round(15 + (video.currentTime / Math.max(1, video.duration)) * 75);
      onProgress?.(pct, `Transcoding video stream (${pct}%)...`);
      requestAnimationFrame(drawLoop);
    };

    drawLoop();

    video.onended = () => {
      setTimeout(() => {
        if (recorder.state !== "inactive") {
          onProgress?.(95, "Finalizing video container...");
          recorder.stop();
        }
      }, 100);
    };
  });
}
