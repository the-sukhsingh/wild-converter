"use client";

import dynamic from "next/dynamic";
import { useDroppedFile } from "@/lib/dropped-file-context";
import { useConversionHistory } from "@/lib/conversion-history";
import { useCallback } from "react";

const LoadingWorkspace = () => (
  <div className="flex-1 flex items-center justify-center p-8 text-xs font-mono text-[var(--muted-foreground)]">
    initializing converter workspace...
  </div>
);

const VideoConverter = dynamic(
  () => import("@/components/video-converter").then((m) => m.VideoConverter),
  { ssr: false, loading: LoadingWorkspace }
);

interface ConverterPayload {
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

export default function VideoPage() {
  const { droppedFile, clearDroppedFile } = useDroppedFile();
  const { addRecord } = useConversionHistory();

  const handleConversionComplete = useCallback(
    (payload: ConverterPayload) => {
      addRecord({ ...payload, category: "video" });
    },
    [addRecord]
  );

  return (
    <VideoConverter
      initialFile={droppedFile}
      onClearInitialFile={clearDroppedFile}
      onConversionComplete={handleConversionComplete}
    />
  );
}
