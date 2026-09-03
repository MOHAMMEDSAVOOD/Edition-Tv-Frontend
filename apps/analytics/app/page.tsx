import { ExecutiveOverviewClient } from "@/components/dashboard/ExecutiveOverviewClient";

export const metadata = {
  title: "Executive Analytics Overview | Edition TV",
  description: "Real-time reader engagement, pageviews, top content, and traffic sources telemetry.",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Platform Performance Telemetry
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Executive Reader Overview</h1>
      </div>

      <ExecutiveOverviewClient />
    </div>
  );
}
