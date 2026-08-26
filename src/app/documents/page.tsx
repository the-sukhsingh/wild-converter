"use client";

import dynamic from "next/dynamic";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { useConversionHistory } from "@/lib/conversion-history";
import { useCallback } from "react";

const LoadingWorkspace = () => (
  <div className="flex-1 flex items-center justify-center p-8 text-xs font-mono text-[var(--muted-foreground)]">
    initializing converter workspace...
  </div>
);

const DocumentConverter = dynamic(
  () => import("@/components/document-converter").then((m) => m.DocumentConverter),
  { ssr: false, loading: LoadingWorkspace }
);

interface ConverterPayload {
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

export default function DocumentsPage() {
  const { droppedFile, clearDroppedFile } = useDroppedFile();
  const { addRecord } = useConversionHistory();

  const handleConversionComplete = useCallback(
    (payload: ConverterPayload) => {
      addRecord({ ...payload, category: "documents" });
    },
    [addRecord]
  );

  return (
    <DocumentConverter
      initialFile={droppedFile}
      onClearInitialFile={clearDroppedFile}
      onConversionComplete={handleConversionComplete}
    />
  );
}
