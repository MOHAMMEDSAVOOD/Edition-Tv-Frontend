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

const INITIAL_EVENTS: LiveEventItem[] = [
  { id: "ev-1", slug: "global-tech-summit", title: "Global Tech & Climate Policy Summit 2026", status: "ACTIVE", updatesCount: 42, lastUpdate: "2 mins ago" },
  { id: "ev-2", slug: "fed-interest-rate-announcement", title: "Federal Reserve FOMC Rate Decision & Presser", status: "ACTIVE", updatesCount: 18, lastUpdate: "15 mins ago" },
  { id: "ev-3", slug: "geneva-climate-plenary", title: "Geneva Plenary Methane Accord Reading", status: "PAUSED", updatesCount: 29, lastUpdate: "1 hour ago" },
];

export function LiveEventsClient() {
  const [events, setEvents] = useState<LiveEventItem[]>(INITIAL_EVENTS);

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
