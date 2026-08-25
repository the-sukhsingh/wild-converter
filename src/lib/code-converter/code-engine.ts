import { marked } from "marked";
import TurndownService from "turndown";
import * as YAML from "yaml";
import Papa from "papaparse";
import * as xml2js from "xml2js";
import type {
  CodeConversionOptions,
  CodeConversionResult,
  CodeMetadata,
} from "./types";
import { CODE_FORMATS, type CodeFormat } from "../code-format-utils";

/**
 * Strips comments from code string according to syntax
 */
export function stripCodeComments(code: string, format: string): string {
  if (
    format.includes("js") ||
    format.includes("ts") ||
    format.includes("c") ||
    format.includes("java") ||
    format.includes("rust") ||
    format.includes("go") ||
    format.includes("swift") ||
    format.includes("php") ||
    format.includes("css")
  ) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
  } else if (
    format.includes("py") ||
    format.includes("ruby") ||
    format.includes("r") ||
    format.includes("perl") ||
    format.includes("yaml")
  ) {
    return code.replace(/#.*$/gm, "");
  } else if (format.includes("sql") || format.includes("ada") || format.includes("lua")) {
    return code.replace(/--.*$/gm, "");
  } else if (format.includes("html") || format.includes("xml")) {
    return code.replace(/<!--[\s\S]*?-->/g, "");
  }
  return code;
}

/**
 * Minifies code by compressing whitespace, stripping blank lines
 */
export function minifyCode(code: string, format: string): string {
  let clean = stripCodeComments(code, format);

  if (format === "json") {
    try {
      return JSON.stringify(JSON.parse(clean));
    } catch {}
  }

  clean = clean
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*([{};:=,+><\(\)\[\]])\s*/g, "$1")
    .replace(/\n+/g, "\n")
    .trim();

  return clean;
}

/**
 * Beautifies / standardizes indentation across code languages
 */
export function formatCodeIndentation(
  code: string,
  indentation: 2 | 4 | "tab"
): string {
  const indentStr =
    indentation === "tab" ? "\t" : " ".repeat(indentation);

  const lines = code.split("\n");
  let indentLevel = 0;
  const formattedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      formattedLines.push("");
      continue;
    }

    if (/^[}\]\)]/.test(line)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formattedLines.push(indentStr.repeat(indentLevel) + line);

    const openMatches = (line.match(/[{\[\(]/g) || []).length;
    const closeMatches = (line.match(/[}\]\)]/g) || []).length;
    indentLevel = Math.max(0, indentLevel + openMatches - closeMatches);
  }

  return formattedLines.join("\n");
}

/**
 * Parses raw code file and computes metrics
 */
export async function parseCodeFile(file: File): Promise<CodeMetadata> {
  const rawCode = await file.text();
  const lines = rawCode.split("\n");
  const words = rawCode.trim().split(/\s+/).filter(Boolean);

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const detectedFormat = (CODE_FORMATS[ext as CodeFormat]?.label.split(" ")[0]) || ext.toUpperCase() || "Plain Text";

  return {
    lineCount: lines.length,
    charCount: rawCode.length,
    wordCount: words.length,
    detectedLanguage: detectedFormat,
    fileSizeBytes: file.size,
    name: file.name,
    format: (ext as CodeFormat) in CODE_FORMATS ? (ext as CodeFormat) : "unknown",
    rawCode,
    snippet: lines.slice(0, 15).join("\n"),
  };
}

/**
 * Master code & markup converter using standard packages:
 * yaml, papaparse, xml2js, marked, turndown
 */
export async function convertCode(
  meta: CodeMetadata,
  originalFileName: string,
  options: CodeConversionOptions
): Promise<CodeConversionResult> {
  const formatInfo = CODE_FORMATS[options.format] || CODE_FORMATS.ts;
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.${formatInfo.extension}`;

  let processedCode = meta.rawCode;

  // 1. Cross-conversion transforms
  const srcExt = originalFileName.split(".").pop()?.toLowerCase() || "";
  const targetExt = formatInfo.extension;
  const indentNum = typeof options.indentation === "number" ? options.indentation : 2;

  try {
    // Markdown <-> HTML
    if ((srcExt === "md" || srcExt === "markdown") && (targetExt === "html" || targetExt === "htm")) {
      processedCode = await marked.parse(meta.rawCode);
    } else if ((srcExt === "html" || srcExt === "htm") && targetExt === "md") {
      const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
      processedCode = turndown.turndown(meta.rawCode);
    }
    // JSON <-> YAML
    else if (srcExt === "json" && (targetExt === "yaml" || targetExt === "yml")) {
      const parsed = JSON.parse(meta.rawCode);
      processedCode = YAML.stringify(parsed, { indent: indentNum });
    } else if ((srcExt === "yaml" || srcExt === "yml") && targetExt === "json") {
      const parsed = YAML.parse(meta.rawCode);
      processedCode = JSON.stringify(parsed, null, indentNum);
    }
    // CSV / TSV transforms
    else if (srcExt === "csv" && targetExt === "json") {
      const parsed = Papa.parse(meta.rawCode, { header: true });
      processedCode = JSON.stringify(parsed.data, null, indentNum);
    } else if (srcExt === "json" && targetExt === "csv") {
      const parsed = JSON.parse(meta.rawCode);
      if (Array.isArray(parsed)) {
        processedCode = Papa.unparse(parsed);
      }
    }
    // XML <-> JSON
    else if (srcExt === "xml" && targetExt === "json") {
      const parsed = await xml2js.parseStringPromise(meta.rawCode);
      processedCode = JSON.stringify(parsed, null, indentNum);
    } else if (srcExt === "json" && targetExt === "xml") {
      const parsed = JSON.parse(meta.rawCode);
      const builder = new xml2js.Builder({ headless: false, renderOpts: { pretty: true, indent: " ".repeat(indentNum) } });
      processedCode = builder.buildObject(parsed);
    }
  } catch {
    // Keep rawCode on syntax parse errors
    processedCode = meta.rawCode;
  }

  // 2. Comments stripping
  if (options.stripComments) {
    processedCode = stripCodeComments(processedCode, options.format);
  }

  // 3. Minification or Indentation Formatting
  if (options.minify) {
    processedCode = minifyCode(processedCode, options.format);
  } else {
    processedCode = formatCodeIndentation(processedCode, options.indentation);
  }

  // 4. Line Numbering (optional)
  if (options.addLineNumbers) {
    const lines = processedCode.split("\n");
    const padLen = String(lines.length).length;
    processedCode = lines
      .map((l, i) => `${String(i + 1).padStart(padLen, " ")} | ${l}`)
      .join("\n");
  }

  const blob = new Blob([processedCode], {
    type: `${formatInfo.mimeType};charset=utf-8`,
  });
  const url = URL.createObjectURL(blob);
  const finalLineCount = processedCode.split("\n").length;

  return {
    blob,
    mime: formatInfo.mimeType,
    fileName: outputFileName,
    url,
    formattedCode: processedCode,
    lineCount: finalLineCount,
    fileSizeBytes: blob.size,
  };
}
