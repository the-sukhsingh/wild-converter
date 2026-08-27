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
  const { droppedFile, droppedFiles, clearDroppedFiles } = useDroppedFile();
  const { addRecord } = useConversionHistory();

  const validInitialFiles = useMemo(() => {
    if (!droppedFiles || droppedFiles.length === 0) return [];
    return droppedFiles.filter((f) => isCategorySupported("images", f));
  }, [droppedFiles]);

  const validInitialFile = useMemo(() => {
    if (validInitialFiles.length > 0) return validInitialFiles[0];
    if (!droppedFile) return null;
    return isCategorySupported("images", droppedFile) ? droppedFile : null;
  }, [validInitialFiles, droppedFile]);

  const handleConversionComplete = useCallback(
    (payload: ConverterPayload) => {
      addRecord({ ...payload, category: "images" });
    },
    [addRecord]
  );

  return (
    <ImageConverter
      initialFile={validInitialFile}
      initialFiles={validInitialFiles}
      onClearInitialFile={clearDroppedFiles}
      onConversionComplete={handleConversionComplete}
    />
  );
}
