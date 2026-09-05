import type { MetadataRoute } from "next";
import { getAllRegisteredFormats } from "@/lib/seo/format-registry";
import { isValidConversion } from "@/lib/seo/pair-registry";
import { SITE_URL } from "@/lib/seo/constants";

const CHUNK_SIZE = 25000;

function getAllSitemapUrls(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  const now = new Date();

  // 1. Core Hub & Category Routes
  const coreRoutes = [
    "",
    "/convert",
    "/images",
    "/documents",
    "/audio",
    "/video",
    "/vector",
    "/3d",
    "/fonts",
    "/archive",
    "/code",
  ];

  for (const route of coreRoutes) {
    urls.push({
      url: `${SITE_URL}${route}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: route === "" ? 1.0 : 0.9,
    });
  }

  // 2. Format Hub Routes
  const allFormats = getAllRegisteredFormats();
  for (const fmt of allFormats) {
    urls.push({
      url: `${SITE_URL}/convert/${fmt.extension}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // 3. All Valid Programmatic Conversion Pair Routes
  const seenSlugs = new Set<string>();
  for (const from of allFormats) {
    for (const to of allFormats) {
      if (isValidConversion(from.id, to.id)) {
        const slug = `${from.extension}-to-${to.extension}`;
        if (!seenSlugs.has(slug)) {
          seenSlugs.add(slug);
          urls.push({
            url: `${SITE_URL}/convert/${slug}`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      }
    }
  }

  return urls;
}

/**
 * Next.js 16 chunked sitemaps for scaling to 50,000+ programmatic SEO URLs
 */
export async function generateSitemaps() {
  const allUrls = getAllSitemapUrls();
  const chunkCount = Math.max(1, Math.ceil(allUrls.length / CHUNK_SIZE));

  return Array.from({ length: chunkCount }, (_, index) => ({
    id: index.toString(),
  }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const allUrls = getAllSitemapUrls();

  const start = id * CHUNK_SIZE;
  const end = start + CHUNK_SIZE;

  return allUrls.slice(start, end);
}
