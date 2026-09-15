"use client";
import { useState } from "react";
import { Globe, Smartphone, Monitor, Tablet } from "lucide-react";

interface RegionShare {
  country: string;
  share: string;
  count: string;
}

interface DeviceShare {
  mobile: string;
  desktop: string;
  tablet: string;
}

export function AudienceDemographicsClient() {
  // TODO: no backend endpoint serves audience geography or device split yet. Both stay empty
  // rather than reporting invented reader counts and platform percentages.
  const [regions] = useState<RegionShare[]>([]);
  const [devices] = useState<DeviceShare | null>(null);

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
          </h3>

          {regions.length === 0 ? (
            <p className="text-muted-foreground font-mono text-[11px] py-6 text-center">
              No geographic data available.
            </p>
          ) : (
            <div className="space-y-3 font-mono">
              {regions.map((c) => (
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
          )}
        </div>

        {/* Device Breakdown */}
        <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-foreground border-b border-border pb-3">Device & Client Platform Split</h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-muted/30 border border-border rounded-md space-y-1">
              <Smartphone className="h-6 w-6 text-purple-400 mx-auto" />
              <div className="text-lg font-bold font-mono text-purple-400">{devices?.mobile ?? "—"}</div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Mobile (iOS / Android)</span>
            </div>

            <div className="p-4 bg-muted/30 border border-border rounded-md space-y-1">
              <Monitor className="h-6 w-6 text-cyan-400 mx-auto" />
              <div className="text-lg font-bold font-mono text-cyan-400">{devices?.desktop ?? "—"}</div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Desktop Web</span>
            </div>

            <div className="p-4 bg-muted/30 border border-border rounded-md space-y-1">
              <Tablet className="h-6 w-6 text-emerald-400 mx-auto" />
              <div className="text-lg font-bold font-mono text-emerald-400">{devices?.tablet ?? "—"}</div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Tablet / iPad</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
