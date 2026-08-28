"use client";

import { useMemo } from "react";
import { ThreeDConverter } from "@/components/three-d-converter";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { isCategorySupported } from "@/lib/supported-formats";

export default function ThreeDPage() {
  const { droppedFile, clearDroppedFile } = useDroppedFile();

  const validInitialFile = useMemo(() => {
    if (!droppedFile) return null;
    return isCategorySupported("3d", droppedFile) ? droppedFile : null;
  }, [droppedFile]);

  return (
    <ThreeDConverter
      initialFile={validInitialFile}
      onClearInitialFile={clearDroppedFile}
    />
  );
}
