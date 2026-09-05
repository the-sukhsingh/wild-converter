"use client";

import { ThemeProvider } from "next-themes";
import { DroppedFileProvider } from "@/lib/dropped-file-context";
import { ReportIssueProvider } from "@/lib/report-issue-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DroppedFileProvider>
        <ReportIssueProvider>
          {children}
        </ReportIssueProvider>
      </DroppedFileProvider>
    </ThemeProvider>
  );
}

export default Providers;