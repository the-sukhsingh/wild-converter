"use client";

import { ThemeProvider } from "next-themes";
import { DroppedFileProvider } from "@/lib/dropped-file-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DroppedFileProvider>
        {children}
      </DroppedFileProvider>
    </ThemeProvider>
  );
}

export default Providers;