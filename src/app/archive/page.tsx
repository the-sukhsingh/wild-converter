"use client";

import { useMemo } from "react";
import { ArchiveConverter } from "@/components/archive-converter";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { isCategorySupported } from "@/lib/supported-formats";

export default function ArchivePage() {
  const { droppedFile, clearDroppedFile } = useDroppedFile();

  const validInitialFile = useMemo(() => {
    if (!droppedFile) return null;
    return isCategorySupported("archive", droppedFile) ? droppedFile : null;
  }, [droppedFile]);

  return (
    <ArchiveConverter
      initialFile={validInitialFile}
      onClearInitialFile={clearDroppedFile}
    />
  );
}
