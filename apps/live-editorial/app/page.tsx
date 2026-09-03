import { Suspense } from "react";
import { MasterControlClient } from "@/components/control/MasterControlClient";

export const metadata = {
  title: "Master Control Room | Edition TV Live",
  description: "Real-time wire feed triage, live update dispatch, and breaking banner controller.",
};

export default function MasterControlPage() {
  return (
    <div className="h-full flex flex-col min-h-0 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-border pb-2 flex-none">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            LIVE DESK // MATRIX
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-primary uppercase">Master Control Room</h1>
        </div>
      </div>

      <Suspense fallback={<div className="h-64 bg-card border border-border animate-pulse" />}>
        <MasterControlClient />
      </Suspense>
    </div>
  );
}
