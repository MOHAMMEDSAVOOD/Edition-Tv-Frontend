import { Cpu, Zap, DollarSign, Activity } from "lucide-react";

interface ModelMetric {
  name: string;
  provider: string;
  latencyMs: number;
  costPer1k: string;
  accuracyScore: string;
  status: "ACTIVE" | "STANDBY";
}

const MODELS: ModelMetric[] = [
  { name: "GPT-5 Omni", provider: "OpenAI", latencyMs: 24, costPer1k: "$0.003", accuracyScore: "99.4%", status: "ACTIVE" },
  { name: "Claude 3.7 Sonnet", provider: "Anthropic", latencyMs: 18, costPer1k: "$0.0025", accuracyScore: "99.2%", status: "ACTIVE" },
  { name: "Gemini 1.5 Pro", provider: "Google DeepMind", latencyMs: 31, costPer1k: "$0.002", accuracyScore: "98.8%", status: "ACTIVE" },
  { name: "Llama 3 70B", provider: "Meta (Local Edge)", latencyMs: 8, costPer1k: "$0.000", accuracyScore: "97.5%", status: "STANDBY" },
];

export function ModelBenchmarksClient() {
  return (
    <div className="space-y-6 text-xs">
      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Zap className="h-3 w-3 text-cyan-400" /> Avg Response Latency
          </span>
          <div className="text-xl font-bold font-mono text-cyan-400">18.2 ms</div>
        </div>

        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Activity className="h-3 w-3 text-purple-400" /> Daily Token Volume
          </span>
          <div className="text-xl font-bold font-mono text-purple-400">4.82 M</div>
        </div>

        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-emerald-400" /> Est. Daily Cost
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">$12.45</div>
        </div>

        <div className="bg-card border border-border p-4 rounded-md space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Cpu className="h-3 w-3 text-amber-400" /> Active Copilot Models
          </span>
          <div className="text-xl font-bold font-mono text-amber-400">4 Engine Nodes</div>
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
            {MODELS.map((m) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
