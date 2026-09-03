"use client";
import { useState, useEffect } from "react";
import { Radio, AlertOctagon, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function TerminalTopNav() {
  const [timeUtc, setTimeUtc] = useState("");
  const [timeEst, setTimeEst] = useState("");
  const [breakingActive, setBreakingActive] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().split(" ")[4] + " UTC");
      setTimeEst(now.toLocaleTimeString("en-US", { timeZone: "America/New_York" }) + " EST");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-card border-b border-border px-4 flex items-center justify-between flex-none z-20 font-mono text-xs">
      {/* Left: Ticker Banner Toggle & Status */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setBreakingActive(!breakingActive)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 text-xs font-bold border transition-colors uppercase tracking-wider",
            breakingActive
              ? "bg-red-500/20 text-red-400 border-red-500/50"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          <AlertOctagon className="h-3.5 w-3.5" />
          <span>BREAKING BANNER: {breakingActive ? "ACTIVE" : "OFF"}</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Radio className="h-3 w-3 animate-pulse" /> STREAM ONLINE
          </span>
        </div>
      </div>

      {/* Right: Live Clocks */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-xs bg-black/40 border border-border px-3 py-1 font-bold text-primary">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-primary" /> {timeUtc || "18:00:00 UTC"}
          </span>
          <span className="text-muted-foreground">|</span>
          <span>{timeEst || "13:00:00 EST"}</span>
        </div>

        <div className="flex items-center gap-2 text-[10px] bg-primary/10 border border-primary/40 px-2 py-1 text-primary font-bold">
          <ShieldCheck className="h-3 w-3" /> MODULITH PROD
        </div>
      </div>
    </header>
  );
}
