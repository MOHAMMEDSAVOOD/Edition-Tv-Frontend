"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WireRecord {
  id: string;
  source: "REUTERS" | "AP" | "AFP" | "BLOOMBERG";
  time: string;
  headline: string;
  category: string;
  triaged: boolean;
}

export function WireStreamClient() {
  // TODO: load the wire stream from the ingestion backend. Empty rather than seeded with sample
  // copy attributed to real wire agencies.
  const [wires, setWires] = useState<WireRecord[]>([]);
  const [sourceFilter, setSourceFilter] = useState("ALL");

  const filtered = wires.filter((w) => sourceFilter === "ALL" || w.source === sourceFilter);

  const handleMarkTriaged = (id: string) => {
    setWires((prev) => prev.map((w) => (w.id === id ? { ...w, triaged: true } : w)));
  };

  return (
    <div className="space-y-4 text-xs font-mono">
      {/* Filter bar */}
      <div className="bg-card border border-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-muted-foreground uppercase text-[10px]">Filter Wire:</span>
          {["ALL", "REUTERS", "AP", "AFP", "BLOOMBERG"].map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={cn(
                "px-2.5 py-1 text-xs font-bold border transition-colors",
                sourceFilter === src ? "bg-primary text-black border-primary" : "bg-muted text-muted-foreground border-border"
              )}
            >
              {src}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{filtered.length} Wire Records</span>
      </div>

      {/* Wire List */}
      <div className="bg-card border border-border divide-y divide-border">
        {filtered.length === 0 && (
          <p className="p-6 text-center text-muted-foreground text-[11px]">No wire items.</p>
        )}
        {filtered.map((wire) => (
          <div key={wire.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="font-bold text-primary">{wire.source}</span>
                <span className="text-muted-foreground font-mono">{wire.time}</span>
                <span className="bg-muted px-1.5 py-0.5 border border-border text-muted-foreground font-bold">{wire.category}</span>
              </div>
              <h3 className="font-bold text-sm text-foreground">{wire.headline}</h3>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {!wire.triaged ? (
                <button
                  onClick={() => handleMarkTriaged(wire.id)}
                  className="bg-primary text-black font-bold px-3 py-1 text-xs hover:opacity-90 transition-opacity"
                >
                  Triage Wire →
                </button>
              ) : (
                <span className="text-emerald-400 font-bold border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] flex items-center gap-1">
                  <Check className="h-3 w-3" /> TRIAGED
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
