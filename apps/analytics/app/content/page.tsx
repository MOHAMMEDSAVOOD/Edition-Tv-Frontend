import { ContentPerformanceClient } from "@/components/content/ContentPerformanceClient";

export const metadata = {
  title: "Content Performance & Engagement | Edition TV Analytics",
  description: "Category breakdown, recirculation rates, and article scroll depth telemetry.",
};

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Editorial Performance
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Engagement & Category Split</h1>
      </div>

      <ContentPerformanceClient />
    </div>
  );
}
