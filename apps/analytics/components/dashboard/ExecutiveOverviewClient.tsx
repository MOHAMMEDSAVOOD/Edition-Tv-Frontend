"use client";

import { useState } from "react";
import { Users, Eye, Clock, ArrowUpRight } from "lucide-react";

interface TopStoryMetric {
  title: string;
  category: string;
  pageviews: string;
  avgReadTime: string;
  recirculation: string;
}

interface TrafficChannel {
  channel: string;
  share: string;
  count: string;
  color: string;
}

function StatGauge({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
      <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
        <span>{label}</span>
        {icon}
      </span>
      <div className={`text-2xl font-bold font-mono ${tone}`}>{value ?? "—"}</div>
    </div>
  );
}

export function ExecutiveOverviewClient() {
  // TODO: no backend endpoint serves audience analytics yet. These stay null/empty rather than
  // reporting invented pageview, reader and engagement figures.
  const [pageviews] = useState<string | null>(null);
  const [uniqueReaders] = useState<string | null>(null);
  const [avgReadTime] = useState<string | null>(null);
  const [recirculation] = useState<string | null>(null);
  const [topStories] = useState<TopStoryMetric[]>([]);
  const [channels] = useState<TrafficChannel[]>([]);

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Stat Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatGauge
          label="Total Pageviews (24h)"
          value={pageviews}
          tone="text-cyan-400"
          icon={<Eye className="h-3.5 w-3.5 text-cyan-400" />}
        />
        <StatGauge
          label="Unique Readers"
          value={uniqueReaders}
          tone="text-emerald-400"
          icon={<Users className="h-3.5 w-3.5 text-emerald-400" />}
        />
        <StatGauge
          label="Avg Reading Duration"
          value={avgReadTime}
          tone="text-purple-400"
          icon={<Clock className="h-3.5 w-3.5 text-purple-400" />}
        />
        <StatGauge
          label="Recirculation Rate"
          value={recirculation}
          tone="text-amber-400"
          icon={<ArrowUpRight className="h-3.5 w-3.5 text-amber-400" />}
        />
      </div>

      {/* Traffic Sources Breakdown & Top Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Content Table (8 cols) */}
        <div className="lg:col-span-8 bg-card border border-border rounded-md overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
            <span>Top Performing Editorial Content</span>
          </div>

          <table className="w-full text-left font-sans">
            <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase font-bold border-b border-border font-mono">
              <tr>
                <th className="p-3">Article Headline</th>
                <th className="p-3">Category</th>
                <th className="p-3">Pageviews</th>
                <th className="p-3">Avg Read Time</th>
                <th className="p-3">Recirculation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topStories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground font-mono">
                    No content performance data available.
                  </td>
                </tr>
              ) : (
                topStories.map((s) => (
                  <tr key={s.title} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-bold text-foreground max-w-xs truncate">{s.title}</td>
                    <td className="p-3">
                      <span className="bg-muted border border-border px-2 py-0.5 rounded text-[10px] font-mono font-bold text-muted-foreground">
                        {s.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-cyan-400">{s.pageviews}</td>
                    <td className="p-3 font-mono text-muted-foreground">{s.avgReadTime}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{s.recirculation}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Traffic Channels (4 cols) */}
        <div className="lg:col-span-4 bg-card border border-border p-4 rounded-md space-y-4 shadow-xs">
          <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
            Traffic Acquisition Channels
          </h3>

          {channels.length === 0 ? (
            <p className="text-muted-foreground font-mono text-[11px] py-4 text-center">
              No acquisition data available.
            </p>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {channels.map((ch) => (
                <div key={ch.channel} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-foreground font-semibold">{ch.channel}</span>
                    <span className="font-bold text-cyan-400">{ch.share}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${ch.color}`} style={{ width: ch.share }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
