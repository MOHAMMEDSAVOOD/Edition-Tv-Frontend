import { TrendingUp, Users, Eye, Clock, ArrowUpRight } from "lucide-react";

interface TopStoryMetric {
  title: string;
  category: string;
  pageviews: string;
  avgReadTime: string;
  recirculation: string;
}

const TOP_STORIES: TopStoryMetric[] = [
  { title: "Zurich Quantum Lab Achieves Historic 500us Qubit Coherence Milestone", category: "Technology", pageviews: "248,500", avgReadTime: "4m 12s", recirculation: "68%" },
  { title: "Federal Reserve Holds Benchmark Interest Rates at 5.25%-5.50%", category: "Business", pageviews: "184,200", avgReadTime: "3m 45s", recirculation: "54%" },
  { title: "Geneva Plenary Approves Global Methane Emission Reduction Treaty", category: "World", pageviews: "122,900", avgReadTime: "5m 01s", recirculation: "61%" },
  { title: "EU Parliament Passes Next-Gen Semiconductor Export Controls", category: "Policy", pageviews: "98,400", avgReadTime: "3m 18s", recirculation: "49%" },
];

export function ExecutiveOverviewClient() {
  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Stat Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
            <span>Total Pageviews (24h)</span>
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400">1,248,920</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> +14.2% vs yesterday
          </span>
        </div>

        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
            <span>Unique Readers</span>
            <Users className="h-3.5 w-3.5 text-emerald-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">684,150</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> +8.7% vs target
          </span>
        </div>

        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
            <span>Avg Reading Duration</span>
            <Clock className="h-3.5 w-3.5 text-purple-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-purple-400">4m 28s</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> +32s engagement boost
          </span>
        </div>

        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
            <span>Recirculation Rate</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-amber-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">58.4%</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> Top 5% publisher benchmark
          </span>
        </div>
      </div>

      {/* Traffic Sources Breakdown & Top Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Content Table (8 cols) */}
        <div className="lg:col-span-8 bg-card border border-border rounded-md overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
            <span>Top Performing Editorial Content</span>
            <span className="text-cyan-400 font-mono">Sorted by Pageviews</span>
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
              {TOP_STORIES.map((s) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Traffic Channels (4 cols) */}
        <div className="lg:col-span-4 bg-card border border-border p-4 rounded-md space-y-4 shadow-xs">
          <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
            Traffic Acquisition Channels
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {[
              { channel: "Direct / Organic Search", share: "48%", count: "600,000 views", color: "bg-cyan-500" },
              { channel: "Social (X / LinkedIn / Substack)", share: "26%", count: "324,700 views", color: "bg-purple-500" },
              { channel: "Newsletter & RSS Relays", share: "18%", count: "224,800 views", color: "bg-emerald-500" },
              { channel: "Syndication Wires", share: "8%", count: "99,420 views", color: "bg-amber-500" },
            ].map((ch) => (
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
        </div>
      </div>
    </div>
  );
}
