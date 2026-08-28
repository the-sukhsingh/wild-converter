"use client";

import { useMemo } from "react";
import type { BatchItem } from "@/lib/batch-converter/types";
import {
  getAvailableTargetFormats,
} from "@/lib/batch-converter/batch-runner";
import { formatFileSize } from "@/lib/format-utils";
import { useSizeEstimate } from "./use-size-estimate";
import {
  Download,
  Play,
  RotateCw,
  Trash2,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Box,
  Archive,
  Type,
  Layers,
  GripVertical,
} from "lucide-react";

interface BatchRowProps {
  item: BatchItem;
  index: number;
  isDragging?: boolean;
  onUpdateTargetFormat: (id: string, format: string) => void;
  onOpenOptions: (item: BatchItem) => void;
  onConvertSingle: (item: BatchItem) => void;
  onDownloadSingle: (item: BatchItem) => void;
  onRemove: (id: string) => void;
  onRetry: (item: BatchItem) => void;
  onPreview: (item: BatchItem) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
}

function getCategoryIcon(cat: string) {
  switch (cat) {
    case "images":    return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    case "documents": return <FileText  className="w-4 h-4 text-blue-500" />;
    case "audio":     return <Music     className="w-4 h-4 text-amber-500" />;
    case "video":     return <Video     className="w-4 h-4 text-purple-500" />;
    case "vector":    return <Layers    className="w-4 h-4 text-cyan-500" />;
    case "3d":        return <Box       className="w-4 h-4 text-orange-500" />;
    case "fonts":     return <Type      className="w-4 h-4 text-pink-500" />;
    case "archive":   return <Archive   className="w-4 h-4 text-indigo-500" />;
    default:          return <FileText  className="w-4 h-4 text-muted-foreground" />;
  }
}

export function BatchRow({
  item,
  isDragging = false,
  onUpdateTargetFormat,
  onOpenOptions,
  onConvertSingle,
  onDownloadSingle,
  onRemove,
  onRetry,
  onPreview,
  onDragStart,
  onDragOver,
  onDragEnd,
  index,
}: BatchRowProps) {
  const availableFormats = useMemo(
    () => getAvailableTargetFormats(item.category),
    [item.category]
  );

  const sizeDiffPercent = useMemo(() => {
    if (!item.outputSize || !item.size) return null;
    return Math.round(((item.outputSize - item.size) / item.size) * 100);
  }, [item.outputSize, item.size]);

  // Output size estimate
  const sizeEstimate = useSizeEstimate(item);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDragEnd={onDragEnd}
      className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 px-3.5 rounded-lg border border-(--border)/40 hover:border-(--border) bg-(--card)/30 hover:bg-(--card)/60 transition-all duration-150 ${
        isDragging ? "opacity-40 scale-[0.99] border-dashed" : ""
      } ${
        item.status === "converting"
          ? "border-primary/40 bg-primary/[0.02]"
          : item.status === "done"
          ? "border-emerald-500/20"
          : item.status === "error"
          ? "border-destructive/30 bg-destructive/[0.02]"
          : ""
      }`}
    >
      {/* ── Drag Handle ── */}
      <div
        className="hidden md:flex shrink-0 cursor-grab active:cursor-grabbing text-(--border) hover:text-(--muted-foreground) transition-colors absolute left-1 top-1/2 -translate-y-1/2"
        title="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Content wrapper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 w-full md:pl-3">
        {/* ── Left: Icon + File Name + Input Size ── */}
        <button
          type="button"
          onClick={() => onPreview(item)}
          title="Preview file"
          className="flex items-center gap-2.5 sm:gap-3 min-w-0 md:w-5/12 text-left hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="shrink-0 p-2 rounded-md bg-(--background) border border-(--border)/30">
            {getCategoryIcon(item.category)}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs sm:text-sm font-medium text-(--foreground) truncate"
                title={item.name}
              >
                {item.name}
              </span>
              {item.detectedInputFormat && (
                <span className="shrink-0 px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-(--muted) text-(--muted-foreground)">
                  {item.detectedInputFormat}
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] sm:text-xs text-(--muted-foreground)">
              {formatFileSize(item.size)}
            </span>
          </div>
        </button>

        {/* ── Middle: Target Format Selector + Settings Gear ── */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-3/12 justify-between md:justify-start">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-mono text-(--muted-foreground) shrink-0">
              to:
            </span>
            <div className="relative flex-1 min-w-25">
              <select
                value={item.targetFormat}
                disabled={item.status === "converting" || item.status === "done"}
                onChange={(e) => onUpdateTargetFormat(item.id, e.target.value)}
                className="w-full h-8 px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-(--background) border border-(--border) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--ring) disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed uppercase"
              >
                {availableFormats.map((fmt) => (
                  <option key={fmt.id} value={fmt.id}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            title="Conversion Settings"
            disabled={item.status === "converting"}
            onClick={() => onOpenOptions(item)}
            className="shrink-0 p-1.5 rounded-md text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/50 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* ── Right: Status, Progress & Action Buttons ── */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-3 w-full md:w-4/12">
          {/* Status / Output Size Display */}
          <div className="flex flex-col md:items-end text-left md:text-right min-w-22.5 sm:min-w-25">
            {item.status === "idle" && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-mono text-(--muted-foreground)">
                  Ready
                </span>
                {sizeEstimate && (
                  <span className="text-[10px] font-mono text-(--muted-foreground)/60">
                    {sizeEstimate}
                  </span>
                )}
              </div>
            )}

            {item.status === "converting" && (
              <div className="flex flex-col gap-1 w-20 sm:w-24">
                <div className="flex items-center gap-1 text-xs font-mono text-primary font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{item.progress}%</span>
                </div>
                <div className="w-full h-1 bg-(--muted) rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                {item.statusText && (
                  <span className="text-[10px] font-mono text-(--muted-foreground) truncate max-w-20 sm:max-w-24">
                    {item.statusText}
                  </span>
                )}
              </div>
            )}

            {item.status === "done" && item.outputSize && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="font-mono text-xs font-medium text-emerald-500">
                  {formatFileSize(item.outputSize)}
                </span>
                {sizeDiffPercent !== null && (
                  <span
                    className={`font-mono text-[10px] px-1 py-0.2 rounded ${
                      sizeDiffPercent < 0
                        ? "text-emerald-500 bg-emerald-500/10"
                        : "text-(--muted-foreground) bg-(--muted)"
                    }`}
                  >
                    {sizeDiffPercent > 0 ? `+${sizeDiffPercent}%` : `${sizeDiffPercent}%`}
                  </span>
                )}
              </div>
            )}

            {item.status === "error" && (
              <div className="flex items-center gap-1 text-xs font-mono text-destructive">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-25 sm:max-w-30" title={item.error || "Failed"}>
                  {item.error || "Error"}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {item.status === "idle" && (
              <button
                type="button"
                title="Convert this file"
                onClick={() => onConvertSingle(item)}
                className="h-7.5 px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-(--foreground) text-(--background) hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Convert</span>
              </button>
            )}

            {item.status === "done" && (
              <button
                type="button"
                title="Download converted file"
                onClick={() => onDownloadSingle(item)}
                className="h-7.5 px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            )}

            {item.status === "error" && (
              <button
                type="button"
                title="Retry conversion"
                onClick={() => onRetry(item)}
                className="h-7.5 px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}

            <button
              type="button"
              title="Remove from batch"
              disabled={item.status === "converting"}
              onClick={() => onRemove(item.id)}
              className="p-1.5 rounded-md text-(--muted-foreground) hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
