import { SearchAnalyticsClient } from "@/components/search/SearchAnalyticsClient";

export const metadata = {
  title: "On-site Search Telemetry | Edition TV Analytics",
  description: "Top search queries, zero-result terms, and reader search intent analytics.",
};

export default function SearchPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Reader Intent
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">On-Site Search Telemetry</h1>
      </div>

      <SearchAnalyticsClient />
    </div>
  );
}
