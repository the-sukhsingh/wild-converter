"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { BatchItem } from "@/lib/batch-converter/types";
import {
  createBatchItem,
  convertBatchItem,
  resolveOutputFilename,
} from "@/lib/batch-converter/batch-runner";
import { createZipArchive, downloadBlob } from "@/lib/batch-converter/zip-builder";
import { useConversionHistory } from "@/lib/conversion-history";
import { BatchRow } from "./batch-row";
import { BatchToolbar } from "./batch-toolbar";
import { BatchItemOptionsModal } from "./batch-item-options-modal";
import { BatchPreviewModal } from "./batch-preview-modal";
import { ImageToPdfWorkspace } from "./image-to-pdf-workspace";
import { PdfToImageWorkspace } from "./pdf-to-image-workspace";
import { useBatchKeyboard } from "./use-batch-keyboard";
import { UploadDropzone } from "@/components/image-converter/upload-dropzone";
import { Search, Layers, Keyboard } from "lucide-react";

interface BatchTableProps {
  initialFiles?: File[];
  onClearInitialFiles?: () => void;
  defaultCategory?: string;
}

export function BatchTable({
  initialFiles = [],
  onClearInitialFiles,
  defaultCategory,
}: BatchTableProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeOptionsItem, setActiveOptionsItem] = useState<BatchItem | null>(null);
  const [previewItem, setPreviewItem] = useState<BatchItem | null>(null);

  // Feature 2: Drag-to-reorder state
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sub-workspaces modes
  const [isImageToPdfOpen, setIsImageToPdfOpen] = useState(false);
  const [pdfToImageFile, setPdfToImageFile] = useState<File | null>(null);

  // Batch process state
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const isCancelledRef = useRef(false);
  const { addRecord } = useConversionHistory();

  // Load initial files
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const newItems = initialFiles.map(createBatchItem);
      setItems((prev) => {
        // Append new items avoiding duplicate exact files
        const existingNames = new Set(prev.map((i) => `${i.name}-${i.size}`));
        const filtered = newItems.filter((i) => !existingNames.has(`${i.name}-${i.size}`));
        return [...prev, ...filtered];
      });
    }
  }, [initialFiles]);

  const handleAddFiles = useCallback((files: File[]) => {
    const newItems = files.map(createBatchItem);
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const handleUpdateTargetFormat = useCallback((id: string, format: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const outputName = resolveOutputFilename(item.file.name, format, item.category);
          return {
            ...item,
            targetFormat: format,
            outputName,
            status: "idle",
            progress: 0,
            resultBlob: null,
            resultUrl: null,
            outputSize: null,
            error: null,
          };
        }
        return item;
      })
    );
  }, []);

  const handleSaveOptions = useCallback((id: string, options: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, options, status: "idle", progress: 0, error: null };
        }
        return item;
      })
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    items.forEach((i) => {
      if (i.resultUrl) URL.revokeObjectURL(i.resultUrl);
    });
    setItems([]);
    onClearInitialFiles?.();
  }, [items, onClearInitialFiles]);

  const handleClearDone = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => {
        if (i.status === "done" && i.resultUrl) URL.revokeObjectURL(i.resultUrl);
      });
      return prev.filter((i) => i.status !== "done");
    });
  }, []);

  const handleApplyGlobalFormat = useCallback((format: string) => {
    setItems((prev) =>
      prev.map((item) => {
        const outputName = resolveOutputFilename(item.file.name, format, item.category);
        return {
          ...item,
          targetFormat: format,
          outputName,
          status: "idle",
          progress: 0,
          resultBlob: null,
          resultUrl: null,
          outputSize: null,
          error: null,
        };
      })
    );
  }, []);

  // Convert single item
  const handleConvertSingle = useCallback(async (item: BatchItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, status: "converting", progress: 10, statusText: "Starting...", error: null }
          : i
      )
    );

    try {
      const { blob, outputName } = await convertBatchItem(item, (prog, text) => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, progress: prog, statusText: text } : i
          )
        );
      });

      const url = URL.createObjectURL(blob);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "done",
                progress: 100,
                statusText: "Done",
                resultBlob: blob,
                resultUrl: url,
                outputName,
                outputSize: blob.size,
                error: null,
              }
            : i
        )
      );
      // Record in conversion history
      addRecord({
        category: item.category as any,
        inputFileName: item.name,
        outputFileName: outputName,
        inputSize: item.size,
        outputSize: blob.size,
        status: "done",
      });
    } catch (err) {
      console.error("Batch single conversion failed:", err);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "error",
                progress: 0,
                statusText: "Failed",
                error: err instanceof Error ? err.message : "Conversion failed",
              }
            : i
        )
      );
    }
  }, []);

  const handleDownloadSingle = useCallback((item: BatchItem) => {
    if (!item.resultBlob) return;
    downloadBlob(item.resultBlob, item.outputName);
  }, []);

  // Convert all pending items with concurrency control (2 workers max)
  const handleConvertAll = useCallback(async () => {
    const pendingItems = items.filter((i) => i.status === "idle" || i.status === "error");
    if (pendingItems.length === 0) return;

    setIsConvertingAll(true);
    isCancelledRef.current = false;

    const queue = [...pendingItems];
    const concurrency = 2;

    const runWorker = async () => {
      while (queue.length > 0 && !isCancelledRef.current) {
        const item = queue.shift();
        if (!item) break;
        await handleConvertSingle(item);
      }
    };

    const workerPromises = Array.from({ length: Math.min(concurrency, queue.length) }, () =>
      runWorker()
    );

    await Promise.all(workerPromises);
    setIsConvertingAll(false);
  }, [items, handleConvertSingle]);

  // Download all done items as ZIP
  const handleDownloadZip = useCallback(async () => {
    const doneItems = items.filter((i) => i.status === "done" && i.resultBlob);
    if (doneItems.length === 0) return;

    setIsZipping(true);
    setZipProgress(0);

    try {
      const zipBlob = await createZipArchive(
        doneItems.map((i) => ({ name: i.outputName, blob: i.resultBlob! })),
        (percent) => setZipProgress(percent)
      );
      downloadBlob(zipBlob, "converted_files.zip");
    } catch (err) {
      console.error("ZIP creation failed:", err);
    } finally {
      setIsZipping(false);
    }
  }, [items]);

  // Feature 2: Drag-to-reorder handlers
  const handleDragStart = useCallback((index: number) => {
    setDragFromIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragFromIndex !== null && dragOverIndex !== null && dragFromIndex !== dragOverIndex) {
      setItems((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragFromIndex, 1);
        next.splice(dragOverIndex, 0, moved);
        return next;
      });
    }
    setDragFromIndex(null);
    setDragOverIndex(null);
  }, [dragFromIndex, dragOverIndex]);

  // Feature 5: Keyboard shortcuts
  const handleCloseModal = useCallback(() => {
    setActiveOptionsItem(null);
    setPreviewItem(null);
  }, []);

  const hasIdleItems = items.some((i) => i.status === "idle" || i.status === "error");
  const hasDoneItems = items.some((i) => i.status === "done");

  useBatchKeyboard({
    onConvertAll: handleConvertAll,
    onDownloadZip: handleDownloadZip,
    onClearAll: handleClearAll,
    onCloseModal: handleCloseModal,
    isConvertingAll,
    hasIdleItems,
    hasDoneItems,
    hasItems: items.length > 0,
  });

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchQuery =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetFormat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "all" || item.category === categoryFilter;
    return matchQuery && matchCat;
  });

  // If in Image-to-PDF sub-workspace
  if (isImageToPdfOpen) {
    const imageFiles = items
      .filter((i) => i.category === "images")
      .map((i) => i.file);
    return (
      <ImageToPdfWorkspace
        initialFiles={imageFiles}
        onBack={() => setIsImageToPdfOpen(false)}
      />
    );
  }

  // If in PDF-to-Image sub-workspace
  if (pdfToImageFile) {
    return (
      <PdfToImageWorkspace
        pdfFile={pdfToImageFile}
        onBack={() => setPdfToImageFile(null)}
      />
    );
  }

  // If no items in batch, display upload dropzone
  if (items.length === 0) {
    return (
      <div className="relative flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-6 flex flex-col justify-center">
        <UploadDropzone
          onFileSelect={(file) => handleAddFiles([file])}
          onFilesSelect={handleAddFiles}
        />
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col justify-between h-full w-full max-w-5xl mx-auto px-4 md:px-8 py-4 overflow-hidden">
      {/* Batch Toolbar */}
      <BatchToolbar
        items={items}
        isConvertingAll={isConvertingAll}
        isZipping={isZipping}
        zipProgress={zipProgress}
        onConvertAll={handleConvertAll}
        onDownloadZip={handleDownloadZip}
        onAddFiles={handleAddFiles}
        onClearAll={handleClearAll}
        onClearDone={handleClearDone}
        onApplyGlobalFormat={handleApplyGlobalFormat}
        onOpenImageToPdf={() => setIsImageToPdfOpen(true)}
        onOpenPdfToImage={(file) => setPdfToImageFile(file)}
      />

      {/* ── Table Content / Search ── */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 py-3 overflow-hidden">
        {/* Search & Filter Header (visible if >= 4 items) */}
        {items.length >= 4 && (
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
              <input
                type="text"
                placeholder="Filter files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs font-mono rounded-md bg-(--card)/60 border border-(--border) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-1 focus:ring-(--ring)"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {(["all", "images", "documents", "audio", "video"] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-1 rounded text-xs font-mono capitalize transition-colors shrink-0 cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-(--foreground) text-(--background) font-medium"
                        : "text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/40"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Scrollable File List Rows */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
          {filteredItems.map((item, idx) => (
            <BatchRow
              key={item.id}
              item={item}
              index={idx}
              isDragging={dragFromIndex === idx}
              onUpdateTargetFormat={handleUpdateTargetFormat}
              onOpenOptions={(it) => setActiveOptionsItem(it)}
              onConvertSingle={handleConvertSingle}
              onDownloadSingle={handleDownloadSingle}
              onRemove={handleRemove}
              onRetry={handleConvertSingle}
              onPreview={(it) => setPreviewItem(it)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            />
          ))}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center border border-dashed border-(--border) rounded-xl">
              <p className="font-mono text-xs text-(--muted-foreground)">
                No matching files found.
              </p>
            </div>
          )}
        </div>

        {/* Feature 5: Keyboard shortcut hints */}
        {items.length > 0 && (
          <div className="shrink-0 hidden sm:flex items-center gap-3 pt-1">
            <Keyboard className="w-3 h-3 text-(--border) shrink-0" />
            <span className="font-mono text-[10px] text-(--border) select-none">
              Ctrl+Enter convert all · Ctrl+D download zip · Esc close
            </span>
          </div>
        )}
      </div>

      {/* Item Options Modal */}
      <BatchItemOptionsModal
        item={activeOptionsItem}
        isOpen={Boolean(activeOptionsItem)}
        onClose={() => setActiveOptionsItem(null)}
        onSaveOptions={handleSaveOptions}
      />

      {/* Feature 3: Preview Modal */}
      <BatchPreviewModal
        item={previewItem}
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        onConvert={handleConvertSingle}
        onDownload={handleDownloadSingle}
      />
    </div>
  );
}
