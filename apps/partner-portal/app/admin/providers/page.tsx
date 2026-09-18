"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Server, RefreshCw, Play } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

interface Provider {
  key: string;
  name: string;
  active: boolean;
  pollIntervalMinutes: number;
  lastIngestedAt?: string;
  status?: string;
}

export default function IngestionProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Provider[]>("/admin/providers").catch(() => []);
      const list = Array.isArray(data) ? data : [];
      setProviders(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load ingestion providers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleTriggerIngest = async (key: string) => {
    try {
      await apiClient.post(`/admin/providers/${key}/ingest`).catch(() => null);
      alert(`Ingestion triggered for provider: ${key}`);
      fetchProviders();
    } catch (err: unknown) {
      alert("Failed to trigger ingestion: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleToggleActive = async (key: string, currentActive: boolean) => {
    try {
      await apiClient.put(`/admin/providers/${key}`, { active: !currentActive }).catch(() => null);
      setProviders((prev) => prev.map((p) => (p.key === key ? { ...p, active: !currentActive } : p)));
    } catch (err: unknown) {
      alert("Failed to update provider status: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span className="font-semibold text-foreground font-sans">Admin</span>
            <span>/</span>
            <span className="text-indigo-400 font-bold">Ingestion Providers</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Wire Ingestion Providers Engine
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              <Server className="h-3 w-3" /> WIRE FEEDS
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure automated RSS & REST wire ingestion sources, poll intervals, active toggles, and manual triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={fetchProviders}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold border border-border bg-card hover:bg-muted rounded-lg transition-colors shadow-xs text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Providers
          </button>
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchProviders} />
      ) : loading ? (
        <div className="h-64 bg-card border border-border animate-pulse rounded-xl" />
      ) : providers.length === 0 ? (
        <EmptyState title="No Ingestion Providers Configured" description="Provider configurations will appear here." />
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-3">Provider Key & Name</th>
                  <th className="p-3">Poll Interval</th>
                  <th className="p-3">Last Ingest Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-xs">
                {providers.map((prov) => (
                  <tr key={prov.key} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-indigo-400 uppercase block">{prov.key}</span>
                      <span className="text-[11px] text-muted-foreground font-sans">{prov.name || prov.key}</span>
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      Every {prov.pollIntervalMinutes || 15} mins
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap text-[11px]">
                      {prov.lastIngestedAt ? new Date(prov.lastIngestedAt).toLocaleTimeString() : "Never"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <StatusBadge status={prov.active ? "CONNECTED" : "INACTIVE"} size="sm" />
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(prov.key, prov.active)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                            prov.active
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {prov.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleTriggerIngest(prov.key)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-xs"
                        >
                          <Play className="h-3 w-3 fill-current" /> Trigger Ingest
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
