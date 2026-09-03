"use client";

import { useEffect, useState } from "react";
import { Activity, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthComponent {
  name: string;
  status: string;
  latencyMs: number;
  type: string;
}

export function HealthStatusClient() {
  const [status, setStatus] = useState<string>("UNKNOWN");
  const [components, setComponents] = useState<HealthComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/health");
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status || "UP");
        setComponents(data.components || []);
      } else {
        setError("Failed to fetch health metrics from backend");
      }
    } catch (e) {
      setError("Failed to connect to backend health service");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 text-xs font-sans">
      <div className="bg-card border border-border p-4 rounded-md flex items-center justify-between shadow-xs">
        <div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" /> Infrastructure Component Health
          </h3>
          <p className="text-muted-foreground text-[11px]">
            Real-time latency and operational health status across database, search, and ingestion workers.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-medium">
          <AlertCircle className="h-4 w-4 flex-none text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && components.length === 0 ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-2xs animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-slate-200 rounded-full" />
                <div className="h-3 w-14 bg-slate-200 rounded-full" />
              </div>
              <div className="h-5 w-28 bg-slate-200 rounded-lg" />
              <div className="h-3 w-20 bg-slate-200 rounded-full" />
            </div>
          ))
        ) : (
          components.map((c) => (
            <div key={c.name} className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">{c.type}</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {c.status}
                </span>
              </div>
              <div className="font-extrabold text-sm text-slate-900 font-heading">{c.name}</div>
              <div className="text-[11px] text-slate-500 font-mono">Latency: <span className="font-mono font-bold text-red-600">{c.latencyMs} ms</span></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
