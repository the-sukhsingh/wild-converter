"use client";

import { useMemo, useCallback } from "react";
import { AudioConverter } from "@/components/audio-converter";
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

export default function AudioPage() {
  const { droppedFile, droppedFiles, clearDroppedFiles } = useDroppedFile();
  const { addRecord } = useConversionHistory();

  const validInitialFiles = useMemo(() => {
    if (!droppedFiles || droppedFiles.length === 0) return [];
    return droppedFiles.filter((f) => isCategorySupported("audio", f));
  }, [droppedFiles]);

  const validInitialFile = useMemo(() => {
    if (validInitialFiles.length > 0) return validInitialFiles[0];
    if (!droppedFile) return null;
    return isCategorySupported("audio", droppedFile) ? droppedFile : null;
  }, [validInitialFiles, droppedFile]);

  const handleConversionComplete = useCallback(
    (payload: ConverterPayload) => {
      addRecord({ ...payload, category: "audio" });
    },
    [addRecord]
  );

  return (
    <AudioConverter
      initialFile={validInitialFile}
      initialFiles={validInitialFiles}
      onClearInitialFile={clearDroppedFiles}
      onConversionComplete={handleConversionComplete}
    />
  );
}
