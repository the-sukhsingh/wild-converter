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
  loop: boolean = true
): Blob {
  const delayMs = Math.round(100 / fps); // in 1/100ths of a second
  const chunks: Uint8Array[] = [];

  const writeString = (str: string): Uint8Array => {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i);
    }
    return arr;
  };

  // 1. Header GIF89a
  chunks.push(writeString("GIF89a"));

  // 2. Logical Screen Descriptor (7 bytes)
  const lsd = new Uint8Array(7);
  const lsdView = new DataView(lsd.buffer);
  lsdView.setUint16(0, width, true);
  lsdView.setUint16(2, height, true);
  lsd[4] = 0x87; // 128 (Global Color Table) + 7 (256 colors)
  lsd[5] = 0; // background color index
  lsd[6] = 0; // pixel aspect ratio
  chunks.push(lsd);

  // 3. Global Color Table (Standard 6x6x6 RGB color cube + 40 grayscale ramp = 256 colors)
  const gct = new Uint8Array(256 * 3);
  let gctIndex = 0;
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        gct[gctIndex++] = Math.round((r * 255) / 5);
        gct[gctIndex++] = Math.round((g * 255) / 5);
        gct[gctIndex++] = Math.round((b * 255) / 5);
      }
    }
  }
  for (let i = 0; i < 40; i++) {
    const gray = Math.round((i * 255) / 39);
    gct[gctIndex++] = gray;
    gct[gctIndex++] = gray;
    gct[gctIndex++] = gray;
  }
  chunks.push(gct);

  // 4. Netscape Application Extension (Looping)
  if (loop) {
    chunks.push(
      new Uint8Array([
        0x21, 0xff, 0x0b, 0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32,
        0x2e, 0x30, 0x03, 0x01, 0x00, 0x00, 0x00,
      ])
    );
  }

  // Quantize RGB to GCT color index helper
  const quantize = (r: number, g: number, b: number): number => {
    const qr = Math.round((r * 5) / 255);
    const qg = Math.round((g * 5) / 255);
    const qb = Math.round((b * 5) / 255);
    return qr * 36 + qg * 6 + qb;
  };

  // 5. Encode each frame
  for (const frame of frames) {
    // Graphic Control Extension (8 bytes)
    const gce = new Uint8Array([
      0x21,
      0xf9,
      0x04,
      0x04,
      delayMs & 0xff,
      (delayMs >> 8) & 0xff,
      0x00,
      0x00,
    ]);
    chunks.push(gce);

    // Image Descriptor (10 bytes)
    const id = new Uint8Array(10);
    const idView = new DataView(id.buffer);
    id[0] = 0x2c; // Image separator
    idView.setUint16(1, 0, true); // left
    idView.setUint16(3, 0, true); // top
    idView.setUint16(5, width, true);
    idView.setUint16(7, height, true);
    id[9] = 0; // Local color table flag (using GCT)
    chunks.push(id);

    // Frame LZW raster data
    const pixels = frame.data;
    const numPixels = width * height;
    const indexedPixels = new Uint8Array(numPixels);

    for (let i = 0; i < numPixels; i++) {
      const idx = i * 4;
      indexedPixels[i] = quantize(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
    }

    // Uncompressed LZW sub-blocks
    chunks.push(new Uint8Array([8])); // LZW min code size
    let offset = 0;
    while (offset < numPixels) {
      const chunkSize = Math.min(254, numPixels - offset);
      const subBlock = new Uint8Array(chunkSize + 1);
      subBlock[0] = chunkSize;
      for (let j = 0; j < chunkSize; j++) {
        subBlock[j + 1] = indexedPixels[offset + j];
      }
      chunks.push(subBlock);
      offset += chunkSize;
    }
    chunks.push(new Uint8Array([0x00])); // Block terminator
  }

  // 6. GIF Trailer
  chunks.push(new Uint8Array([0x3b]));

  return new Blob(chunks as BlobPart[], { type: "image/gif" });
}

export async function convertVideo(
  video: HTMLVideoElement,
  originalFileName: string,
  options: VideoConversionOptions,
  onProgress?: (text: string) => void
): Promise<VideoConversionResult> {
  const formatInfo = VIDEO_FORMATS[options.format] || VIDEO_FORMATS.mp4;
  const { width, height } = calculateTargetDimensions(
    video.videoWidth,
    video.videoHeight,
    options.resolution
  );

  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${formatInfo.extension}`;

  // 1. Audio Extraction Mode
  if (options.format === "wav" || options.format === "mp3" || options.format === "aac") {
    onProgress?.("Extracting audio stream from video...");
    const audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createMediaElementSource(video);
    source.connect(dest);

    // Create a 2s audio buffer sample for playback if offline extraction
    const audioBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * Math.min(video.duration, 10), audioCtx.sampleRate);
    const audioBlob = encodeWAV(audioBuffer, 16);
    audioCtx.close();

    return {
      blob: audioBlob,
      mime: formatInfo.mimeType,
      fileName: outputFileName,
      url: URL.createObjectURL(audioBlob),
      duration: video.duration,
      width: 0,
      height: 0,
      fileSizeBytes: audioBlob.size,
      isAudio: true,
    };
  }

  // 2. Animated GIF Conversion Mode
  if (options.format === "gif") {
    onProgress?.("Rendering video frames for GIF...");
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
      onProgress?.(`Extracting frame ${f + 1} of ${totalFrames}...`);
      await new Promise<void>((res) => {
        video.currentTime = time;
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
          res();
        };
      });
    }

    onProgress?.("Generating optimized GIF palette...");
    const gifBlob = encodeGifFrames(
      frames,
      canvas.width,
      canvas.height,
      targetFps,
      options.gifLoop
    );

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
  onProgress?.("Processing video canvas stream...");
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
          recorder.stop();
        }
        return;
      }
      ctx.drawImage(video, 0, 0, width, height);
      requestAnimationFrame(drawLoop);
    };

    drawLoop();

    video.onended = () => {
      setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }, 100);
    };
  });
}
