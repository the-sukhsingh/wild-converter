"use client";

import { useState, useEffect } from "react";
import type { BatchItem } from "@/lib/batch-converter/types";
import { X, Check } from "lucide-react";

interface BatchItemOptionsModalProps {
  item: BatchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveOptions: (id: string, options: any) => void;
}

export function BatchItemOptionsModal({
  item,
  isOpen,
  onClose,
  onSaveOptions,
}: BatchItemOptionsModalProps) {
  const [options, setOptions] = useState<any>({});

  useEffect(() => {
    if (item) {
      setOptions({ ...(item.options || {}) });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    onSaveOptions(item.id, options);
    onClose();
  };

  const isImage = item.category === "images";
  const isDoc = item.category === "documents";
  const isAudio = item.category === "audio";
  const isVideo = item.category === "video";
  const isVector = item.category === "vector";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl bg-[var(--background)] border border-[var(--border)] shadow-2xl p-5 flex flex-col gap-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)]/60 pb-3">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold font-mono text-[var(--foreground)]">
              Conversion Options
            </h3>
            <span className="text-xs font-mono text-[var(--muted-foreground)] truncate max-w-xs">
              {item.name} → {item.targetFormat.toUpperCase()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options Body */}
        <div className="flex flex-col gap-4 text-xs font-mono py-1 max-h-[60vh] overflow-y-auto">
          {/* Images Options */}
          {isImage && (
            <>
              {/* Quality */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Quality:</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {Math.round((options.quality ?? 0.85) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={options.quality ?? 0.85}
                  onChange={(e) =>
                    setOptions({ ...options, quality: parseFloat(e.target.value) })
                  }
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Custom Dimensions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--muted-foreground)]">Width (px):</span>
                  <input
                    type="number"
                    placeholder="Auto (original)"
                    value={options.width || ""}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        width: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--muted-foreground)]">Height (px):</span>
                  <input
                    type="number"
                    placeholder="Auto (original)"
                    value={options.height || ""}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        height: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]"
                  />
                </div>
              </div>

              {item.targetFormat === "pdf" && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-[var(--muted-foreground)]">Page Size:</span>
                    <select
                      value={options.pdfPageSize || "a4"}
                      onChange={(e) =>
                        setOptions({ ...options, pdfPageSize: e.target.value })
                      }
                      className="px-2 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] uppercase"
                    >
                      <option value="a4">A4</option>
                      <option value="letter">Letter</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[var(--muted-foreground)]">Orientation:</span>
                    <select
                      value={options.pdfOrientation || "portrait"}
                      onChange={(e) =>
                        setOptions({ ...options, pdfOrientation: e.target.value })
                      }
                      className="px-2 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] capitalize"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Document Options */}
          {isDoc && (
            <>
              {item.targetFormat === "pdf" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[var(--muted-foreground)]">Page Format:</span>
                    <select
                      value={options.pdfPageSize || "a4"}
                      onChange={(e) =>
                        setOptions({ ...options, pdfPageSize: e.target.value })
                      }
                      className="px-2 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] uppercase"
                    >
                      <option value="a4">A4 Standard</option>
                      <option value="letter">US Letter</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[var(--muted-foreground)]">Orientation:</span>
                    <select
                      value={options.pdfOrientation || "portrait"}
                      onChange={(e) =>
                        setOptions({ ...options, pdfOrientation: e.target.value })
                      }
                      className="px-2 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] capitalize"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="opt-include-styling"
                  checked={options.includeStyling ?? true}
                  onChange={(e) =>
                    setOptions({ ...options, includeStyling: e.target.checked })
                  }
                  className="rounded border-[var(--border)] accent-primary cursor-pointer"
                />
                <label
                  htmlFor="opt-include-styling"
                  className="text-[var(--foreground)] cursor-pointer select-none"
                >
                  Preserve rich headings, tables & styling
                </label>
              </div>
            </>
          )}

          {/* Audio Options */}
          {isAudio && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-[var(--muted-foreground)]">Audio Bitrate:</span>
                <select
                  value={options.bitrate || 256}
                  onChange={(e) =>
                    setOptions({ ...options, bitrate: parseInt(e.target.value, 10) })
                  }
                  className="px-2 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]"
                >
                  <option value={128}>128 kbps (Compact)</option>
                  <option value={192}>192 kbps (Standard)</option>
                  <option value={256}>256 kbps (High Quality)</option>
                  <option value={320}>320 kbps (Extreme)</option>
                </select>
              </div>
            </>
          )}

          {/* Vector Options */}
          {isVector && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-[var(--muted-foreground)]">Background:</span>
                <select
                  value={options.background || "transparent"}
                  onChange={(e) =>
                    setOptions({ ...options, background: e.target.value })
                  }
                  className="px-2 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] capitalize"
                >
                  <option value="transparent">Transparent</option>
                  <option value="white">Solid White</option>
                  <option value="black">Solid Black</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)]/60 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-mono rounded-md border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3.5 py-1.5 text-xs font-mono font-medium rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
