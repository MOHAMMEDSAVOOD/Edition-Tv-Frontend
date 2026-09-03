"use client";
import { Globe, Smartphone, Monitor, Tablet } from "lucide-react";

export function AudienceDemographicsClient() {
  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Geographic Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country Breakdown */}
        <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" /> Top Geographic Regions
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">Real-Time IP Geo</span>
          </h3>

          <div className="space-y-3 font-mono">
            {[
              { country: "United States (US-East & West)", share: "42%", count: "287,300 active" },
              { country: "United Kingdom (London Hub)", share: "18%", count: "123,100 active" },
              { country: "Germany (DACH Region)", share: "14%", count: "95,700 active" },
              { country: "Japan (Tokyo Metro)", share: "12%", count: "82,100 active" },
              { country: "Switzerland (Zurich / Geneva)", share: "14%", count: "95,950 active" },
            ].map((c) => (
              <div key={c.country} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-foreground font-semibold">{c.country}</span>
                  <span className="text-cyan-400 font-bold">{c.share}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: c.share }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-foreground border-b border-border pb-3">Device & Client Platform Split</h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-muted/30 border border-border rounded-md space-y-1">
              <Smartphone className="h-6 w-6 text-purple-400 mx-auto" />
              <div className="text-lg font-bold font-mono text-purple-400">58%</div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Mobile (iOS / Android)</span>
            </div>

            <div className="p-4 bg-muted/30 border border-border rounded-md space-y-1">
              <Monitor className="h-6 w-6 text-cyan-400 mx-auto" />
              <div className="text-lg font-bold font-mono text-cyan-400">34%</div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Desktop Web</span>
            </div>

            <div className="p-4 bg-muted/30 border border-border rounded-md space-y-1">
              <Tablet className="h-6 w-6 text-emerald-400 mx-auto" />
              <div className="text-lg font-bold font-mono text-emerald-400">8%</div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Tablet / iPad</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
