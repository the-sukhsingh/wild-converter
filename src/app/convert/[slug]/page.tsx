import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  parseRouteSlug,
  getStaticParamsForBuild,
} from "@/lib/seo/pair-registry";
import {
  generateSEOPageData,
  generateFormatHubData,
} from "@/lib/seo/content-generator";
import {
  generatePairSchemas,
  generateFormatHubSchemas,
} from "@/lib/seo/schema-generator";
import { JsonLd } from "@/components/seo/json-ld";
import { ConversionBreadcrumbs } from "@/components/seo/conversion-breadcrumbs";
import { SeoConverterWidget } from "@/components/seo/seo-converter-widget";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { FormatSpecCard } from "@/components/seo/format-spec-card";
import { FAQAccordion } from "@/components/seo/faq-accordion";
import { RelatedConversions } from "@/components/seo/related-conversions";
import { SITE_NAME, OG_IMAGE_PATH } from "@/lib/seo/constants";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Pre-render top Tier-1 conversions at build time */
export async function generateStaticParams() {
  return getStaticParamsForBuild();
}

/** Allow on-demand ISR for 100,000+ long-tail pairs */
export const dynamicParams = true;

/** Revalidate cache every 24 hours */
export const revalidate = 86400;

/** Dynamic metadata generation */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseRouteSlug(slug);

  if (!parsed) {
    return {
      title: `Conversion Not Found | ${SITE_NAME}`,
      description: "The requested file conversion pair is not supported.",
    };
  }

  if (parsed.type === "pair") {
    const data = generateSEOPageData(parsed.from, parsed.to);
    if (!data) return { title: `Not Found | ${SITE_NAME}` };

    return {
      title: {
        absolute: `${data.title} | ${SITE_NAME}`,
      },
      description: data.metaDescription,
      alternates: {
        canonical: data.canonicalUrl,
      },
      openGraph: {
        title: `${data.title} | ${SITE_NAME}`,
        description: data.metaDescription,
        url: data.canonicalUrl,
        siteName: SITE_NAME,
        images: [
          {
            url: OG_IMAGE_PATH,
            width: 1200,
            height: 630,
            alt: `${data.h1} — ${SITE_NAME}`,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${data.title} | ${SITE_NAME}`,
        description: data.metaDescription,
        images: [OG_IMAGE_PATH],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  }

  // Format Hub
  const hubData = generateFormatHubData(parsed.format);
  if (!hubData) return { title: `Not Found | ${SITE_NAME}` };

  return {
    title: {
      absolute: `${hubData.title} | ${SITE_NAME}`,
    },
    description: hubData.metaDescription,
    alternates: {
      canonical: hubData.canonicalUrl,
    },
    openGraph: {
      title: `${hubData.title} | ${SITE_NAME}`,
      description: hubData.metaDescription,
      url: hubData.canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: OG_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: `${hubData.h1} — ${SITE_NAME}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${hubData.title} | ${SITE_NAME}`,
      description: hubData.metaDescription,
      images: [OG_IMAGE_PATH],
    },
  };
}

export default async function ConversionPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseRouteSlug(slug);

  if (!parsed) {
    notFound();
  }

  // ─── RENDER PAIR PAGE ─────────────────────────────────────────────
  if (parsed.type === "pair") {
    const data = generateSEOPageData(parsed.from, parsed.to);
    if (!data) notFound();

    const schemas = generatePairSchemas(data);
    const fromExt = data.fromFormat.extension.toUpperCase();
    const toExt = data.toFormat.extension.toUpperCase();

    return (
      <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-4 sm:py-6 space-y-8">
        <JsonLd schemas={schemas} />

        {/* Breadcrumb Navigation */}
        <ConversionBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: data.category.charAt(0).toUpperCase() + data.category.slice(1), href: `/${data.category}` },
            { label: `${fromExt} to ${toExt}` },
          ]}
        />

        {/* Page Header */}
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-(--foreground)">
            {data.h1}
          </h1>
          <p className="text-sm sm:text-base text-(--muted-foreground) max-w-3xl leading-relaxed">
            {data.intentSummary}
          </p>
        </header>

        {/* Interactive Converter Widget pre-configured for this pair */}
        <section aria-label="Converter Widget">
          <SeoConverterWidget
            category={data.category}
            fromFormat={data.fromFormat.extension}
            toFormat={data.toFormat.extension}
          />
        </section>

        {/* Technical Intent & Conversion Rationale */}
        <section className="space-y-3 pt-4">
          <h2 className="text-lg sm:text-xl font-semibold text-(--foreground) tracking-tight">
            Why Convert {fromExt} to {toExt}?
          </h2>
          <p className="text-xs sm:text-sm text-(--muted-foreground) leading-relaxed">
            {data.intentParagraph}
          </p>
        </section>

        {/* Technical Comparison Matrix */}
        <section className="space-y-3 pt-2">
          <div className="flex items-baseline justify-between border-b border-(--border)/40 pb-2">
            <h2 className="text-lg sm:text-xl font-semibold text-(--foreground) tracking-tight">
              {fromExt} vs {toExt}: Technical Comparison
            </h2>
            <span className="font-mono text-xs text-(--muted-foreground)">
              Specification Matrix
            </span>
          </div>
          <ComparisonTable
            fromName={data.fromFormat.name}
            toName={data.toFormat.name}
            dimensions={data.comparisonDimensions}
          />
        </section>

        {/* Side-by-Side Format Specifications */}
        <section className="space-y-3 pt-2">
          <h2 className="text-lg sm:text-xl font-semibold text-(--foreground) tracking-tight border-b border-(--border)/40 pb-2">
            Format Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormatSpecCard spec={data.fromFormat} role="source" />
            <FormatSpecCard spec={data.toFormat} role="target" />
          </div>
        </section>

        {/* Step-by-Step How-To Instructions */}
        <section className="space-y-4 pt-4 border-t border-(--border)/40">
          <h2 className="text-lg sm:text-xl font-semibold text-(--foreground) tracking-tight">
            How to Convert {fromExt} to {toExt} Online
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data.howToSteps.map((step, idx) => (
              <div key={step.name} className="space-y-1.5 p-3 rounded bg-(--card)/30">
                <span className="font-mono text-xs text-emerald-500 font-medium">
                  0{idx + 1}
                </span>
                <h3 className="font-medium text-xs sm:text-sm text-(--foreground)">
                  {step.name}
                </h3>
                <p className="text-xs text-(--muted-foreground) leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contextual FAQs */}
        <section className="space-y-2 pt-4">
          <div className="flex items-baseline justify-between border-b border-(--border)/40 pb-2">
            <h2 className="text-lg sm:text-xl font-semibold text-(--foreground) tracking-tight">
              Frequently Asked Questions
            </h2>
            <span className="font-mono text-xs text-(--muted-foreground)">
              {fromExt} → {toExt} FAQ
            </span>
          </div>
          <FAQAccordion faqs={data.faqs} />
        </section>

        {/* Hub-and-Spoke Internal Links */}
        <RelatedConversions
          fromExt={data.fromFormat.extension}
          toExt={data.toFormat.extension}
          reversePair={data.reversePair}
          relatedFromConversions={data.relatedFromConversions}
          relatedToConversions={data.relatedToConversions}
          siblingFormats={data.siblingFormats}
        />
      </div>
    );
  }

  // ─── RENDER FORMAT HUB PAGE ───────────────────────────────────────
  const hubData = generateFormatHubData(parsed.format);
  if (!hubData) notFound();

  const schemas = generateFormatHubSchemas(hubData);
  const ext = hubData.format.extension.toUpperCase();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-4 sm:py-6 space-y-8">
      <JsonLd schemas={schemas} />

      {/* Breadcrumb Navigation */}
      <ConversionBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: hubData.category.charAt(0).toUpperCase() + hubData.category.slice(1), href: `/${hubData.category}` },
          { label: `${ext} Converter` },
        ]}
      />

      {/* Header */}
      <header className="space-y-2 border-b border-(--border)/40 pb-6">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-(--foreground)">
          {hubData.h1}
        </h1>
        <p className="text-sm sm:text-base text-(--muted-foreground) max-w-3xl leading-relaxed">
          {hubData.summary}
        </p>
      </header>

      {/* Live Converter Widget */}
      <section aria-label="Converter Widget">
        <SeoConverterWidget
          category={hubData.category}
          fromFormat={hubData.format.extension}
        />
      </section>

      {/* Format Specification */}
      <section className="space-y-3 pt-4">
        <FormatSpecCard spec={hubData.format} role="standalone" />
      </section>

      {/* Hub Spokes: Convert FROM this format */}
      {hubData.outboundConversions.length > 0 && (
        <section className="space-y-3 pt-6 border-t border-(--border)/40">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-(--foreground) tracking-tight">
              Convert {ext} to Other Formats
            </h2>
            <span className="font-mono text-xs text-(--muted-foreground)">
              Outbound Conversions
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {hubData.outboundConversions.map((conv) => (
              <Link
                key={conv.slug}
                href={`/convert/${conv.slug}`}
                className="p-2.5 rounded bg-(--card)/40 hover:bg-(--card) text-xs font-mono text-(--foreground) transition-colors flex items-center justify-between group"
              >
                <span>{conv.label}</span>
                <span className="text-(--muted-foreground) group-hover:text-(--foreground) transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Inbound Spokes: Convert TO this format */}
      {hubData.inboundConversions.length > 0 && (
        <section className="space-y-3 pt-6 border-t border-(--border)/40">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-(--foreground) tracking-tight">
              Convert Other Formats to {ext}
            </h2>
            <span className="font-mono text-xs text-(--muted-foreground)">
              Inbound Conversions
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {hubData.inboundConversions.map((conv) => (
              <Link
                key={conv.slug}
                href={`/convert/${conv.slug}`}
                className="p-2.5 rounded bg-(--card)/40 hover:bg-(--card) text-xs font-mono text-(--foreground) transition-colors flex items-center justify-between group"
              >
                <span>{conv.label}</span>
                <span className="text-(--muted-foreground) group-hover:text-(--foreground) transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sibling Formats */}
      {hubData.siblingFormats.length > 0 && (
        <section className="space-y-3 pt-6 border-t border-(--border)/40">
          <h2 className="text-base sm:text-lg font-semibold text-(--foreground) tracking-tight">
            Related {hubData.category.charAt(0).toUpperCase() + hubData.category.slice(1)} Formats
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {hubData.siblingFormats.map((sibling) => (
              <Link
                key={sibling.slug}
                href={`/convert/${sibling.slug}`}
                className="font-mono text-xs px-2.5 py-1 rounded bg-(--card)/50 hover:bg-(--card) text-(--muted-foreground) hover:text-(--foreground) transition-colors"
              >
                .{sibling.extension} ({sibling.name})
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="space-y-2 pt-6 border-t border-(--border)/40">
        <h2 className="text-lg sm:text-xl font-semibold text-(--foreground) tracking-tight">
          Frequently Asked Questions
        </h2>
        <FAQAccordion faqs={hubData.faqs} />
      </section>
    </div>
  );
}
