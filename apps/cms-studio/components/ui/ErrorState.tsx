import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Failed to load data",
  message = "An error occurred while fetching information from the newsroom API server.",
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-lg border border-red-500/20 bg-red-500/5 min-h-[220px]",
        className
      )}
      {...props}
    >
      <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-bold text-foreground font-sans">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md mt-1 font-sans">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
