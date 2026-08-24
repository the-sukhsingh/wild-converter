export type VideoFormat =
  | "mp4"
  | "webm"
  | "mkv"
  | "avi"
  | "mov"
  | "gif"
  | "flv"
  | "wmv"
  | "m4v"
  | "3gp"
  | "3g2"
  | "ogv"
  | "mpg"
  | "mpeg"
  | "asf"
  | "rmvb"
  | "vob"
  | "evo"
  | "mp3"
  | "wav"
  | "aac"
  // Lossless / specialized variants (-ls)
  | "webm-ls"
  | "avi-ls"
  | "mkv-ls"
  | "mov-ls"
  | "flv-ls"
  | "wmv-ls"
  | "m4v-ls"
  | "3gp-ls"
  | "3g2-ls"
  | "ogv-ls"
  | "mpg-ls"
  | "mpeg-ls"
  | "asf-ls"
  | "rmvb-ls"
  | "vob-ls"
  | "evo-ls";

export interface VideoFormatInfo {
  id: VideoFormat;
  label: string;
  extension: string;
  mimeType: string;
  category: "popular" | "animation" | "modern" | "mobile" | "legacy" | "audio-extract";
  description: string;
  supportsResolution: boolean;
  supportsFps: boolean;
  isLossless?: boolean;
}

export const VIDEO_FORMATS: Record<VideoFormat, VideoFormatInfo> = {
  mp4: {
    id: "mp4",
    label: "MP4 (H.264 / AAC)",
    extension: "mp4",
    mimeType: "video/mp4",
    category: "popular",
    description: "Universal video standard compatible across all devices and browsers",
    supportsResolution: true,
    supportsFps: true,
  },
  webm: {
    id: "webm",
    label: "WebM (VP9 / Opus)",
    extension: "webm",
    mimeType: "video/webm",
    category: "popular",
    description: "Open modern web video container with superior streaming compression",
    supportsResolution: true,
    supportsFps: true,
  },
  gif: {
    id: "gif",
    label: "Animated GIF",
    extension: "gif",
    mimeType: "image/gif",
    category: "animation",
    description: "Looping animated GIF image for social media and embeds",
    supportsResolution: true,
    supportsFps: true,
  },
  mov: {
    id: "mov",
    label: "QuickTime MOV",
    extension: "mov",
    mimeType: "video/quicktime",
    category: "popular",
    description: "Apple QuickTime high bitrate production video container",
    supportsResolution: true,
    supportsFps: true,
  },
  mkv: {
    id: "mkv",
    label: "MKV (Matroska)",
    extension: "mkv",
    mimeType: "video/x-matroska",
    category: "modern",
    description: "Matroska multimedia container supporting unlimited audio & subtitles",
    supportsResolution: true,
    supportsFps: true,
  },
  avi: {
    id: "avi",
    label: "AVI",
    extension: "avi",
    mimeType: "video/x-msvideo",
    category: "legacy",
    description: "Audio Video Interleave container for Windows platforms",
    supportsResolution: true,
    supportsFps: true,
  },
  wmv: {
    id: "wmv",
    label: "WMV",
    extension: "wmv",
    mimeType: "video/x-ms-wmv",
    category: "legacy",
    description: "Windows Media Video compressed container",
    supportsResolution: true,
    supportsFps: true,
  },
  flv: {
    id: "flv",
    label: "FLV (Flash Video)",
    extension: "flv",
    mimeType: "video/x-flv",
    category: "legacy",
    description: "Adobe Flash streaming video format",
    supportsResolution: true,
    supportsFps: true,
  },
  m4v: {
    id: "m4v",
    label: "M4V (iTunes Video)",
    extension: "m4v",
    mimeType: "video/x-m4v",
    category: "popular",
    description: "Apple iTunes video format container",
    supportsResolution: true,
    supportsFps: true,
  },
  "3gp": {
    id: "3gp",
    label: "3GP (Mobile)",
    extension: "3gp",
    mimeType: "video/3gpp",
    category: "mobile",
    description: "Third Generation Partnership Project compact mobile video",
    supportsResolution: true,
    supportsFps: true,
  },
  "3g2": {
    id: "3g2",
    label: "3G2 (3GPP2)",
    extension: "3g2",
    mimeType: "video/3gpp2",
    category: "mobile",
    description: "CDMA-based mobile phone multimedia format",
    supportsResolution: true,
    supportsFps: true,
  },
  ogv: {
    id: "ogv",
    label: "OGV (Ogg Theora)",
    extension: "ogv",
    mimeType: "video/ogg",
    category: "modern",
    description: "Ogg Theora open source video stream",
    supportsResolution: true,
    supportsFps: true,
  },
  mpg: {
    id: "mpg",
    label: "MPG (MPEG-1)",
    extension: "mpg",
    mimeType: "video/mpeg",
    category: "legacy",
    description: "MPEG-1 video standard",
    supportsResolution: true,
    supportsFps: true,
  },
  mpeg: {
    id: "mpeg",
    label: "MPEG (MPEG-2)",
    extension: "mpeg",
    mimeType: "video/mpeg",
    category: "legacy",
    description: "MPEG-2 broadcast standard video format",
    supportsResolution: true,
    supportsFps: true,
  },
  asf: {
    id: "asf",
    label: "ASF (Advanced Systems)",
    extension: "asf",
    mimeType: "video/x-ms-asf",
    category: "legacy",
    description: "Microsoft Advanced Systems streaming format",
    supportsResolution: true,
    supportsFps: true,
  },
  rmvb: {
    id: "rmvb",
    label: "RMVB (RealMedia)",
    extension: "rmvb",
    mimeType: "application/vnd.rn-realmedia-vbr",
    category: "legacy",
    description: "RealMedia Variable Bitrate video format",
    supportsResolution: true,
    supportsFps: true,
  },
  vob: {
    id: "vob",
    label: "VOB (DVD Video)",
    extension: "vob",
    mimeType: "video/x-ms-vob",
    category: "legacy",
    description: "DVD Video Object container with MPEG-2 streams",
    supportsResolution: true,
    supportsFps: true,
  },
  evo: {
    id: "evo",
    label: "EVO (HD-DVD)",
    extension: "evo",
    mimeType: "video/x-ms-evo",
    category: "legacy",
    description: "Enhanced Video Object HD-DVD format",
    supportsResolution: true,
    supportsFps: true,
  },
  // Audio extractors
  mp3: {
    id: "mp3",
    label: "Extract MP3 Audio",
    extension: "mp3",
    mimeType: "audio/mpeg",
    category: "audio-extract",
    description: "Extract pure MP3 audio soundtrack from video",
    supportsResolution: false,
    supportsFps: false,
  },
  wav: {
    id: "wav",
    label: "Extract WAV Audio",
    extension: "wav",
    mimeType: "audio/wav",
    category: "audio-extract",
    description: "Extract uncompressed PCM WAV audio track",
    supportsResolution: false,
    supportsFps: false,
    isLossless: true,
  },
  aac: {
    id: "aac",
    label: "Extract AAC Audio",
    extension: "aac",
    mimeType: "audio/aac",
    category: "audio-extract",
    description: "Extract high efficiency AAC audio stream",
    supportsResolution: false,
    supportsFps: false,
  },

  // Lossless presets (-ls)
  "webm-ls": {
    id: "webm-ls",
    label: "WebM Lossless (VP9 Constant Quality)",
    extension: "webm",
    mimeType: "video/webm",
    category: "modern",
    description: "VP9 lossless profile with lossless Opus audio track",
    supportsResolution: true,
    supportsFps: true,
    isLossless: true,
  },
  "mkv-ls": {
    id: "mkv-ls",
    label: "MKV Master Lossless",
    extension: "mkv",
    mimeType: "video/x-matroska",
    category: "modern",
    description: "Studio archive Matroska container with zero compression artifacts",
    supportsResolution: true,
    supportsFps: true,
    isLossless: true,
  },
  "mov-ls": {
    id: "mov-ls",
    label: "MOV ProRes / Lossless",
    extension: "mov",
    mimeType: "video/quicktime",
    category: "popular",
    description: "Apple QuickTime master studio container",
    supportsResolution: true,
    supportsFps: true,
    isLossless: true,
  },
  "avi-ls": {
    id: "avi-ls",
    label: "AVI Uncompressed",
    extension: "avi",
    mimeType: "video/x-msvideo",
    category: "legacy",
    description: "Raw uncompressed RGB/YUV AVI video container",
    supportsResolution: true,
    supportsFps: true,
    isLossless: true,
  },
  "flv-ls": {
    id: "flv-ls",
    label: "FLV Lossless",
    extension: "flv",
    mimeType: "video/x-flv",
    category: "legacy",
    description: "Flash lossless container",
    supportsResolution: true,
    supportsFps: true,
    isLossless: true,
  },
  "wmv-ls": {
    id: "wmv-ls",
    label: "WMV9 Lossless",
    extension: "wmv",
    mimeType: "video/x-ms-wmv",
    category: "legacy",
    description: "Windows Media Video lossless compression",
    supportsResolution: true,
    supportsFps: true,
    isLossless: true,
  },
  "m4v-ls": {
    id: "m4v-ls",
    label: "M4V Studio Master",
    extension: "m4v",
    mimeType: "video/x-m4v",
    category: "popular",
    description: "M4V master studio profile",
    supportsResolution: true,
    supportsFps: true,
    isLossless: true,
  },
  "3gp-ls": {
    id: "3gp-ls",
    label: "3GP High-Res",
    extension: "3gp",
    mimeType: "video/3gpp",
    category: "mobile",
    description: "3GPP maximum resolution mobile profile",
    supportsResolution: true,
    supportsFps: true,
  },
  "3g2-ls": {
    id: "3g2-ls",
    label: "3G2 High-Res",
    extension: "3g2",
    mimeType: "video/3gpp2",
    category: "mobile",
    description: "3GPP2 maximum resolution mobile profile",
    supportsResolution: true,
    supportsFps: true,
  },
  "ogv-ls": {
    id: "ogv-ls",
    label: "OGV Master",
    extension: "ogv",
    mimeType: "video/ogg",
    category: "modern",
    description: "Ogg Theora maximum quality stream",
    supportsResolution: true,
    supportsFps: true,
  },
  "mpg-ls": {
    id: "mpg-ls",
    label: "MPG Broadcast",
    extension: "mpg",
    mimeType: "video/mpeg",
    category: "legacy",
    description: "MPEG studio broadcast container",
    supportsResolution: true,
    supportsFps: true,
  },
  "mpeg-ls": {
    id: "mpeg-ls",
    label: "MPEG-2 Master",
    extension: "mpeg",
    mimeType: "video/mpeg",
    category: "legacy",
    description: "MPEG-2 master video format",
    supportsResolution: true,
    supportsFps: true,
  },
  "asf-ls": {
    id: "asf-ls",
    label: "ASF Master",
    extension: "asf",
    mimeType: "video/x-ms-asf",
    category: "legacy",
    description: "Advanced Systems Format master stream",
    supportsResolution: true,
    supportsFps: true,
  },
  "rmvb-ls": {
    id: "rmvb-ls",
    label: "RMVB Master",
    extension: "rmvb",
    mimeType: "application/vnd.rn-realmedia-vbr",
    category: "legacy",
    description: "RealMedia high bitrate profile",
    supportsResolution: true,
    supportsFps: true,
  },
  "vob-ls": {
    id: "vob-ls",
    label: "VOB Master",
    extension: "vob",
    mimeType: "video/x-ms-vob",
    category: "legacy",
    description: "DVD master object video container",
    supportsResolution: true,
    supportsFps: true,
  },
  "evo-ls": {
    id: "evo-ls",
    label: "EVO Master",
    extension: "evo",
    mimeType: "video/x-ms-evo",
    category: "legacy",
    description: "HD-DVD master video object container",
    supportsResolution: true,
    supportsFps: true,
  },
};

export const VIDEO_EXTENSIONS: Record<string, VideoFormat> = {
  mp4: "mp4",
  m4v: "m4v",
  webm: "webm",
  mkv: "mkv",
  avi: "avi",
  mov: "mov",
  qt: "mov",
  gif: "gif",
  flv: "flv",
  wmv: "wmv",
  "3gp": "3gp",
  "3g2": "3g2",
  ogv: "ogv",
  ogg: "ogv",
  mpg: "mpg",
  mpeg: "mpeg",
  asf: "asf",
  rmvb: "rmvb",
  rm: "rmvb",
  vob: "vob",
  evo: "evo",
  ts: "mp4",
  m2ts: "mp4",
  mts: "mp4",
};

export function detectVideoFormat(file: File): VideoFormat | null {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";
  
  if (VIDEO_EXTENSIONS[ext]) {
    return VIDEO_EXTENSIONS[ext];
  }
  
  const type = file.type.toLowerCase();
  if (type.includes("video/mp4")) return "mp4";
  if (type.includes("video/webm")) return "webm";
  if (type.includes("video/quicktime")) return "mov";
  if (type.includes("video/x-matroska")) return "mkv";
  if (type.includes("video/x-msvideo")) return "avi";
  if (type.includes("image/gif")) return "gif";
  if (type.includes("video/ogg")) return "ogv";

  return null;
}

export function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  const ext = file.name.toLowerCase().split(".").pop() || "";
  return Boolean(VIDEO_EXTENSIONS[ext]);
}
