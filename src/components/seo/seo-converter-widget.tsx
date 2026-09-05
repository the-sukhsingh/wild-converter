"use client";

import dynamic from "next/dynamic";
import type { ConverterCategory } from "@/lib/seo/types";
import type { ImageFormat } from "@/lib/format-utils";
import type { DocumentFormat } from "@/lib/document-format-utils";
import type { AudioFormat } from "@/lib/audio-format-utils";

// Dynamically import category converters so heavy engines only load on client
const ImageConverter = dynamic(
  () => import("@/components/image-converter").then((m) => m.ImageConverter),
  { ssr: false }
);

const DocumentConverter = dynamic(
  () => import("@/components/document-converter").then((m) => m.DocumentConverter),
  { ssr: false }
);

const AudioConverter = dynamic(
  () => import("@/components/audio-converter").then((m) => m.AudioConverter),
  { ssr: false }
);

const VideoConverter = dynamic(
  () => import("@/components/video-converter").then((m) => m.VideoConverter),
  { ssr: false }
);

const VectorConverter = dynamic(
  () => import("@/components/vector-converter").then((m) => m.VectorConverter),
  { ssr: false }
);

const ThreeDConverter = dynamic(
  () => import("@/components/three-d-converter").then((m) => m.ThreeDConverter),
  { ssr: false }
);

const FontConverter = dynamic(
  () => import("@/components/font-converter").then((m) => m.FontConverter),
  { ssr: false }
);

const ArchiveConverter = dynamic(
  () => import("@/components/archive-converter").then((m) => m.ArchiveConverter),
  { ssr: false }
);

const CodeConverter = dynamic(
  () => import("@/components/code-converter").then((m) => m.CodeConverter),
  { ssr: false }
);

interface SeoConverterWidgetProps {
  category: ConverterCategory;
  fromFormat: string;
  toFormat?: string;
}

export function SeoConverterWidget({
  category,
  fromFormat,
  toFormat,
}: SeoConverterWidgetProps) {
  return (
    <div className="w-full h-[340px] sm:h-[380px] relative flex flex-col my-4 border border-(--border)/30 rounded-lg overflow-hidden bg-(--card)/20">
      {category === "images" && (
        <ImageConverter
          initialTargetFormat={(toFormat as ImageFormat) || "webp"}
        />
      )}

      {category === "documents" && (
        <DocumentConverter
          initialTargetFormat={(toFormat as DocumentFormat) || "pdf"}
        />
      )}

      {category === "audio" && (
        <AudioConverter
          initialTargetFormat={(toFormat as AudioFormat) || "mp3"}
        />
      )}

      {category === "video" && <VideoConverter />}

      {category === "vector" && <VectorConverter />}

      {category === "3d" && <ThreeDConverter />}

      {category === "fonts" && <FontConverter />}

      {category === "archive" && <ArchiveConverter />}

      {category === "code" && <CodeConverter />}
    </div>
  );
}
