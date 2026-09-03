import { ModelBenchmarksClient } from "@/components/models/ModelBenchmarksClient";

export const metadata = {
  title: "Model Performance Benchmarks | Edition TV AI Studio",
  description: "LLM token usage, latency metrics, and cost tracking across active AI models.",
};

export default function ModelsPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Telemetry & Infrastructure
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Model Performance Benchmarks</h1>
      </div>

      <ModelBenchmarksClient />
    </div>
  );
}
