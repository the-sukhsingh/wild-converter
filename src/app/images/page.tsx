"use client";

import { useMemo, useCallback } from "react";
import { ImageConverter } from "@/components/image-converter";
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

export default function ImagesPage() {
  const { droppedFile, clearDroppedFile } = useDroppedFile();
  const { addRecord } = useConversionHistory();

  const validInitialFile = useMemo(() => {
    if (!droppedFile) return null;
    return isCategorySupported("images", droppedFile) ? droppedFile : null;
  }, [droppedFile]);

  const handleConversionComplete = useCallback(
    (payload: ConverterPayload) => {
      addRecord({ ...payload, category: "images" });
    },
    [addRecord]
  );

  return (
    <ImageConverter
      initialFile={validInitialFile}
      onClearInitialFile={clearDroppedFile}
      onConversionComplete={handleConversionComplete}
    />
  );
}
