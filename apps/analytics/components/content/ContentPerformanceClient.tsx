"use client";

import { useState } from "react";

interface CategoryMetric {
  category: string;
  articlesPublished: number;
  totalPageviews: string;
  avgReadTime: string;
  recirculation: string;
}

export function ContentPerformanceClient() {
  // TODO: no backend endpoint serves per-category performance yet. Empty until one exists.
  const [categories] = useState<CategoryMetric[]>([]);

  return (
    <div className="space-y-6 text-xs font-sans">
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Category Performance Matrix
        </div>

        <table className="w-full text-left font-mono">
          <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="p-3">Editorial Category</th>
              <th className="p-3">Articles Published (30d)</th>
              <th className="p-3">Total Pageviews</th>
              <th className="p-3">Avg Reading Time</th>
              <th className="p-3">Recirculation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No category performance data available.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
              <tr key={cat.category} className="hover:bg-muted/20 transition-colors">
                <td className="p-3 font-bold text-foreground">{cat.category}</td>
                <td className="p-3 text-muted-foreground">{cat.articlesPublished}</td>
                <td className="p-3 text-cyan-400 font-bold">{cat.totalPageviews}</td>
                <td className="p-3 text-purple-400 font-bold">{cat.avgReadTime}</td>
                  <td className="p-3 text-emerald-400 font-bold">{cat.recirculation}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
