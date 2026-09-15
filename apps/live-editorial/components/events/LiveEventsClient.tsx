"use client";
import { useState } from "react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveEventItem {
  id: string;
  slug: string;
  title: string;
  status: "ACTIVE" | "PAUSED" | "CLOSED";
  updatesCount: number;
  lastUpdate: string;
}

export function LiveEventsClient() {
  // TODO: load live events from the backend. Empty until that endpoint is wired.
  const [events, setEvents] = useState<LiveEventItem[]>([]);

  const toggleStatus = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === id) {
          const nextStatus = ev.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
          return { ...ev, status: nextStatus };
        }
        return ev;
      })
    );
  };

  return (
    <div className="space-y-4 text-xs font-mono">
      <div className="bg-card border border-border rounded-none overflow-hidden shadow-xs">
        <div className="p-3 border-b border-border bg-black/40 text-primary font-bold uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-primary" /> Active Broadcast Channels ({events.length})
          </span>
        </div>

        <div className="divide-y divide-border">
          {events.length === 0 && (
            <p className="p-6 text-center text-muted-foreground text-[11px]">No live events.</p>
          )}
          {events.map((ev) => (
            <div key={ev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider",
                      ev.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    )}
                  >
                    {ev.status}
                  </span>
                  <span className="text-muted-foreground text-[10px]">/{ev.slug}</span>
                </div>
                <h3 className="font-bold text-sm text-foreground">{ev.title}</h3>
              </div>

              <div className="flex items-center gap-4 flex-none">
                <span className="text-muted-foreground font-mono">{ev.updatesCount} posts • {ev.lastUpdate}</span>
                <button
                  onClick={() => toggleStatus(ev.id)}
                  className="px-3 py-1 bg-muted border border-border font-bold text-foreground hover:bg-background transition-colors"
                >
                  {ev.status === "ACTIVE" ? "PAUSE STREAM" : "RESUME STREAM"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
