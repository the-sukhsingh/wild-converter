"use client";

import React from "react";
import { AlertCircle, Bug } from "lucide-react";
import { useReportIssue } from "@/lib/report-issue-context";

interface ConversionErrorBannerProps {
  errorMsg: string;
  category?: string;
  sourceFormat?: string;
  targetFormat?: string;
  fileName?: string;
  fileSize?: number;
  className?: string;
}

export function ConversionErrorBanner({
  errorMsg,
  category,
  sourceFormat,
  targetFormat,
  fileName,
  fileSize,
  className = "",
}: ConversionErrorBannerProps) {
  const { openReportIssue } = useReportIssue();

  return (
    <div
      className={`p-3 rounded-lg border border-destructive/25 bg-destructive/10 text-destructive flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${className}`}
    >
      <div className="flex items-center gap-2 truncate min-w-48">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="truncate" title={errorMsg}>
          {errorMsg}
        </span>
      </div>

      <button
        type="button"
        onClick={() =>
          openReportIssue({
            category,
            sourceFormat,
            targetFormat,
            errorMessage: errorMsg,
            fileName,
            fileSize,
          })
        }
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-destructive/30 bg-destructive/15 hover:bg-destructive/25 text-destructive transition-colors shrink-0 cursor-pointer"
        title="Report this error on GitHub"
      >
        <Bug className="w-3 h-3" />
        <span>Report Issue</span>
      </button>
    </div>
  );
}
