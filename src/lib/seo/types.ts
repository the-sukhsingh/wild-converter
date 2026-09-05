import type { ConverterCategory } from "../supported-formats";

export type { ConverterCategory };

export interface FormatSpec {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  category: ConverterCategory;
  developer: string;
  year?: number;
  lossy: boolean;
  lossless: boolean;
  colorDepth: string;
  supportsAlpha: boolean;
  supportsAnimation: boolean;
  supportsCompression: boolean;
  compressionType: string;
  standard?: string;
  primaryUse: string;
  strengths: string[];
  limitations: string[];
  compatibleWith: string[];
  typicalSize: string;
  description: string;
}

export interface TechnicalComparisonDimension {
  feature: string;
  fromValue: string;
  toValue: string;
  winner: "from" | "to" | "tie";
  explanation: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ConversionLinkItem {
  from: string;
  to: string;
  label: string;
  slug: string;
  category: ConverterCategory;
}

export interface FormatHubLinkItem {
  id: string;
  name: string;
  extension: string;
  slug: string;
  category: ConverterCategory;
}

export interface SEOPageData {
  type: "pair";
  fromFormat: FormatSpec;
  toFormat: FormatSpec;
  slug: string;
  category: ConverterCategory;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  h1: string;
  h2Subhead: string;
  intentSummary: string;
  intentParagraph: string;
  comparisonDimensions: TechnicalComparisonDimension[];
  howToSteps: HowToStep[];
  faqs: FAQItem[];
  reversePair: ConversionLinkItem;
  relatedFromConversions: ConversionLinkItem[];
  relatedToConversions: ConversionLinkItem[];
  siblingFormats: FormatHubLinkItem[];
}

export interface FormatHubData {
  type: "format-hub";
  format: FormatSpec;
  slug: string;
  category: ConverterCategory;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  h1: string;
  summary: string;
  outboundConversions: ConversionLinkItem[];
  inboundConversions: ConversionLinkItem[];
  siblingFormats: FormatHubLinkItem[];
  faqs: FAQItem[];
}

export type ProgrammaticPageData = SEOPageData | FormatHubData;
