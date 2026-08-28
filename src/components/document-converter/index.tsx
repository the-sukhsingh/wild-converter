"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  type DocumentFormat,
  detectDocumentFormat,
  buildDocumentOutputName,
  estimateDocumentOutputSize,
} from "@/lib/document-format-utils";
import {
  convertDocument,
  probeDocument,
  type DocumentConversionOptions,
  type DocumentIR,
  type DocumentConversionResult,
} from "@/lib/document-converter";
import { DocumentDropzone } from "./document-dropzone";
import { DocumentHeader } from "./document-header";
import { DocumentFormatSelector } from "./document-format-selector";
import { DocumentOptionsPanel } from "./document-options";
import { DocumentActionBar } from "./document-action-bar";
import { DocumentPreviewModal } from "./document-preview-modal";
import { BatchTable } from "@/components/batch-converter/batch-table";
import { PdfToImageWorkspace } from "@/components/batch-converter/pdf-to-image-workspace";
import { FileStack } from "lucide-react";

interface OnConversionCompletePayload {
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

interface DocumentConverterProps {
  initialFile?: File | null;
  initialFiles?: File[];
  onClearInitialFile?: () => void;
  onConversionComplete?: (payload: OnConversionCompletePayload) => void;
}

export function DocumentConverter({
  initialFile,
  initialFiles,
  onClearInitialFile,
  onConversionComplete,
}: DocumentConverterProps = {}) {
  // Batch state
  const [batchFiles, setBatchFiles] = useState<File[]>(
    initialFiles && initialFiles.length > 1 ? initialFiles : []
  );
  const [isPdfToImageMode, setIsPdfToImageMode] = useState(false);

  // Single file state
  const [file, setFile] = useState<File | null>(
    initialFiles && initialFiles.length === 1 ? initialFiles[0] : initialFile || null
  );
  const [inputFormat, setInputFormat] = useState<DocumentFormat | null>(null);
  const [targetFormat, setTargetFormat] = useState<DocumentFormat>("pdf");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<DocumentConversionOptions>({
    pdfPageSize: "a4",
    pdfOrientation: "portrait",
    pdfFontSize: 11,
    pdfMargins: "normal",
    pdfPageNumbers: true,
    pdfHeaderTitle: true,
    docxFontFamily: "sans",
    docxStylePreset: "modern",
    csvDelimiter: ",",
    csvIncludeHeaders: true,
    includeStyling: true,
    latexClass: "article",
  });

  const [documentIR, setDocumentIR] = useState<DocumentIR | null>(null);
  const [exactProbedSize, setExactProbedSize] = useState<number | null>(null);
  const [probedResult, setProbedResult] = useState<DocumentConversionResult | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatusText, setConversionStatusText] = useState("");
  const [conversionResult, setConversionResult] = useState<DocumentConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Handle file select
  const handleFileSelect = useCallback((f: File) => {
    setBatchFiles([]);
    setFile(f);
    const detected = detectDocumentFormat(f);
    setInputFormat(detected);

    if (detected === "pdf") {
      setTargetFormat("docx");
    } else if (detected === "xlsx" || detected === "xls" || detected === "ods") {
      setTargetFormat("csv");
    } else {
      setTargetFormat("pdf");
    }

    setSearchQuery("");
    setConversionResult(null);
    setErrorMsg(null);
  }, []);

  const handleFilesSelect = useCallback((files: File[]) => {
    if (files.length > 1) {
      setBatchFiles(files);
      setFile(null);
    } else if (files.length === 1) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Sync initialFiles or initialFile from props
  useEffect(() => {
    if (initialFiles && initialFiles.length > 1) {
      setBatchFiles(initialFiles);
      setFile(null);
    } else if (initialFiles && initialFiles.length === 1) {
      handleFileSelect(initialFiles[0]);
    } else if (initialFile) {
      handleFileSelect(initialFile);
    }
  }, [initialFile, initialFiles, handleFileSelect]);

  // Parse document in background when file changes
  useEffect(() => {
    if (!file) {
      setDocumentIR(null);
      setExactProbedSize(null);
      setProbedResult(null);
      return;
    }

    let active = true;
    setIsProbing(true);

    probeDocument(file)
      .then((ir) => {
        if (active) {
          setDocumentIR(ir);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Probe error:", err);
        }
      });

    return () => {
      active = false;
    };
  }, [file]);

  // Live exact size background probe (debounced 40ms)
  useEffect(() => {
    if (!file || !targetFormat) {
      setExactProbedSize(null);
      setProbedResult(null);
      return;
    }

    const synEst = estimateDocumentOutputSize(file.size, targetFormat);
    setExactProbedSize(synEst);

    let active = true;
    setIsProbing(true);
    const timer = setTimeout(async () => {
      try {
        const res = await convertDocument(file, targetFormat, options);
        if (active) {
          setExactProbedSize(res.blob.size);
          setProbedResult(res);
          setIsProbing(false);
        }
      } catch {
        if (active) setIsProbing(false);
      }
    }, 40);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [file, targetFormat, options]);

  // Reset conversion state when parameters change
  useEffect(() => {
    setConversionResult(null);
    setErrorMsg(null);
    setConversionProgress(0);
    setConversionStatusText("");
  }, [file, targetFormat, options]);

  const isCancelledRef = useRef(false);

  const handleCancel = useCallback(() => {
    isCancelledRef.current = true;
    setIsConverting(false);
    setConversionProgress(0);
    setConversionStatusText("");
  }, []);

  const handleRemove = useCallback(() => {
    handleCancel();
    setFile(null);
    setBatchFiles([]);
    setInputFormat(null);
    setDocumentIR(null);
    setExactProbedSize(null);
    setProbedResult(null);
    setConversionResult(null);
    setErrorMsg(null);
    if (onClearInitialFile) onClearInitialFile();
  }, [handleCancel, onClearInitialFile]);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    isCancelledRef.current = false;
    setIsConverting(true);
    setErrorMsg(null);
    setConversionProgress(15);
    setConversionStatusText("Compiling document structure...");

    try {
      let result = probedResult;
      if (!result) {
        result = await convertDocument(file, targetFormat, options, (progress, text) => {
          if (!isCancelledRef.current) {
            setConversionProgress(progress);
            setConversionStatusText(text);
          }
        });
      }
      if (isCancelledRef.current) return;
      setConversionResult(result);
      setConversionProgress(100);
      setIsConverting(false);
      onConversionComplete?.({
        inputFileName: file.name,
        outputFileName: buildDocumentOutputName(file.name, targetFormat),
        inputSize: file.size,
        outputSize: result.blob.size,
        status: "done",
      });
    } catch (err) {
      if (isCancelledRef.current) return;
      console.error("Conversion error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Document conversion failed");
      setIsConverting(false);
    }
  }, [file, targetFormat, options, probedResult, onConversionComplete]);

  const hasFile = !!file;
  const isPdf = inputFormat === "pdf" || (file?.name.toLowerCase().endsWith(".pdf") ?? false);
  const outputName = file ? buildDocumentOutputName(file.name, targetFormat) : "";

  const resultUrl = useMemo(() => {
    if (!conversionResult?.blob) return null;
    return URL.createObjectURL(conversionResult.blob);
  }, [conversionResult?.blob]);

  const sizeDiffPercent = useMemo(() => {
    if (!exactProbedSize || !file?.size) return null;
    return Math.round(((exactProbedSize - file.size) / file.size) * 100);
  }, [exactProbedSize, file?.size]);

  // If in PDF-to-Image mode
  if (isPdfToImageMode && file) {
    return (
      <PdfToImageWorkspace
        pdfFile={file}
        onBack={() => setIsPdfToImageMode(false)}
      />
    );
  }

  // If batch files
  if (batchFiles.length > 0) {
    return (
      <BatchTable
        initialFiles={batchFiles}
        onClearInitialFiles={handleRemove}
        defaultCategory="documents"
      />
    );
  }

  return (
    <div className="relative flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 overflow-hidden">
      {/* State 1: Upload / Dropzone */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-4 sm:py-6 overflow-y-auto flex flex-col justify-center transition-opacity duration-200 ${
          !hasFile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={hasFile}
      >
        <DocumentDropzone
          onFileSelect={handleFileSelect}
          onFilesSelect={handleFilesSelect}
        />
      </div>

      {/* State 2: Active Workspace */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-4 sm:py-6 overflow-y-auto min-h-0 transition-opacity duration-200 ${
          hasFile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!hasFile}
      >
        {file && (
          <div className="min-h-full flex flex-col justify-between gap-3 sm:gap-4">
            {/* Document Header with PDF-to-Image quick action */}
            <DocumentHeader
              file={file}
              inputFormat={inputFormat}
              metadata={documentIR?.metadata || null}
              onRemove={handleRemove}
              onPreview={() => setIsPreviewOpen(true)}
              extraAction={
                isPdf ? (
                  <button
                    type="button"
                    onClick={() => setIsPdfToImageMode(true)}
                    className="px-2 py-1 text-xs font-mono font-medium rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileStack className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden sm:inline">PDF to Images</span>
                    <span className="sm:hidden">to Images</span>
                  </button>
                ) : undefined
              }
            />

            {/* Target Format Selector */}
            <DocumentFormatSelector
              selectedFormat={targetFormat}
              inputFormat={inputFormat}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectFormat={(fmt) => {
                setTargetFormat(fmt);
                setSearchQuery("");
              }}
            />

            {/* Format-Specific Options Panel */}
            <DocumentOptionsPanel
              targetFormat={targetFormat}
              options={options}
              onOptionsChange={setOptions}
            />

            {/* Action Bar */}
            <DocumentActionBar
              targetFormat={targetFormat}
              exactProbedSize={exactProbedSize}
              sizeDiffPercent={sizeDiffPercent}
              isProbing={isProbing}
              isConverting={isConverting}
              progress={conversionProgress}
              progressText={conversionStatusText}
              resultUrl={resultUrl}
              resultBlob={conversionResult?.blob || null}
              outputName={outputName}
              onConvert={handleConvert}
              onCancel={handleCancel}
            />

            {errorMsg && (
              <div className="text-xs font-mono text-destructive">
                {errorMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        documentIR={documentIR}
      />
    </div>
  );
}
