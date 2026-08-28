"use client";

import { useEffect, useState, useRef } from "react";
import type { BatchItem } from "@/lib/batch-converter/types";
import { formatFileSize } from "@/lib/format-utils";
import {
  X,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Box,
  Archive,
  Type,
  Layers,
  Download,
  Play,
} from "lucide-react";

interface BatchPreviewModalProps {
  item: BatchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConvert?: (item: BatchItem) => void;
  onDownload?: (item: BatchItem) => void;
}

function getCategoryIcon(cat: string) {
  const cls = "w-10 h-10";
  switch (cat) {
    case "images":    return <ImageIcon className={`${cls} text-emerald-500`} />;
    case "documents": return <FileText  className={`${cls} text-blue-500`} />;
    case "audio":     return <Music     className={`${cls} text-amber-500`} />;
    case "video":     return <Video     className={`${cls} text-purple-500`} />;
    case "vector":    return <Layers    className={`${cls} text-cyan-500`} />;
    case "3d":        return <Box       className={`${cls} text-orange-500`} />;
    case "fonts":     return <Type      className={`${cls} text-pink-500`} />;
    case "archive":   return <Archive   className={`${cls} text-indigo-500`} />;
    default:          return <FileText  className={`${cls} text-(--muted-foreground)`} />;
  }
}

export function BatchPreviewModal({
  item,
  isOpen,
  onClose,
  onConvert,
  onDownload,
}: BatchPreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Generate an object URL preview for image files
  useEffect(() => {
    if (!item || !isOpen) {
      setPreviewUrl(null);
      setImageError(false);
      return;
    }

    // If conversion is done, use result; otherwise use original
    const blob = item.resultBlob ?? (item.category === "images" ? item.file : null);
    if (!blob) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setImageError(false);

    return () => URL.revokeObjectURL(url);
  }, [item, isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const showImage = item.category === "images" && previewUrl && !imageError;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-(--background) border border-(--border) rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border) shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm font-semibold text-(--foreground) truncate" title={item.name}>
              {item.name}
            </span>
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-(--muted) text-(--muted-foreground)">
              {item.detectedInputFormat ?? item.category}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 ml-3 p-1.5 rounded-md text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted) transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          {showImage ? (
            /* Image preview */
            <div className="flex items-center justify-center p-4 bg-(--muted)/20 min-h-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl!}
                alt={item.name}
                className="max-w-full max-h-[55vh] object-contain rounded-lg"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            /* Non-image placeholder */
            <div className="flex flex-col items-center justify-center py-12 gap-4 bg-(--muted)/10 min-h-50">
              {getCategoryIcon(item.category)}
              <p className="font-mono text-sm text-(--muted-foreground)">
                No preview available
              </p>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="px-5 py-4 border-t border-(--border) bg-(--card)/40 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <MetaField label="Size" value={formatFileSize(item.size)} />
            <MetaField label="Type" value={(item.detectedInputFormat ?? item.category).toUpperCase()} />
            <MetaField label="Status" value={
              item.status === "done" ? `✓ Done (${formatFileSize(item.outputSize ?? 0)})` :
              item.status === "error" ? "✗ Failed" :
              item.status === "converting" ? `Converting ${item.progress}%` :
              "Ready"
            } />
            <MetaField label="Convert to" value={item.targetFormat.toUpperCase()} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 justify-end">
            {item.status === "idle" && onConvert && (
              <button
                type="button"
                onClick={() => { onConvert(item); onClose(); }}
                className="px-3 py-1.5 text-xs font-mono font-medium rounded-md bg-(--foreground) text-(--background) hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                Convert
              </button>
            )}
            {item.status === "done" && onDownload && (
              <button
                type="button"
                onClick={() => { onDownload(item); onClose(); }}
                className="px-3 py-1.5 text-xs font-mono font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-mono rounded-md border border-(--border) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted) transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] text-(--muted-foreground) uppercase tracking-wider">{label}</span>
      <span className="font-mono text-xs text-(--foreground) font-medium truncate">{value}</span>
    </div>
  );
}
