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

const AudioConverter = dynamic(
  () => import("@/components/audio-converter").then((m) => m.AudioConverter),
  { ssr: false, loading: LoadingWorkspace }
);

interface ConverterPayload {
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

export default function AudioPage() {
  const { droppedFile, clearDroppedFile } = useDroppedFile();
  const { addRecord } = useConversionHistory();

  const handleConversionComplete = useCallback(
    (payload: ConverterPayload) => {
      addRecord({ ...payload, category: "audio" });
    },
    [addRecord]
  );

  return (
    <AudioConverter
      initialFile={droppedFile}
      onClearInitialFile={clearDroppedFile}
      onConversionComplete={handleConversionComplete}
    />
  );
}
