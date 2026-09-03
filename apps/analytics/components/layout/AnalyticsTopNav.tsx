"use client";
import { useState } from "react";
import { Calendar, Download, Users, RefreshCw } from "lucide-react";

export function AnalyticsTopNav() {
  const [range, setRange] = useState("24h");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-between flex-none z-20 font-sans">
      {/* Left: Date Filter Range Selector */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-md px-3 py-1 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-bold text-foreground">Range:</span>
          {["realtime", "24h", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
                range === r ? "bg-cyan-500 text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted"
          title="Refresh Data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
        </button>
      </div>

      {/* Right: Active Readers Counter & Export */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-md font-mono text-emerald-400 font-bold">
          <Users className="h-3.5 w-3.5 animate-pulse" />
          <span>14,280 ACTIVE READERS RIGHT NOW</span>
        </div>

        <button
          onClick={() => alert("Exporting Executive Telemetry Report (PDF / CSV)...")}
          className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-3 py-1.5 rounded-md transition-colors text-xs shadow-xs"
        >
          <Download className="h-3.5 w-3.5" /> Export Report
        </button>
      </div>
    </header>
  );
}
