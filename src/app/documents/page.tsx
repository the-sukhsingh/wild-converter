"use client";

import { useMemo } from "react";
import { DocumentConverter } from "@/components/document-converter";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { isCategorySupported } from "@/lib/supported-formats";

export default function DocumentsPage() {
  const { droppedFile, droppedFiles, clearDroppedFiles } = useDroppedFile();

  const validInitialFiles = useMemo(() => {
    if (!droppedFiles || droppedFiles.length === 0) return [];
    return droppedFiles.filter((f) => isCategorySupported("documents", f));
  }, [droppedFiles]);

  const validInitialFile = useMemo(() => {
    if (validInitialFiles.length > 0) return validInitialFiles[0];
    if (!droppedFile) return null;
    return isCategorySupported("documents", droppedFile) ? droppedFile : null;
  }, [validInitialFiles, droppedFile]);

  return (
    <DocumentConverter
      initialFile={validInitialFile}
      initialFiles={validInitialFiles}
      onClearInitialFile={clearDroppedFiles}
    />
  );
}
