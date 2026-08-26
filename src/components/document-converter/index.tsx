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

interface OnConversionCompletePayload {
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

interface DocumentConverterProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
  onConversionComplete?: (payload: OnConversionCompletePayload) => void;
}

export function DocumentConverter({
  initialFile,
  onClearInitialFile,
  onConversionComplete,
}: DocumentConverterProps = {}) {
  const [file, setFile] = useState<File | null>(initialFile || null);
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

  // Sync initialFile if passed from parent
  useEffect(() => {
    if (initialFile) {
      if (initialFile !== file) {
        handleFileSelect(initialFile);
      }
    } else if (file) {
      setFile(null);
      setInputFormat(null);
      setDocumentIR(null);
      setExactProbedSize(null);
      setProbedResult(null);
      setConversionResult(null);
      setErrorMsg(null);
    }
  }, [initialFile, file, handleFileSelect]);

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
  const outputName = file ? buildDocumentOutputName(file.name, targetFormat) : "";

  const resultUrl = useMemo(() => {
    if (!conversionResult?.blob) return null;
    return URL.createObjectURL(conversionResult.blob);
  }, [conversionResult?.blob]);

  const sizeDiffPercent = useMemo(() => {
    if (!exactProbedSize || !file?.size) return null;
    return Math.round(((exactProbedSize - file.size) / file.size) * 100);
  }, [exactProbedSize, file?.size]);

  return (
    <div className="relative flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 overflow-hidden">
      {/* State 1: Upload / Dropzone */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-6 flex flex-col justify-center transition-opacity duration-200 ${
          !hasFile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={hasFile}
      >
        <DocumentDropzone onFileSelect={handleFileSelect} />
      </div>

      {/* State 2: Active Workspace */}
      <div
        className={`absolute inset-0 px-4 md:px-8 py-6 flex flex-col justify-between transition-opacity duration-200 ${
          hasFile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!hasFile}
      >
        {file && (
          <div className="h-full flex flex-col justify-between gap-4">
            {/* Document Header */}
            <DocumentHeader
              file={file}
              inputFormat={inputFormat}
              metadata={documentIR?.metadata || null}
              onRemove={handleRemove}
              onPreview={() => setIsPreviewOpen(true)}
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
