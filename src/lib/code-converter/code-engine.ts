import { marked } from "marked";
import TurndownService from "turndown";
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
    // Strip // comments and /* */ comments
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
    // Strip # comments
    return code.replace(/#.*$/gm, "");
  } else if (format.includes("sql") || format.includes("ada") || format.includes("lua")) {
    // Strip -- comments
    return code.replace(/--.*$/gm, "");
  } else if (format.includes("html") || format.includes("xml")) {
    // Strip <!-- --> comments
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
    } catch {
      // Fallback regex
    }
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
    let line = lines[i].trim();
    if (!line) {
      formattedLines.push("");
      continue;
    }

    // Decrement indent if closing bracket at start of line
    if (/^[}\]\)]/.test(line)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formattedLines.push(indentStr.repeat(indentLevel) + line);

    // Increment indent if opening bracket at end of line
    const openMatches = (line.match(/[{\[\(]/g) || []).length;
    const closeMatches = (line.match(/[}\]\)]/g) || []).length;
    indentLevel = Math.max(0, indentLevel + openMatches - closeMatches);
  }

  return formattedLines.join("\n");
}

/**
 * JSON to YAML converter
 */
export function jsonToYaml(jsonStr: string, indent: number = 2): string {
  try {
    const obj = JSON.parse(jsonStr);
    const renderYaml = (val: unknown, depth: number): string => {
      const sp = " ".repeat(depth * indent);
      if (val === null) return "null";
      if (typeof val === "boolean" || typeof val === "number") return String(val);
      if (typeof val === "string") return JSON.stringify(val);

      if (Array.isArray(val)) {
        if (val.length === 0) return "[]";
        return val.map((item) => `\n${sp}- ${renderYaml(item, depth + 1).trimStart()}`).join("");
      }

      if (typeof val === "object") {
        const entries = Object.entries(val as Record<string, unknown>);
        if (entries.length === 0) return "{}";
        return entries
          .map(([k, v]) => `\n${sp}${k}: ${renderYaml(v, depth + 1).trimStart()}`)
          .join("");
      }

      return String(val);
    };

    return renderYaml(obj, 0).trim();
  } catch {
    return jsonStr;
  }
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
 * Master code & markup converter
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
  const srcExt = originalFileName.split(".").pop()?.toLowerCase();
  const targetExt = formatInfo.extension;

  if ((srcExt === "md" || srcExt === "markdown") && (targetExt === "html" || targetExt === "htm")) {
    // Markdown to HTML
    processedCode = await marked.parse(meta.rawCode);
  } else if ((srcExt === "html" || srcExt === "htm") && targetExt === "md") {
    // HTML to Markdown
    const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
    processedCode = turndown.turndown(meta.rawCode);
  } else if (srcExt === "json" && (targetExt === "yaml" || targetExt === "yml")) {
    // JSON to YAML
    processedCode = jsonToYaml(meta.rawCode, typeof options.indentation === "number" ? options.indentation : 2);
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
