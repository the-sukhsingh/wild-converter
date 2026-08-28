"use client";

import { useState } from "react";
import { X, Copy, Check, FileText, Code } from "lucide-react";
import type { DocumentIR } from "@/lib/document-converter/types";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentIR: DocumentIR | null;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  documentIR,
}: DocumentPreviewModalProps) {
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !documentIR) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(documentIR.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-(--background)/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[90vh] sm:h-[85vh] bg-(--background) border border-(--border) rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-(--border)">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-mono font-medium text-xs sm:text-sm text-(--foreground) truncate max-w-50 sm:max-w-md">
              {documentIR.title || "Document Preview"}
            </span>
            <span className="text-[11px] sm:text-xs font-mono text-(--muted-foreground) shrink-0">
              ({documentIR.metadata.wordCount.toLocaleString()} words)
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* View Switcher */}
            <div className="flex items-center bg-(--card) p-0.5 rounded text-xs font-mono border border-(--border)/40">
              <button
                type="button"
                onClick={() => setViewMode("formatted")}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === "formatted"
                    ? "bg-(--foreground) text-(--background) font-medium"
                    : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Formatted</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("raw")}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === "raw"
                    ? "bg-(--foreground) text-(--background) font-medium"
                    : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Raw</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted) transition-colors cursor-pointer"
                title="Copy Text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted) transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 font-sans">
          {viewMode === "formatted" ? (
            <div
              className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-sans leading-relaxed"
              dangerouslySetInnerHTML={{ __html: documentIR.html || `<p>${documentIR.rawText}</p>` }}
            />
          ) : (
            <pre className="font-mono text-xs sm:text-sm text-(--foreground) whitespace-pre-wrap wrap-break-word leading-relaxed">
              {documentIR.rawText}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
