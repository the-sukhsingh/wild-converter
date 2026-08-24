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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--background)]/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[85vh] bg-[var(--background)] border border-[var(--border)] rounded-lg flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className="font-mono font-medium text-sm text-[var(--foreground)]">
              {documentIR.title || "Document Preview"}
            </span>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              ({documentIR.metadata.wordCount.toLocaleString()} words ·{" "}
              {documentIR.metadata.lineCount} lines)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-[var(--foreground)]/5 p-0.5 rounded text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode("formatted")}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === "formatted"
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Raw Text</span>
              </button>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer"
              title="Copy Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans">
          {viewMode === "formatted" ? (
            <div
              className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-sans leading-relaxed"
              dangerouslySetInnerHTML={{ __html: documentIR.html || `<p>${documentIR.rawText}</p>` }}
            />
          ) : (
            <pre className="font-mono text-xs text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
              {documentIR.rawText}
            </pre>
          )}
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 px-6 py-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>Client-side parsed intermediate representation</span>
          <span>100% private</span>
        </div>
      </div>
    </div>
  );
}
