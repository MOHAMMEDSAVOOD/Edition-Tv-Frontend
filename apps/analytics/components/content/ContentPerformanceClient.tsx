"use client";

interface CategoryMetric {
  category: string;
  articlesPublished: number;
  totalPageviews: string;
  avgReadTime: string;
  recirculation: string;
}

const CATEGORIES: CategoryMetric[] = [
  { category: "Technology & AI", articlesPublished: 142, totalPageviews: "482,100", avgReadTime: "4m 45s", recirculation: "64%" },
  { category: "Business & Markets", articlesPublished: 98, totalPageviews: "318,500", avgReadTime: "3m 50s", recirculation: "58%" },
  { category: "World News", articlesPublished: 110, totalPageviews: "248,900", avgReadTime: "4m 12s", recirculation: "52%" },
  { category: "Science & Climate", articlesPublished: 64, totalPageviews: "199,400", avgReadTime: "5m 20s", recirculation: "71%" },
];

export function ContentPerformanceClient() {
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
            {CATEGORIES.map((cat) => (
              <tr key={cat.category} className="hover:bg-muted/20 transition-colors">
                <td className="p-3 font-bold text-foreground">{cat.category}</td>
                <td className="p-3 text-muted-foreground">{cat.articlesPublished}</td>
                <td className="p-3 text-cyan-400 font-bold">{cat.totalPageviews}</td>
                <td className="p-3 text-purple-400 font-bold">{cat.avgReadTime}</td>
                <td className="p-3 text-emerald-400 font-bold">{cat.recirculation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
