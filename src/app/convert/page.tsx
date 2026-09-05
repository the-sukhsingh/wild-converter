import type { Metadata } from "next";
import Link from "next/link";
import { getAllRegisteredFormats } from "@/lib/seo/format-registry";
import { CATEGORY_INFO, SITE_NAME, SITE_URL, TIER1_CONVERSION_PAIRS } from "@/lib/seo/constants";
import { ConversionBreadcrumbs } from "@/components/seo/conversion-breadcrumbs";
import type { ConverterCategory } from "@/lib/seo/types";

export const metadata: Metadata = {
  title: {
    absolute: `Universal File Converter Directory — All Formats | ${SITE_NAME}`,
  },
  description:
    "Explore all file conversion formats and pairs. Convert images, documents, audio, video, 3D, fonts, archives, and code entirely client-side with zero server uploads.",
  alternates: {
    canonical: `${SITE_URL}/convert`,
  },
  openGraph: {
    title: `File Conversion Directory — ${SITE_NAME}`,
    description: "Browse all supported file formats and convert directly in your browser with 100% privacy.",
    url: `${SITE_URL}/convert`,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} File Conversion Directory`,
      },
    ],
  },
};

export default function ConvertDirectoryPage() {
  const allFormats = getAllRegisteredFormats();

  // Group formats by category
  const categories: ConverterCategory[] = [
    "images",
    "documents",
    "audio",
    "video",
    "vector",
    "3d",
    "fonts",
    "archive",
    "code",
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-10">
      <ConversionBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "All Converters" },
        ]}
      />

      {/* Header */}
      <div className="space-y-2 border-b border-(--border)/40 pb-6">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-(--foreground)">
          Universal Conversion Directory
        </h1>
        <p className="text-sm sm:text-base text-(--muted-foreground) max-w-3xl leading-relaxed">
          Convert between 200+ file formats client-side using WebAssembly. Select any format hub or popular conversion pair below to start converting with zero cloud uploads and total data privacy.
        </p>
      </div>

      {/* Popular Conversions */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-(--foreground) tracking-tight">
            Popular Conversions
          </h2>
          <span className="font-mono text-xs text-(--muted-foreground)">
            Top Tier-1 Pairs
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {TIER1_CONVERSION_PAIRS.slice(0, 24).map((pair) => (
            <Link
              key={`${pair.from}-to-${pair.to}`}
              href={`/convert/${pair.from}-to-${pair.to}`}
              className="p-2.5 rounded bg-(--card)/40 hover:bg-(--card) text-xs font-mono text-(--foreground) transition-colors flex items-center justify-between group"
            >
              <span>{pair.from.toUpperCase()} to {pair.to.toUpperCase()}</span>
              <span className="text-(--muted-foreground) group-hover:text-(--foreground) transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Formats Grouped By Category */}
      <div className="space-y-12">
        {categories.map((catId) => {
          const info = CATEGORY_INFO[catId];
          const formatsInCat = allFormats.filter((f) => f.category === catId);

          return (
            <section key={catId} className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-(--border)/30 pb-2">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-(--foreground) tracking-tight">
                    {info.name}
                  </h2>
                  <p className="text-xs text-(--muted-foreground)">
                    {info.tagline}
                  </p>
                </div>
                <Link
                  href={info.route}
                  className="font-mono text-xs text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                >
                  Open {info.shortLabel} App →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {formatsInCat.map((fmt) => (
                  <Link
                    key={fmt.id}
                    href={`/convert/${fmt.extension}`}
                    className="p-3 rounded hover:bg-(--card)/40 transition-colors block"
                  >
                    <div className="font-mono text-xs font-medium text-(--foreground)">
                      .{fmt.extension}
                    </div>
                    <div className="text-xs text-(--muted-foreground) truncate mt-0.5">
                      {fmt.name}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
