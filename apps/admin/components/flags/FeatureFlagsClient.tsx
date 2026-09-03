"use client";

import { useEffect, useState } from "react";
import { Flag, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlagRecord {
  id: string;
  key: string;
  description: string;
  enabled: boolean;
  environment: string;
}

export function FeatureFlagsClient() {
  const [flags, setFlags] = useState<FlagRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/feature-flags");
      if (res.ok) {
        const data = await res.json();
        setFlags(data);
      } else {
        setError("Failed to fetch feature flags from backend API");
      }
    } catch (e) {
      setError("Failed to connect to backend feature flag API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const toggleFlag = async (key: string) => {
    try {
      const res = await fetch(`/api/v1/admin/feature-flags/${key}/toggle`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setFlags((prev) => prev.map((f) => (f.key === key ? updated : f)));
      }
    } catch (e) {
      console.error("Failed to toggle feature flag", e);
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 font-heading">
            <Flag className="h-4 w-4 text-red-600" /> Platform Feature Flags & Toggles
          </h3>
          <p className="text-slate-500 text-[11px] font-mono mt-0.5">
            Runtime feature gates controlling experimental AI capabilities and subscription paywall metering.
          </p>
        </div>
        <button
          onClick={fetchFlags}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition text-xs font-semibold"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin text-red-600")} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-medium">
          <AlertCircle className="h-4 w-4 flex-none text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              <th className="py-3.5 px-4">Flag Key</th>
              <th className="py-3.5 px-4">Environment</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && flags.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 font-mono">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto text-red-600 mb-2" />
                  Fetching active feature flags...
                </td>
              </tr>
            ) : flags.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 font-mono">
                  No feature flags configured in backend.
                </td>
              </tr>
            ) : (
              flags.map((f) => (
                <tr key={f.key} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] font-bold text-red-600">{f.key}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {f.environment}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{f.description}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleFlag(f.key)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold transition border font-mono",
                        f.enabled
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-slate-100 border-slate-200 text-slate-500"
                      )}
                    >
                      {f.enabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
