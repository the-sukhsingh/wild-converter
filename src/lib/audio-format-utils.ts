export type AudioFormat =
  | "mp3"
  | "wav"
  | "ogg"
  | "flac"
  | "aac"
  | "m4a"
  | "opus"
  | "wma"
  | "amr"
  | "ac3"
  | "ape"
  | "ra"
  | "rm"
  | "spx"
  | "tta"
  | "wv"
  | "dff"
  | "dsf"
  | "aiff"
  | "webm"
  // Lossless / specialized variants (-ls)
  | "mp3-ls"
  | "wav-ls"
  | "ogg-ls"
  | "flac-ls"
  | "aac-ls"
  | "m4a-ls"
  | "opus-ls"
  | "wma-ls"
  | "amr-ls"
  | "ac3-ls"
  | "ape-ls"
  | "ra-ls"
  | "rm-ls"
  | "spx-ls"
  | "tta-ls"
  | "wv-ls"
  | "dff-ls"
  | "dsf-ls";

export interface AudioFormatInfo {
  id: AudioFormat;
  label: string;
  extension: string;
  mimeType: string;
  category: "popular" | "lossless" | "compressed" | "audiophile" | "legacy";
  description: string;
  supportsBitrate: boolean;
  supportsQuality: boolean;
  supportsBitDepth: boolean;
  isLossless?: boolean;
}

export const AUDIO_FORMATS: Record<AudioFormat, AudioFormatInfo> = {
  mp3: {
    id: "mp3",
    label: "MP3",
    extension: "mp3",
    mimeType: "audio/mpeg",
    category: "popular",
    description: "MPEG Layer-3 Audio, universally compatible lossy standard",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  wav: {
    id: "wav",
    label: "WAV",
    extension: "wav",
    mimeType: "audio/wav",
    category: "lossless",
    description: "Waveform Audio File Format, uncompressed studio PCM",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  ogg: {
    id: "ogg",
    label: "OGG (Vorbis)",
    extension: "ogg",
    mimeType: "audio/ogg",
    category: "popular",
    description: "Ogg Vorbis open container, high quality at lower bitrates",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  flac: {
    id: "flac",
    label: "FLAC",
    extension: "flac",
    mimeType: "audio/flac",
    category: "lossless",
    description: "Free Lossless Audio Codec, pristine quality with ~50% compression",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  aac: {
    id: "aac",
    label: "AAC",
    extension: "aac",
    mimeType: "audio/aac",
    category: "popular",
    description: "Advanced Audio Coding, high efficiency Apple standard",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  m4a: {
    id: "m4a",
    label: "M4A (ALAC/AAC)",
    extension: "m4a",
    mimeType: "audio/mp4",
    category: "popular",
    description: "MPEG-4 Audio container, popular on iOS and macOS",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: true,
  },
  opus: {
    id: "opus",
    label: "OPUS",
    extension: "opus",
    mimeType: "audio/opus",
    category: "popular",
    description: "Modern IETF ultra-low latency & speech/music codec",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  wma: {
    id: "wma",
    label: "WMA",
    extension: "wma",
    mimeType: "audio/x-ms-wma",
    category: "legacy",
    description: "Windows Media Audio codec",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  amr: {
    id: "amr",
    label: "AMR",
    extension: "amr",
    mimeType: "audio/amr",
    category: "compressed",
    description: "Adaptive Multi-Rate speech audio codec for mobile voice",
    supportsBitrate: true,
    supportsQuality: false,
    supportsBitDepth: false,
  },
  ac3: {
    id: "ac3",
    label: "AC3 (Dolby Digital)",
    extension: "ac3",
    mimeType: "audio/ac3",
    category: "audiophile",
    description: "Dolby Digital surround audio stream",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  ape: {
    id: "ape",
    label: "APE (Monkey's Audio)",
    extension: "ape",
    mimeType: "audio/ape",
    category: "lossless",
    description: "Monkey's Audio lossless compression format",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  ra: {
    id: "ra",
    label: "RA (RealAudio)",
    extension: "ra",
    mimeType: "audio/x-realaudio",
    category: "legacy",
    description: "RealAudio streaming format",
    supportsBitrate: true,
    supportsQuality: false,
    supportsBitDepth: false,
  },
  rm: {
    id: "rm",
    label: "RM",
    extension: "rm",
    mimeType: "application/vnd.rn-realmedia",
    category: "legacy",
    description: "RealMedia audio container",
    supportsBitrate: true,
    supportsQuality: false,
    supportsBitDepth: false,
  },
  spx: {
    id: "spx",
    label: "SPX (Speex)",
    extension: "spx",
    mimeType: "audio/speex",
    category: "compressed",
    description: "Speex voice compression codec",
    supportsBitrate: true,
    supportsQuality: false,
    supportsBitDepth: false,
  },
  tta: {
    id: "tta",
    label: "TTA (True Audio)",
    extension: "tta",
    mimeType: "audio/tta",
    category: "lossless",
    description: "True Audio real-time lossless codec",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  wv: {
    id: "wv",
    label: "WV (WavPack)",
    extension: "wv",
    mimeType: "audio/wavpack",
    category: "lossless",
    description: "WavPack hybrid lossless audio compression",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  dff: {
    id: "dff",
    label: "DFF (DSD)",
    extension: "dff",
    mimeType: "audio/dff",
    category: "audiophile",
    description: "Direct Stream Digital DSD audio file format",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  dsf: {
    id: "dsf",
    label: "DSF (DSD)",
    extension: "dsf",
    mimeType: "audio/dsf",
    category: "audiophile",
    description: "Sony Direct Stream Digital container with ID3 metadata",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  aiff: {
    id: "aiff",
    label: "AIFF",
    extension: "aiff",
    mimeType: "audio/aiff",
    category: "lossless",
    description: "Audio Interchange File Format, Apple PCM standard",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  webm: {
    id: "webm",
    label: "WebM Audio",
    extension: "weba",
    mimeType: "audio/webm",
    category: "popular",
    description: "WebM container with Opus audio encoding",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },

  // Lossless variant presets
  "mp3-ls": {
    id: "mp3-ls",
    label: "MP3 (320k Max)",
    extension: "mp3",
    mimeType: "audio/mpeg",
    category: "popular",
    description: "Maximum quality MP3 at 320kbps CBR with high-res resampling",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  "wav-ls": {
    id: "wav-ls",
    label: "WAV (24-bit Studio)",
    extension: "wav",
    mimeType: "audio/wav",
    category: "lossless",
    description: "24-bit 96kHz master grade PCM studio WAV",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  "ogg-ls": {
    id: "ogg-ls",
    label: "OGG (Q10 Max)",
    extension: "ogg",
    mimeType: "audio/ogg",
    category: "popular",
    description: "Ogg Vorbis at maximum Q10 profile (~500kbps)",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  "flac-ls": {
    id: "flac-ls",
    label: "FLAC (24-bit Studio)",
    extension: "flac",
    mimeType: "audio/flac",
    category: "lossless",
    description: "24-bit FLAC lossless studio compression",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  "aac-ls": {
    id: "aac-ls",
    label: "AAC (320k High)",
    extension: "aac",
    mimeType: "audio/aac",
    category: "popular",
    description: "High bitrate AAC-LC profile at 320kbps",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  "m4a-ls": {
    id: "m4a-ls",
    label: "M4A (ALAC Lossless)",
    extension: "m4a",
    mimeType: "audio/mp4",
    category: "lossless",
    description: "Apple Lossless Audio Codec (ALAC) stream in M4A",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  "opus-ls": {
    id: "opus-ls",
    label: "OPUS (510k Studio)",
    extension: "opus",
    mimeType: "audio/opus",
    category: "popular",
    description: "Maximum bitrate Opus full-band music profile",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  "wma-ls": {
    id: "wma-ls",
    label: "WMA Lossless",
    extension: "wma",
    mimeType: "audio/x-ms-wma",
    category: "lossless",
    description: "WMA 9.2 Lossless audio container",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  "amr-ls": {
    id: "amr-ls",
    label: "AMR-WB (Wideband)",
    extension: "amr",
    mimeType: "audio/amr-wb",
    category: "compressed",
    description: "Adaptive Multi-Rate Wideband high clarity speech",
    supportsBitrate: true,
    supportsQuality: false,
    supportsBitDepth: false,
  },
  "ac3-ls": {
    id: "ac3-ls",
    label: "AC3 (640k Surround)",
    extension: "ac3",
    mimeType: "audio/ac3",
    category: "audiophile",
    description: "Dolby Digital at maximum standard 640kbps bitrate",
    supportsBitrate: true,
    supportsQuality: true,
    supportsBitDepth: false,
  },
  "ape-ls": {
    id: "ape-ls",
    label: "APE (Extra Fine)",
    extension: "ape",
    mimeType: "audio/ape",
    category: "lossless",
    description: "Monkey's Audio extra-fine lossless compression mode",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  "ra-ls": {
    id: "ra-ls",
    label: "RA Lossless",
    extension: "ra",
    mimeType: "audio/x-realaudio",
    category: "legacy",
    description: "RealAudio Lossless stream format",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  "rm-ls": {
    id: "rm-ls",
    label: "RM-HD",
    extension: "rm",
    mimeType: "application/vnd.rn-realmedia",
    category: "legacy",
    description: "RealMedia High Definition audio stream",
    supportsBitrate: true,
    supportsQuality: false,
    supportsBitDepth: false,
  },
  "spx-ls": {
    id: "spx-ls",
    label: "SPX Ultra-Wideband",
    extension: "spx",
    mimeType: "audio/speex",
    category: "compressed",
    description: "Speex 32kHz Ultra-Wideband mode",
    supportsBitrate: true,
    supportsQuality: false,
    supportsBitDepth: false,
  },
  "tta-ls": {
    id: "tta-ls",
    label: "TTA (24-bit Studio)",
    extension: "tta",
    mimeType: "audio/tta",
    category: "lossless",
    description: "True Audio 24-bit master recording container",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  "wv-ls": {
    id: "wv-ls",
    label: "WV (32-bit Float)",
    extension: "wv",
    mimeType: "audio/wavpack",
    category: "lossless",
    description: "WavPack 32-bit floating point high dynamic range",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  "dff-ls": {
    id: "dff-ls",
    label: "DFF (DSD256 Master)",
    extension: "dff",
    mimeType: "audio/dff",
    category: "audiophile",
    description: "DSD256 11.2MHz Ultra-High-Resolution Direct Stream Digital",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
  "dsf-ls": {
    id: "dsf-ls",
    label: "DSF (DSD512 Studio)",
    extension: "dsf",
    mimeType: "audio/dsf",
    category: "audiophile",
    description: "DSD512 22.5MHz Master Reference Direct Stream Digital",
    supportsBitrate: false,
    supportsQuality: false,
    supportsBitDepth: true,
    isLossless: true,
  },
};

export const AUDIO_EXTENSIONS: Record<string, AudioFormat> = {
  mp3: "mp3",
  wav: "wav",
  wave: "wav",
  ogg: "ogg",
  oga: "ogg",
  flac: "flac",
  aac: "aac",
  m4a: "m4a",
  mp4a: "m4a",
  opus: "opus",
  wma: "wma",
  amr: "amr",
  ac3: "ac3",
  ape: "ape",
  mac: "ape",
  ra: "ra",
  ram: "ra",
  rm: "rm",
  spx: "spx",
  tta: "tta",
  wv: "wv",
  dff: "dff",
  dsf: "dsf",
  aiff: "aiff",
  aif: "aiff",
  aifc: "aiff",
  weba: "webm",
  webm: "webm",
  mid: "wav",
  midi: "wav",
};

export function detectAudioFormat(file: File): AudioFormat | null {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";
  
  if (AUDIO_EXTENSIONS[ext]) {
    return AUDIO_EXTENSIONS[ext];
  }
  
  const type = file.type.toLowerCase();
  if (type.includes("audio/mpeg") || type.includes("audio/mp3")) return "mp3";
  if (type.includes("audio/wav") || type.includes("audio/wave")) return "wav";
  if (type.includes("audio/ogg") || type.includes("audio/vorbis")) return "ogg";
  if (type.includes("audio/flac")) return "flac";
  if (type.includes("audio/aac")) return "aac";
  if (type.includes("audio/mp4") || type.includes("audio/x-m4a")) return "m4a";
  if (type.includes("audio/opus")) return "opus";
  if (type.includes("audio/aiff") || type.includes("audio/x-aiff")) return "aiff";
  if (type.includes("audio/webm")) return "webm";

  return null;
}

export function isAudioFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  const ext = file.name.toLowerCase().split(".").pop() || "";
  return Boolean(AUDIO_EXTENSIONS[ext]);
}
