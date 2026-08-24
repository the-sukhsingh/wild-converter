export type ArchiveFormat =
  | "zip"
  | "tar"
  | "gz"
  | "tgz"
  | "7z"
  | "bz2"
  | "xz"
  | "iso"
  | "dmg"
  | "cab"
  | "jar"
  | "apk"
  | "deb"
  | "rpm"
  // Lossless / Master variants (-ls)
  | "zip-ls"
  | "tar-ls"
  | "gz-ls"
  | "7z-ls"
  | "bz2-ls"
  | "xz-ls"
  | "iso-ls"
  | "dmg-ls"
  | "cab-ls"
  | "jar-ls"
  | "apk-ls"
  | "deb-ls"
  | "rpm-ls";

export interface ArchiveFormatInfo {
  id: ArchiveFormat;
  label: string;
  extension: string;
  mimeType: string;
  category: "universal" | "unix" | "package" | "disk";
  description: string;
  supportsCompressionLevel: boolean;
  isLossless?: boolean;
}

export const ARCHIVE_FORMATS: Record<ArchiveFormat, ArchiveFormatInfo> = {
  zip: {
    id: "zip",
    label: "ZIP Archive",
    extension: "zip",
    mimeType: "application/zip",
    category: "universal",
    description: "Universal Deflate archive supported natively across Windows, macOS and Linux",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  tar: {
    id: "tar",
    label: "TAR (Tape Archive)",
    extension: "tar",
    mimeType: "application/x-tar",
    category: "unix",
    description: "Standard POSIX tape archive packaging files with permission masks",
    supportsCompressionLevel: false,
    isLossless: true,
  },
  tgz: {
    id: "tgz",
    label: "TAR.GZ (TGZ)",
    extension: "tar.gz",
    mimeType: "application/gzip",
    category: "unix",
    description: "Tarball compressed with GNU Gzip Deflate algorithm",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  gz: {
    id: "gz",
    label: "GZIP (.gz)",
    extension: "gz",
    mimeType: "application/gzip",
    category: "unix",
    description: "Single-file Gzip stream compression container",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  "7z": {
    id: "7z",
    label: "7-Zip (7z Archive)",
    extension: "7z",
    mimeType: "application/x-7z-compressed",
    category: "universal",
    description: "High-ratio LZMA/LZMA2 solid archive container",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  bz2: {
    id: "bz2",
    label: "BZIP2 (.bz2)",
    extension: "bz2",
    mimeType: "application/x-bzip2",
    category: "unix",
    description: "Burrows-Wheeler block sorting compression algorithm",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  xz: {
    id: "xz",
    label: "XZ (.xz)",
    extension: "xz",
    mimeType: "application/x-xz",
    category: "unix",
    description: "LZMA2 high ratio compression standard for Linux distribution packages",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  iso: {
    id: "iso",
    label: "ISO (CD/DVD Image)",
    extension: "iso",
    mimeType: "application/x-iso9660-image",
    category: "disk",
    description: "ISO 9660 standard optical disc image archive",
    supportsCompressionLevel: false,
    isLossless: true,
  },
  dmg: {
    id: "dmg",
    label: "DMG (Apple Disk Image)",
    extension: "dmg",
    mimeType: "application/x-apple-diskimage",
    category: "disk",
    description: "Apple macOS mountable disk image container",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  cab: {
    id: "cab",
    label: "CAB (Cabinet)",
    extension: "cab",
    mimeType: "application/vnd.ms-cab-compressed",
    category: "universal",
    description: "Microsoft Cabinet software distribution archive",
    supportsCompressionLevel: true,
  },
  jar: {
    id: "jar",
    label: "JAR (Java Archive)",
    extension: "jar",
    mimeType: "application/java-archive",
    category: "package",
    description: "Java application and library archive with manifest",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  apk: {
    id: "apk",
    label: "APK (Android Package)",
    extension: "apk",
    mimeType: "application/vnd.android.package-archive",
    category: "package",
    description: "Android application bundle container",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  deb: {
    id: "deb",
    label: "DEB (Debian Package)",
    extension: "deb",
    mimeType: "application/vnd.debian.binary-package",
    category: "package",
    description: "Debian and Ubuntu binary package ar/tar archive",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  rpm: {
    id: "rpm",
    label: "RPM (Red Hat Package)",
    extension: "rpm",
    mimeType: "application/x-rpm",
    category: "package",
    description: "Red Hat Enterprise Linux / Fedora package format",
    supportsCompressionLevel: true,
    isLossless: true,
  },

  // Lossless presets (-ls)
  "zip-ls": {
    id: "zip-ls",
    label: "ZIP Maximum Compression (Level 9)",
    extension: "zip",
    mimeType: "application/zip",
    category: "universal",
    description: "Maximum Deflate level 9 with 64KB window optimization",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  "tar-ls": {
    id: "tar-ls",
    label: "TAR POSIX Ustar Master",
    extension: "tar",
    mimeType: "application/x-tar",
    category: "unix",
    description: "Uncompressed POSIX.1-1988 ustar tar archive",
    supportsCompressionLevel: false,
    isLossless: true,
  },
  "gz-ls": {
    id: "gz-ls",
    label: "GZ Ultra Deflate",
    extension: "gz",
    mimeType: "application/gzip",
    category: "unix",
    description: "Maximum gzip compression with header CRC32 validation",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  "7z-ls": {
    id: "7z-ls",
    label: "7z LZMA2 Ultra Solid",
    extension: "7z",
    mimeType: "application/x-7z-compressed",
    category: "universal",
    description: "Maximum solid block size LZMA2 compression",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  "bz2-ls": {
    id: "bz2-ls",
    label: "BZIP2 900k Block Master",
    extension: "bz2",
    mimeType: "application/x-bzip2",
    category: "unix",
    description: "900k block size Bzip2 maximum compression",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  "xz-ls": {
    id: "xz-ls",
    label: "XZ Extreme Preset (-9e)",
    extension: "xz",
    mimeType: "application/x-xz",
    category: "unix",
    description: "Extreme compression level XZ with 64MB dictionary",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  "iso-ls": {
    id: "iso-ls",
    label: "ISO 9660 Master Image",
    extension: "iso",
    mimeType: "application/x-iso9660-image",
    category: "disk",
    description: "Bit-exact optical disk image",
    supportsCompressionLevel: false,
    isLossless: true,
  },
  "dmg-ls": {
    id: "dmg-ls",
    label: "DMG zlib Compressed Master",
    extension: "dmg",
    mimeType: "application/x-apple-diskimage",
    category: "disk",
    description: "Apple UDZO compressed disk image",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  "cab-ls": {
    id: "cab-ls",
    label: "CAB LZX Master",
    extension: "cab",
    mimeType: "application/vnd.ms-cab-compressed",
    category: "universal",
    description: "Maximum compression MSZIP cabinet container",
    supportsCompressionLevel: true,
  },
  "jar-ls": {
    id: "jar-ls",
    label: "JAR Optimized Package",
    extension: "jar",
    mimeType: "application/java-archive",
    category: "package",
    description: "Standard Java archive with normalized directories",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  "apk-ls": {
    id: "apk-ls",
    label: "APK Zipalign 4-byte Master",
    extension: "apk",
    mimeType: "application/vnd.android.package-archive",
    category: "package",
    description: "Optimized Android package with 4-byte memory boundary alignment",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  "deb-ls": {
    id: "deb-ls",
    label: "DEB xz Master Package",
    extension: "deb",
    mimeType: "application/vnd.debian.binary-package",
    category: "package",
    description: "Debian package with maximum data.tar.xz compression",
    supportsCompressionLevel: true,
    isLossless: true,
  },
  "rpm-ls": {
    id: "rpm-ls",
    label: "RPM cpio.xz Master",
    extension: "rpm",
    mimeType: "application/x-rpm",
    category: "package",
    description: "RPM package with extreme xz compression payload",
    supportsCompressionLevel: true,
    isLossless: true,
  },
};

export const ARCHIVE_EXTENSIONS: Record<string, ArchiveFormat> = {
  zip: "zip",
  tar: "tar",
  gz: "gz",
  tgz: "tgz",
  "tar.gz": "tgz",
  "7z": "7z",
  rar: "zip", // unpack/repack to zip
  bz2: "bz2",
  tbz2: "bz2",
  xz: "xz",
  txz: "xz",
  iso: "iso",
  dmg: "dmg",
  cab: "cab",
  jar: "jar",
  war: "jar",
  ear: "jar",
  apk: "apk",
  ipa: "zip",
  deb: "deb",
  rpm: "rpm",
};

export function detectArchiveFormat(file: File): ArchiveFormat | null {
  const name = file.name.toLowerCase();
  const parts = name.split(".");
  const ext = parts.pop() || "";
  const secondExt = parts.length > 0 ? parts.pop() : "";

  if (secondExt === "tar" && ext === "gz") return "tgz";
  if (ARCHIVE_EXTENSIONS[ext]) return ARCHIVE_EXTENSIONS[ext];

  const type = file.type.toLowerCase();
  if (type.includes("zip")) return "zip";
  if (type.includes("tar")) return "tar";
  if (type.includes("gzip")) return "gz";
  if (type.includes("7z")) return "7z";

  return null;
}

export function isArchiveFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";
  return Boolean(ARCHIVE_EXTENSIONS[ext]) || file.type.includes("zip") || file.type.includes("tar") || file.type.includes("compressed");
}
