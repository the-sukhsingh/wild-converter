"use client";

import { ThemeProvider } from "next-themes";
import { ConversionHistoryProvider } from "@/lib/conversion-history";
import { DroppedFileProvider } from "@/lib/dropped-file-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ConversionHistoryProvider>
        <DroppedFileProvider>
          {children}
        </DroppedFileProvider>
      </ConversionHistoryProvider>
    </ThemeProvider>
  );
}

export default Providers;