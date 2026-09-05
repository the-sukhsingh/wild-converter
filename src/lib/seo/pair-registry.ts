import { getFormatSpec, getAllRegisteredFormats } from "./format-registry";
import { TIER1_CONVERSION_PAIRS, TIER1_FORMAT_HUBS } from "./constants";
import type { ConverterCategory, ConversionLinkItem, FormatHubLinkItem } from "./types";

/** Normalizes aliases to canonical IDs (e.g. jpeg -> jpg) */
export function normalizeFormatId(raw: string): string {
  const clean = raw.toLowerCase().trim().replace(/^\./, "");
  if (clean === "jpeg") return "jpg";
  if (clean === "markdown") return "md";
  if (clean === "tif") return "tiff";
  if (clean === "htm") return "html";
  return clean;
}

/** Check if two formats can validly convert */
export function isValidConversion(fromId: string, toId: string): boolean {
  const from = getFormatSpec(normalizeFormatId(fromId));
  const to = getFormatSpec(normalizeFormatId(toId));

  if (!from || !to) return false;
  if (from.id === to.id) return false; // same format is not a conversion

  // 1. Same category conversion is always allowed
  if (from.category === to.category) return true;

  // 2. Cross-category valid matrix:
  // - Images -> PDF (Documents)
  if (from.category === "images" && to.id === "pdf") return true;
  // - Vectors (SVG) -> Raster Images (PNG, JPG, WebP)
  if (from.id === "svg" && ["png", "jpg", "webp", "pdf"].includes(to.id)) return true;
  // - Video -> Audio extraction (MP4/MOV/MKV -> MP3/WAV/AAC)
  if (from.category === "video" && ["mp3", "wav", "aac"].includes(to.id)) return true;
  // - Video -> GIF (animation)
  if (from.category === "video" && to.id === "gif") return true;
  // - Documents -> PDF
  if (from.category === "documents" && to.id === "pdf") return true;
  // - PDF -> Images (PNG/JPG)
  if (from.id === "pdf" && ["png", "jpg", "docx", "txt"].includes(to.id)) return true;

  return false;
}

/** Parse route parameter slug: either a pair "from-to-to" or a single format "format" */
export function parseRouteSlug(slug: string): 
  | { type: "pair"; from: string; to: string }
  | { type: "format"; format: string }
  | null {
  const parts = slug.toLowerCase().split("-to-");

  if (parts.length === 2) {
    const from = normalizeFormatId(parts[0]);
    const to = normalizeFormatId(parts[1]);
    if (isValidConversion(from, to)) {
      return { type: "pair", from, to };
    }
  }

  // Single format hub check
  const single = normalizeFormatId(slug);
  const spec = getFormatSpec(single);
  if (spec) {
    return { type: "format", format: spec.id };
  }

  return null;
}

/** Get list of all valid outbound conversions from a format */
export function getOutboundConversions(fromId: string, limit = 16): ConversionLinkItem[] {
  const fromSpec = getFormatSpec(fromId);
  if (!fromSpec) return [];

  const all = getAllRegisteredFormats();
  const valid = all
    .filter((toSpec) => isValidConversion(fromSpec.id, toSpec.id))
    .slice(0, limit);

  return valid.map((toSpec) => ({
    from: fromSpec.id,
    to: toSpec.id,
    label: `${fromSpec.extension.toUpperCase()} to ${toSpec.extension.toUpperCase()}`,
    slug: `${fromSpec.extension}-to-${toSpec.extension}`,
    category: fromSpec.category,
  }));
}

/** Get list of all valid inbound conversions targeting a format */
export function getInboundConversions(toId: string, limit = 16): ConversionLinkItem[] {
  const toSpec = getFormatSpec(toId);
  if (!toSpec) return [];

  const all = getAllRegisteredFormats();
  const valid = all
    .filter((fromSpec) => isValidConversion(fromSpec.id, toSpec.id))
    .slice(0, limit);

  return valid.map((fromSpec) => ({
    from: fromSpec.id,
    to: toSpec.id,
    label: `${fromSpec.extension.toUpperCase()} to ${toSpec.extension.toUpperCase()}`,
    slug: `${fromSpec.extension}-to-${toSpec.extension}`,
    category: fromSpec.category,
  }));
}

/** Get sibling formats within the same category */
export function getSiblingFormats(formatId: string, limit = 10): FormatHubLinkItem[] {
  const spec = getFormatSpec(formatId);
  if (!spec) return [];

  const siblings = getAllRegisteredFormats()
    .filter((f) => f.category === spec.category && f.id !== spec.id)
    .slice(0, limit);

  return siblings.map((f) => ({
    id: f.id,
    name: f.name,
    extension: f.extension,
    slug: f.extension,
    category: f.category,
  }));
}

/**
 * Generates static params for Tier-1 routes at build time.
 * Keeps builds under 15s while guaranteeing instant first load for top queries.
 */
export function getStaticParamsForBuild(): { slug: string }[] {
  const params: { slug: string }[] = [];

  // Top conversion pairs
  for (const pair of TIER1_CONVERSION_PAIRS) {
    if (isValidConversion(pair.from, pair.to)) {
      params.push({ slug: `${pair.from}-to-${pair.to}` });
    }
  }

  // Top format hubs
  for (const fmt of TIER1_FORMAT_HUBS) {
    if (getFormatSpec(fmt)) {
      params.push({ slug: fmt });
    }
  }

  return params;
}
