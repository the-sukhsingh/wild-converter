import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Provider";
import { AppShell } from "@/components/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

import { SITE_NAME, SITE_URL, OG_IMAGE_PATH } from "@/lib/seo/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Wild Converter — Convert anything, instantly",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Convert images, documents, audio, video, 3D models, and code entirely in your browser using WebAssembly. 100% private, zero uploads, no sign-up, no ads.",
  keywords: [
    "file converter",
    "image converter",
    "convert online",
    "browser converter",
    "wasm converter",
    "client-side converter",
    "privacy file converter",
  ],
  openGraph: {
    title: "Wild Converter — Universal In-Browser File Converter",
    description:
      "Universal 100% client-side file converter running entirely in your browser using WebAssembly. Zero cloud uploads.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Wild Converter — Universal In-Browser File Converter",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wild Converter — Universal In-Browser File Converter",
    description: "Convert files locally in your browser with WebAssembly. No server uploads.",
    images: [OG_IMAGE_PATH],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
