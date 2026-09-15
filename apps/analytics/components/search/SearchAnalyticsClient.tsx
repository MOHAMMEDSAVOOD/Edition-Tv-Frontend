"use client";
import { useState } from "react";
import { Search } from "lucide-react";

interface SearchQueryMetric {
  query: string;
  count: string;
  ctr: string;
  hasResults: boolean;
}

export function SearchAnalyticsClient() {
  // TODO: no backend endpoint serves reader search analytics yet. Empty until one exists.
  const [queries] = useState<SearchQueryMetric[]>([]);

  return (
    <div className="space-y-6 text-xs font-sans">
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-cyan-400" /> Reader Search Queries (30d)
          </span>
        </div>

        <table className="w-full text-left font-mono">
          <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="p-3">Search Query Term</th>
              <th className="p-3">Query Volume</th>
              <th className="p-3">Click-Through Rate (CTR)</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {queries.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No search query data available.
                </td>
              </tr>
            ) : (
              queries.map((q) => (
              <tr key={q.query} className="hover:bg-muted/20 transition-colors">
                <td className="p-3 font-bold text-foreground">{q.query}</td>
                <td className="p-3 text-cyan-400 font-bold">{q.count}</td>
                <td className="p-3 text-emerald-400 font-bold">{q.ctr}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${q.hasResults ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}
                  >
                    {q.hasResults ? "MATCHED" : "ZERO RESULTS"}
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
