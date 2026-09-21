"use client";

import { StoreProvider } from "@/store/StoreProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toast";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </StoreProvider>
    </ThemeProvider>
  );
}
