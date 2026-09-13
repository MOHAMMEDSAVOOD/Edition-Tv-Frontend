import React from "react";
import { Loader2 } from "lucide-react";

export default function LeadsLoading() {
  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground font-mono">Loading Lead Management Dashboard...</p>
    </div>
  );
}
