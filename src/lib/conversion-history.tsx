"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type ConverterCategory =
  | "images"
  | "documents"
  | "audio"
  | "video"
  | "vector"
  | "3d"
  | "fonts"
  | "archive";

export interface ConversionRecord {
  id: string;
  timestamp: number;
  category: ConverterCategory;
  inputFileName: string;
  outputFileName: string;
  inputSize: number;
  outputSize: number;
  status: "done" | "error";
}

interface ConversionHistoryContextValue {
  records: ConversionRecord[];
  addRecord: (record: Omit<ConversionRecord, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

const SESSION_KEY = "wild-converter-history";

const ConversionHistoryContext = createContext<ConversionHistoryContextValue | null>(null);

function loadFromSession(): ConversionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as ConversionRecord[]) : [];
  } catch {
    return [];
  }
}

export function ConversionHistoryProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<ConversionRecord[]>([]);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    setRecords(loadFromSession());
  }, []);

  // Persist on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(records));
      } catch {
        // quota exceeded or private mode — ignore
      }
    }
  }, [records]);

  const addRecord = useCallback(
    (record: Omit<ConversionRecord, "id" | "timestamp">) => {
      const full: ConversionRecord = {
        ...record,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
      };
      setRecords((prev) => [full, ...prev].slice(0, 200)); // keep last 200
    },
    []
  );

  const clearHistory = useCallback(() => {
    setRecords([]);
  }, []);

  return (
    <ConversionHistoryContext.Provider value={{ records, addRecord, clearHistory }}>
      {children}
    </ConversionHistoryContext.Provider>
  );
}

export function useConversionHistory(): ConversionHistoryContextValue {
  const ctx = useContext(ConversionHistoryContext);
  if (!ctx) throw new Error("useConversionHistory must be used within ConversionHistoryProvider");
  return ctx;
}
