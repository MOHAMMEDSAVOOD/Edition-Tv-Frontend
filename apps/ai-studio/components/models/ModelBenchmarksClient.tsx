"use client";

import { useState } from "react";
import { Cpu, Zap, DollarSign, Activity } from "lucide-react";

interface ModelMetric {
  name: string;
  provider: string;
  latencyMs: number;
  costPer1k: string;
  accuracyScore: string;
  status: "ACTIVE" | "STANDBY";
}

interface UsageSummary {
  avgLatency: string;
  dailyTokens: string;
  dailyCost: string;
  activeModels: string;
}

export function ModelBenchmarksClient() {
  // TODO: no backend endpoint reports model telemetry yet. Listing models with invented latency,
  // cost and accuracy numbers would misrepresent what the platform actually runs.
  const [models] = useState<ModelMetric[]>([]);
  const [usage] = useState<UsageSummary | null>(null);

  return (
    <div className="space-y-6 text-xs">
      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Zap className="h-3 w-3 text-cyan-400" /> Avg Response Latency
          </span>
          <div className="text-xl font-bold font-mono text-cyan-400">{usage?.avgLatency ?? "—"}</div>
        </div>

        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Activity className="h-3 w-3 text-purple-400" /> Daily Token Volume
          </span>
          <div className="text-xl font-bold font-mono text-purple-400">{usage?.dailyTokens ?? "—"}</div>
        </div>

        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-emerald-400" /> Est. Daily Cost
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">{usage?.dailyCost ?? "—"}</div>
        </div>

        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Cpu className="h-3 w-3 text-amber-400" /> Active Copilot Models
          </span>
          <div className="text-xl font-bold font-mono text-amber-400">{usage?.activeModels ?? "—"}</div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Active Multi-Model Infrastructure
        </div>

        <table className="w-full text-left font-mono">
          <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="p-3">Model Name</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Avg Latency</th>
              <th className="p-3">Cost / 1K Tokens</th>
              <th className="p-3">Fact Check Accuracy</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {models.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No model telemetry available.
                </td>
              </tr>
            ) : (
              models.map((m) => (
                <tr key={m.name} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-bold text-foreground">{m.name}</td>
                  <td className="p-3 text-muted-foreground">{m.provider}</td>
                  <td className="p-3 text-cyan-400 font-bold">{m.latencyMs} ms</td>
                  <td className="p-3 text-emerald-400 font-bold">{m.costPer1k}</td>
                  <td className="p-3 text-purple-400 font-bold">{m.accuracyScore}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${m.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-muted text-muted-foreground border-border"}`}
                    >
                      {m.status}
                    </span>
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
