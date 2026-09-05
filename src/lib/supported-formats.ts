import { detectFormat } from "./format-utils";
import { detectDocumentFormat, detectFileMainCategory } from "./document-format-utils";
import { isAudioFile, detectAudioFormat } from "./audio-format-utils";
import { isVideoFile, detectVideoFormat } from "./video-format-utils";
import { isVectorFile, detectVectorFormat } from "./vector-format-utils";
import { isThreeDFile, detectThreeDFormat } from "./three-d-format-utils";
import { isFontFile, detectFontFormat } from "./font-format-utils";
import { isArchiveFile, detectArchiveFormat } from "./archive-format-utils";
import { isCodeFile, detectCodeFormat } from "./code-format-utils";

export type ConverterCategory =
  | "images"
  | "documents"
  | "audio"
  | "video"
  | "vector"
  | "3d"
  | "fonts"
  | "archive"
  | "code";

/**
 * Checks whether a given file can be converted in the specified category.
 *
 * For example:
 * - A PNG image CAN be converted in "images" (image -> other image formats).
 * - A PNG image CAN be converted in "documents" (image -> PDF, HTML, Word, etc.).
 * - A PNG image CANNOT be converted in "audio", "video", "3d", "fonts", "archive".
 */
export function isCategorySupported(category: ConverterCategory, file: File | null | undefined): boolean {
  if (!file) return false;

  switch (category) {
    case "images": {
      return detectFormat(file) !== null || file.type.startsWith("image/");
    }

    case "documents": {
      // DocumentConverter accepts all document formats AND images (for image -> PDF/Docx/HTML)
      const mainCat = detectFileMainCategory(file);
      return (
        mainCat === "document" ||
        mainCat === "image" ||
        detectDocumentFormat(file) !== null ||
        detectFormat(file) !== null ||
        file.type.startsWith("text/") ||
        file.type.startsWith("image/")
      );
    }

    case "audio": {
      return isAudioFile(file) || detectAudioFormat(file) !== null || file.type.startsWith("audio/");
    }

    case "video": {
      return isVideoFile(file) || detectVideoFormat(file) !== null || file.type.startsWith("video/");
    }

    case "vector": {
      return isVectorFile(file) || detectVectorFormat(file) !== null;
    }

    case "3d": {
      return isThreeDFile(file) || detectThreeDFormat(file) !== null;
    }

    case "fonts": {
      return isFontFile(file) || detectFontFormat(file) !== null;
    }

    case "archive": {
      return isArchiveFile(file) || detectArchiveFormat(file) !== null;
    }

    case "code": {
      return isCodeFile(file) || detectCodeFormat(file) !== null;
    }

    default:
      return false;
  }
}
