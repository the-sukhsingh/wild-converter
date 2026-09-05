"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ReportIssueModal } from "@/components/report-issue-modal";

export interface ReportIssueData {
  category?: string;
  sourceFormat?: string;
  targetFormat?: string;
  errorMessage?: string;
  fileName?: string;
  fileSize?: number;
  description?: string;
}

interface ReportIssueContextValue {
  isOpen: boolean;
  data: ReportIssueData;
  openReportIssue: (initialData?: Partial<ReportIssueData>) => void;
  closeReportIssue: () => void;
}

const ReportIssueContext = createContext<ReportIssueContextValue | null>(null);

export function ReportIssueProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ReportIssueData>({});

  const openReportIssue = useCallback((initialData?: Partial<ReportIssueData>) => {
    setData(initialData || {});
    setIsOpen(true);
  }, []);

  const closeReportIssue = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ReportIssueContext.Provider
      value={{
        isOpen,
        data,
        openReportIssue,
        closeReportIssue,
      }}
    >
      {children}
      {isOpen && (
        <ReportIssueModal
          isOpen={isOpen}
          initialData={data}
          onClose={closeReportIssue}
        />
      )}
    </ReportIssueContext.Provider>
  );
}

export function useReportIssue(): ReportIssueContextValue {
  const ctx = useContext(ReportIssueContext);
  if (!ctx) {
    throw new Error("useReportIssue must be used within a ReportIssueProvider");
  }
  return ctx;
}
