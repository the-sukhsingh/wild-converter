"use client";

import { useMemo } from "react";
import { FontConverter } from "@/components/font-converter";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { isCategorySupported } from "@/lib/supported-formats";

export default function FontsPage() {
  const { droppedFile, clearDroppedFile } = useDroppedFile();

  const validInitialFile = useMemo(() => {
    if (!droppedFile) return null;
    return isCategorySupported("fonts", droppedFile) ? droppedFile : null;
  }, [droppedFile]);

  return (
    <FontConverter
      initialFile={validInitialFile}
      onClearInitialFile={clearDroppedFile}
    />
  );
}
