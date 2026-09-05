"use client";

import { useMemo } from "react";
import { CodeConverter } from "@/components/code-converter";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { isCategorySupported } from "@/lib/supported-formats";

export default function CodePage() {
  const { droppedFile, droppedFiles, clearDroppedFiles } = useDroppedFile();

  const validInitialFiles = useMemo(() => {
    if (!droppedFiles || droppedFiles.length === 0) return [];
    return droppedFiles.filter((f) => isCategorySupported("code", f));
  }, [droppedFiles]);

  const validInitialFile = useMemo(() => {
    if (validInitialFiles.length > 0) return validInitialFiles[0];
    if (!droppedFile) return null;
    return isCategorySupported("code", droppedFile) ? droppedFile : null;
  }, [validInitialFiles, droppedFile]);

  return (
    <CodeConverter
      initialFile={validInitialFile}
      onClearInitialFile={clearDroppedFiles}
    />
  );
}
