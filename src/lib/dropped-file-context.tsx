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
  droppedFiles: File[];
  setDroppedFile: (file: File | null) => void;
  setDroppedFiles: (files: File[]) => void;
  addDroppedFiles: (files: File[]) => void;
  clearDroppedFile: () => void;
  clearDroppedFiles: () => void;
}

const DroppedFileContext = createContext<DroppedFileContextValue | null>(null);

export function DroppedFileProvider({ children }: { children: ReactNode }) {
  const [droppedFiles, setDroppedFilesState] = useState<File[]>([]);

  const setDroppedFile = useCallback((file: File | null) => {
    setDroppedFilesState(file ? [file] : []);
  }, []);

  const setDroppedFiles = useCallback((files: File[]) => {
    setDroppedFilesState(files);
  }, []);

  const addDroppedFiles = useCallback((files: File[]) => {
    setDroppedFilesState((prev) => [...prev, ...files]);
  }, []);

  const clearDroppedFile = useCallback(() => {
    setDroppedFilesState([]);
  }, []);

  const clearDroppedFiles = useCallback(() => {
    setDroppedFilesState([]);
  }, []);

  const droppedFile = droppedFiles.length > 0 ? droppedFiles[0] : null;

  return (
    <DroppedFileContext.Provider
      value={{
        droppedFile,
        droppedFiles,
        setDroppedFile,
        setDroppedFiles,
        addDroppedFiles,
        clearDroppedFile,
        clearDroppedFiles,
      }}
    >
      {children}
    </DroppedFileContext.Provider>
  );
}

export function useDroppedFile(): DroppedFileContextValue {
  const ctx = useContext(DroppedFileContext);
  if (!ctx) throw new Error("useDroppedFile must be used within DroppedFileProvider");
  return ctx;
}
