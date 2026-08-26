"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface DroppedFileContextValue {
  droppedFile: File | null;
  setDroppedFile: (file: File | null) => void;
  clearDroppedFile: () => void;
}

const DroppedFileContext = createContext<DroppedFileContextValue | null>(null);

export function DroppedFileProvider({ children }: { children: ReactNode }) {
  const [droppedFile, setDroppedFileState] = useState<File | null>(null);

  const setDroppedFile = useCallback((file: File | null) => {
    setDroppedFileState(file);
  }, []);

  const clearDroppedFile = useCallback(() => {
    setDroppedFileState(null);
  }, []);

  return (
    <DroppedFileContext.Provider value={{ droppedFile, setDroppedFile, clearDroppedFile }}>
      {children}
    </DroppedFileContext.Provider>
  );
}

export function useDroppedFile(): DroppedFileContextValue {
  const ctx = useContext(DroppedFileContext);
  if (!ctx) throw new Error("useDroppedFile must be used within DroppedFileProvider");
  return ctx;
}
