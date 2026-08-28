"use client";

import { useMemo } from "react";
import { AudioConverter } from "@/components/audio-converter";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { isCategorySupported } from "@/lib/supported-formats";

export default function AudioPage() {
  const { droppedFile, droppedFiles, clearDroppedFiles } = useDroppedFile();

  const validInitialFiles = useMemo(() => {
    if (!droppedFiles || droppedFiles.length === 0) return [];
    return droppedFiles.filter((f) => isCategorySupported("audio", f));
  }, [droppedFiles]);

  const validInitialFile = useMemo(() => {
    if (validInitialFiles.length > 0) return validInitialFiles[0];
    if (!droppedFile) return null;
    return isCategorySupported("audio", droppedFile) ? droppedFile : null;
  }, [validInitialFiles, droppedFile]);

  return (
    <AudioConverter
      initialFile={validInitialFile}
      initialFiles={validInitialFiles}
      onClearInitialFile={clearDroppedFiles}
    />
  );
}
