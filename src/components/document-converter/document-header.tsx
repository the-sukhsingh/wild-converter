"use client";

import { X, Eye } from "lucide-react";
import {
  type DocumentFormat,
  DOCUMENT_FORMAT_META,
  formatDocumentSize,
} from "@/lib/document-format-utils";
import type { DocumentMetadata } from "@/lib/document-converter/types";

interface DocumentHeaderProps {
  file: File;
  inputFormat: DocumentFormat | null;
  metadata: DocumentMetadata | null;
  onRemove: () => void;
  onPreview: () => void;
}

export function DocumentHeader({
  file,
  inputFormat,
  metadata,
  onRemove,
  onPreview,
}: DocumentHeaderProps) {
  const formatLabel = inputFormat
    ? DOCUMENT_FORMAT_META[inputFormat]?.label || inputFormat.toUpperCase()
    : "Document";

  return (
    <div className="flex items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
      <div className="flex items-baseline gap-3 min-w-0">
        <h2
          className="text-lg md:text-xl font-semibold tracking-tight text-[var(--foreground)] truncate max-w-md"
          title={file.name}
        >
          {file.name}
        </h2>
        <div className="text-xs font-mono text-[var(--muted-foreground)] shrink-0 flex items-center gap-1.5">
          <span>{formatLabel}</span>
          <span>•</span>
          <span>{formatDocumentSize(file.size)}</span>
          {metadata && (
            <>
              <span>•</span>
              <span>{metadata.wordCount.toLocaleString()} words</span>
              {metadata.sheetCount > 0 ? (
                <>
                  <span>•</span>
                  <span>{metadata.sheetCount} sheets</span>
                </>
              ) : metadata.pageCount > 0 ? (
                <>
                  <span>•</span>
                  <span>~{metadata.pageCount} pages</span>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-1 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded hover:bg-[var(--muted)]/50 transition-colors cursor-pointer"
          title="Preview document content"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded hover:bg-[var(--muted)]/50 transition-colors cursor-pointer"
          title="Remove file"
        >
          <X className="w-3.5 h-3.5" />
          <span>Change</span>
        </button>
      </div>
    </div>
  );
}
