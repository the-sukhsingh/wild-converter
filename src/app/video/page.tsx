"use client";

import { useMemo } from "react";
import { VideoConverter } from "@/components/video-converter";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { isCategorySupported } from "@/lib/supported-formats";

export default function VideoPage() {
  const { droppedFile, clearDroppedFile } = useDroppedFile();

  const validInitialFile = useMemo(() => {
    if (!droppedFile) return null;
    return isCategorySupported("video", droppedFile) ? droppedFile : null;
  }, [droppedFile]);

  return (
    <VideoConverter
      initialFile={validInitialFile}
      onClearInitialFile={clearDroppedFile}
    />
  );
}
