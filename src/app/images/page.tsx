"use client";

import { useMemo } from "react";
import { ImageConverter } from "@/components/image-converter";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { isCategorySupported } from "@/lib/supported-formats";

export default function ImagesPage() {
  const { droppedFile, droppedFiles, clearDroppedFiles } = useDroppedFile();

  const validInitialFiles = useMemo(() => {
    if (!droppedFiles || droppedFiles.length === 0) return [];
    return droppedFiles.filter((f) => isCategorySupported("images", f));
  }, [droppedFiles]);

  const validInitialFile = useMemo(() => {
    if (validInitialFiles.length > 0) return validInitialFiles[0];
    if (!droppedFile) return null;
    return isCategorySupported("images", droppedFile) ? droppedFile : null;
  }, [validInitialFiles, droppedFile]);

  return (
    <ImageConverter
      initialFile={validInitialFile}
      initialFiles={validInitialFiles}
      onClearInitialFile={clearDroppedFiles}
    />
  );
}
