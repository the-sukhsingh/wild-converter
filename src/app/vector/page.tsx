"use client";

import { useMemo } from "react";
import { VectorConverter } from "@/components/vector-converter";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { isCategorySupported } from "@/lib/supported-formats";

export default function VectorPage() {
  const { droppedFile, clearDroppedFile } = useDroppedFile();

  const validInitialFile = useMemo(() => {
    if (!droppedFile) return null;
    return isCategorySupported("vector", droppedFile) ? droppedFile : null;
  }, [droppedFile]);

  return (
    <VectorConverter
      initialFile={validInitialFile}
      onClearInitialFile={clearDroppedFile}
    />
  );
}
