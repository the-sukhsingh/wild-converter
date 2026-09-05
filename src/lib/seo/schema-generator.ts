import { SITE_NAME, SITE_URL } from "./constants";
import type { SEOPageData, FormatHubData } from "./types";

/**
 * Builds schema markup array for conversion pair page
 */
export function generatePairSchemas(data: SEOPageData): Record<string, unknown>[] {
  const fromExt = data.fromFormat.extension.toUpperCase();
  const toExt = data.toFormat.extension.toUpperCase();

  // 1. WebApplication Schema
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${fromExt} to ${toExt} Converter — ${SITE_NAME}`,
    url: data.canonicalUrl,
    description: data.metaDescription,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "All (Any modern web browser)",
    browserRequirements: "Requires WebAssembly (WASM) compatible browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "100% Client-Side WebAssembly Conversion",
      "Zero Server Uploads & Total Privacy",
      "Instant In-Browser Local Processing",
      "No File Size Limitations",
      "No Registration or Sign-up Required"
    ],
  };

  // 2. HowTo Schema
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to convert ${fromExt} to ${toExt} online`,
    description: `Step-by-step instructions to convert ${fromExt} files to ${toExt} directly in your browser without uploading to a cloud server.`,
    totalTime: "PT10S",
    step: data.howToSteps.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: step.name,
      text: step.text,
      url: `${data.canonicalUrl}#step-${idx + 1}`,
    })),
  };

  // 3. FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // 4. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: data.category.charAt(0).toUpperCase() + data.category.slice(1),
        item: `${SITE_URL}/${data.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${fromExt} to ${toExt}`,
        item: data.canonicalUrl,
      },
    ],
  };

  return [webAppSchema, howToSchema, faqSchema, breadcrumbSchema];
}

/**
 * Builds schema markup array for format hub page
 */
export function generateFormatHubSchemas(data: FormatHubData): Record<string, unknown>[] {
  const ext = data.format.extension.toUpperCase();

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${ext} File Converter — ${SITE_NAME}`,
    url: data.canonicalUrl,
    description: data.metaDescription,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "All (Web Browser)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: data.category.charAt(0).toUpperCase() + data.category.slice(1),
        item: `${SITE_URL}/${data.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${ext} Converter`,
        item: data.canonicalUrl,
      },
    ],
  };

  return [webAppSchema, faqSchema, breadcrumbSchema];
}
