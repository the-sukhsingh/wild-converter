import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { VideoConversionOptions, VideoConversionResult } from "./types";
import { VIDEO_FORMATS, type VideoFormat } from "../video-format-utils";

let ffmpegSingleton: FFmpeg | null = null;
let isFfmpegLoaded = false;
let loadPromise: Promise<FFmpeg> | null = null;

/**
 * Initializes and returns the singleton FFmpeg WebAssembly instance
 */
export async function getFFmpeg(
  onProgress?: (progress: number, text: string) => void
): Promise<FFmpeg> {
  if (ffmpegSingleton && isFfmpegLoaded) {
    return ffmpegSingleton;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();

    ffmpeg.on("progress", ({ progress }) => {
      const pct = Math.min(95, Math.max(10, Math.round(progress * 100)));
      onProgress?.(pct, `Transcoding video (${pct}%)...`);
    });

    onProgress?.(5, "Initializing client-side WebAssembly FFmpeg core...");

    // Use single-threaded @ffmpeg/core 0.12.6 for universal browser compatibility
    // without requiring SharedArrayBuffer / COOP / COEP server headers.
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const altURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
    } catch {
      // Fallback mirror in case unpkg is blocked or slow
      await ffmpeg.load({
        coreURL: await toBlobURL(`${altURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${altURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
    }

    ffmpegSingleton = ffmpeg;
    isFfmpegLoaded = true;
    return ffmpeg;
  })();

  return loadPromise;
}

/**
 * Perform genuine client-side video conversion using WebAssembly FFmpeg
 */
export async function convertVideoWithFFmpeg(
  file: File,
  targetFormat: VideoFormat,
  options: VideoConversionOptions,
  onProgress?: (progress: number, text: string) => void,
  signal?: AbortSignal
): Promise<VideoConversionResult> {
  const formatInfo = VIDEO_FORMATS[targetFormat] || VIDEO_FORMATS.mp4;
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${formatInfo.extension}`;

  if (signal?.aborted) {
    throw new Error("Conversion cancelled by user");
  }

  const ffmpeg = await getFFmpeg(onProgress);

  if (signal?.aborted) {
    throw new Error("Conversion cancelled by user");
  }

  onProgress?.(15, "Loading input file into virtual memory filesystem...");

  const inputExt = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const inputFileName = `input_${Date.now()}.${inputExt}`;
  const outputVirtualName = `output_${Date.now()}.${formatInfo.extension}`;

  const fileData = await fetchFile(file);
  await ffmpeg.writeFile(inputFileName, fileData);

  onProgress?.(25, `Configuring ${formatInfo.label.split(" ")[0]} transcode pipeline...`);

  // Build optimized FFmpeg arguments
  const args: string[] = ["-i", inputFileName];

  // 1. Audio Extraction Targets
  if (formatInfo.category === "audio-extract" || ["mp3", "wav", "aac"].includes(targetFormat)) {
    args.push("-vn"); // No video stream

    if (targetFormat === "mp3") {
      args.push("-c:a", "libmp3lame", "-b:a", `${Math.round(options.quality * 192 + 64)}k`);
    } else if (targetFormat === "wav") {
      args.push("-c:a", "pcm_s16le");
    } else if (targetFormat === "aac") {
      args.push("-c:a", "aac", "-b:a", "192k");
    }
  }
  // 2. Animated GIF Target
  else if (targetFormat === "gif") {
    const fps = Math.min(options.fps || 15, 20);
    const maxW = 480;
    args.push(
      "-vf",
      `fps=${fps},scale='min(${maxW},iw)':-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
      "-loop",
      options.gifLoop !== false ? "0" : "-1"
    );
  }
  // 3. Video Transcoding & Remuxing Targets (MKV, MP4, WebM, AVI, MOV, FLV, WMV, 3GP, etc.)
  else {
    // Check if lossless container remuxing is possible (e.g. MP4 <-> MKV <-> MOV without dimension changes)
    const isRemuxCandidate =
      options.resolution === "original" &&
      options.speed === 1 &&
      ((inputExt === "mp4" && targetFormat === "mkv") ||
        (inputExt === "mkv" && targetFormat === "mp4") ||
        (inputExt === "mov" && (targetFormat === "mp4" || targetFormat === "mkv")));

    if (isRemuxCandidate) {
      // Instant stream copy: no quality loss, preserves audio/video tracks perfectly!
      args.push("-c", "copy");
    } else {
      // Resolution scaling filter
      const scaleFilters: string[] = [];
      if (options.resolution !== "original") {
        const heightMap: Record<string, number> = {
          "4k": 2160,
          "1080p": 1080,
          "720p": 720,
          "480p": 480,
          "360p": 360,
        };
        const maxH = heightMap[options.resolution] || 720;
        scaleFilters.push(`scale=-2:'min(${maxH},ih)'`);
      }

      // Playback speed filter
      if (options.speed && options.speed !== 1) {
        scaleFilters.push(`setpts=${(1 / options.speed).toFixed(2)}*PTS`);
      }

      if (scaleFilters.length > 0) {
        args.push("-vf", scaleFilters.join(","));
      }

      // Target FPS
      if (options.fps && options.fps > 0) {
        args.push("-r", String(options.fps));
      }

      // Target video/audio codecs according to target format container
      if (targetFormat === "webm" || targetFormat === "webm-ls") {
        args.push("-c:v", "vp8", "-c:a", "vorbis");
      } else if (targetFormat === "avi" || targetFormat === "avi-ls") {
        args.push("-c:v", "mpeg4", "-c:a", "mp3");
      } else if (targetFormat === "flv" || targetFormat === "flv-ls") {
        args.push("-c:v", "flv", "-c:a", "mp3");
      } else if (targetFormat === "3gp" || targetFormat === "3gp-ls" || targetFormat === "3g2" || targetFormat === "3g2-ls") {
        args.push("-c:v", "h263", "-c:a", "amr_nb");
      } else {
        // MP4, MKV, MOV, M4V standard defaults
        args.push("-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac");
      }
    }
  }

  // Force overwrite output
  args.push("-y", outputVirtualName);

  onProgress?.(40, `Running transcode engine (${args.slice(1, 4).join(" ")})...`);

  try {
    const exitCode = await ffmpeg.exec(args);

    if (exitCode !== 0) {
      throw new Error(`FFmpeg transcode returned exit code ${exitCode}`);
    }

    if (signal?.aborted) {
      throw new Error("Conversion cancelled by user");
    }

    onProgress?.(90, "Extracting finalized media container...");

    const outputData = await ffmpeg.readFile(outputVirtualName);
    let outputBlob: Blob;
    if (outputData instanceof Uint8Array) {
      outputBlob = new Blob([outputData.buffer as ArrayBuffer], { type: formatInfo.mimeType });
    } else if (typeof outputData === "string") {
      outputBlob = new Blob([outputData], { type: formatInfo.mimeType });
    } else {
      outputBlob = new Blob([outputData as BlobPart], { type: formatInfo.mimeType });
    }

    onProgress?.(100, "Done");

    return {
      blob: outputBlob,
      mime: formatInfo.mimeType,
      fileName: outputFileName,
      url: URL.createObjectURL(outputBlob),
      duration: 0,
      width: 0,
      height: 0,
      fileSizeBytes: outputBlob.size,
      isAudio: formatInfo.category === "audio-extract" || ["mp3", "wav", "aac"].includes(targetFormat),
      isAnimation: targetFormat === "gif",
    };
  } finally {
    // Clean virtual MEMFS filesystem
    try {
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputVirtualName);
    } catch {
      // Ignored
    }
  }
}
