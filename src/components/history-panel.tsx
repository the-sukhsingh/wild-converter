"use client";

import { useEffect, useRef } from "react";
import { useConversionHistory, type ConversionRecord } from "@/lib/conversion-history";
import { formatFileSize } from "@/lib/format-utils";
import {
  X,
  History,
  Trash2,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Box,
  Archive,
  Type,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function getCategoryIcon(cat: string) {
  const cls = "w-3.5 h-3.5";
  switch (cat) {
    case "images":    return <ImageIcon className={`${cls} text-emerald-500`} />;
    case "documents": return <FileText  className={`${cls} text-blue-500`} />;
    case "audio":     return <Music     className={`${cls} text-amber-500`} />;
    case "video":     return <Video     className={`${cls} text-purple-500`} />;
    case "vector":    return <Layers    className={`${cls} text-cyan-500`} />;
    case "3d":        return <Box       className={`${cls} text-orange-500`} />;
    case "fonts":     return <Type      className={`${cls} text-pink-500`} />;
    case "archive":   return <Archive   className={`${cls} text-indigo-500`} />;
    default:          return <FileText  className={`${cls} text-[var(--muted-foreground)]`} />;
  }
}

function relativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

function HistoryRecord({ record }: { record: ConversionRecord }) {
  const ext = (name: string) => name.split(".").pop()?.toUpperCase() ?? "?";
  const sizeDelta = record.outputSize - record.inputSize;
  const deltaPercent = record.inputSize > 0
    ? Math.round((sizeDelta / record.inputSize) * 100)
    : 0;

  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-[var(--border)]/50 last:border-0">
      <div className="shrink-0 mt-0.5">
        {getCategoryIcon(record.category)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {record.status === "done" ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-3 h-3 text-destructive shrink-0" />
          )}
          <span
            className="font-mono text-xs text-[var(--foreground)] truncate"
            title={record.inputFileName}
          >
            {record.inputFileName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] font-mono text-[var(--muted-foreground)]">
          <span>{ext(record.inputFileName)}</span>
          <ArrowRight className="w-2.5 h-2.5 shrink-0" />
          <span>{ext(record.outputFileName)}</span>
          <span className="mx-0.5 text-[var(--border)]">·</span>
          <span>{formatFileSize(record.inputSize)}</span>
          {record.status === "done" && (
            <>
              <ArrowRight className="w-2.5 h-2.5 shrink-0" />
              <span>{formatFileSize(record.outputSize)}</span>
              {sizeDelta < 0 && (
                <span className="text-emerald-500 ml-0.5 font-medium">
                  ({deltaPercent}%)
                </span>
              )}
            </>
          )}
          <span className="mx-0.5 text-[var(--border)]">·</span>
          <span>{relativeTime(record.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const { records, clearHistory } = useConversionHistory();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Slight delay so the opening click doesn't close immediately
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[320px] sm:max-w-sm bg-[var(--background)] border-l border-[var(--border)] shadow-2xl flex flex-col transition-transform duration-250 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Conversion History"
        aria-modal="true"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[var(--muted-foreground)]" />
            <span className="font-mono text-sm font-semibold text-[var(--foreground)]">
              History
            </span>
            {records.length > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                {records.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {records.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                title="Clear history"
                className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Records List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center">
              <History className="w-8 h-8 text-[var(--border)]" />
              <p className="font-mono text-xs text-[var(--muted-foreground)]">
                No conversions yet.
                <br />
                Convert a file to see it here.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {records.map((record) => (
                <HistoryRecord key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        {records.length > 0 && (
          <div className="px-5 py-3 border-t border-[var(--border)] shrink-0">
            <p className="font-mono text-[10px] text-[var(--muted-foreground)] text-center">
              Session history · {records.length} conversion{records.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
