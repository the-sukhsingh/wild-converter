"use client";

import { useMemo, useCallback } from "react";
import { VectorConverter } from "@/components/vector-converter";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { useConversionHistory } from "@/lib/conversion-history";
import { isCategorySupported } from "@/lib/supported-formats";

interface ConverterPayload {
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

export default function VectorPage() {
  const { droppedFile, clearDroppedFile } = useDroppedFile();
  const { addRecord } = useConversionHistory();

  const validInitialFile = useMemo(() => {
    if (!droppedFile) return null;
    return isCategorySupported("vector", droppedFile) ? droppedFile : null;
  }, [droppedFile]);

  const handleConversionComplete = useCallback(
    (payload: ConverterPayload) => {
      addRecord({ ...payload, category: "vector" });
    },
    [addRecord]
  );

  return (
    <VectorConverter
      initialFile={validInitialFile}
      onClearInitialFile={clearDroppedFile}
      onConversionComplete={handleConversionComplete}
    />
  );
}
