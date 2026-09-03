"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error("[Edition TV] Runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 font-sans">
      <div className="max-w-lg text-center space-y-8">
        {/* Error code */}
        <div className="space-y-2">
          <div className="text-[120px] font-black leading-none text-destructive/10 font-mono select-none">
            500
          </div>
          <div className="flex items-center justify-center gap-2 -mt-8">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="section-label text-destructive text-base">Server Error</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="headline-lg text-2xl font-extrabold text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred while loading this page. Our engineering
            team has been notified. Please try again in a moment.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-muted-foreground/50">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary text-black font-bold text-sm px-6 py-2.5 rounded-sm hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-border text-foreground font-semibold text-sm px-6 py-2.5 rounded-sm hover:bg-muted transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="h-4 w-4" /> Return to Homepage
          </Link>
        </div>

        <div className="text-xs text-muted-foreground/50 font-mono">
          Edition TV · Error 500 · Internal Server Error
        </div>
      </div>
    </div>
  );
}
