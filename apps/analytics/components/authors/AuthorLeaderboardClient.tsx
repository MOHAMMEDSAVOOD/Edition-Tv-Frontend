"use client";
import { UserCheck } from "lucide-react";

interface AuthorMetric {
  name: string;
  role: string;
  articlesCount: number;
  totalViews: string;
  retentionRate: string;
}

const AUTHORS: AuthorMetric[] = [
  { name: "Dr. Elena Rostova", role: "Quantum & Deep Tech Correspondent", articlesCount: 24, totalViews: "612,400", retentionRate: "72.4%" },
  { name: "Marcus Vance", role: "Senior Financial Analyst", articlesCount: 31, totalViews: "524,100", retentionRate: "64.8%" },
  { name: "Sophia Al-Mansoor", role: "Global Energy & Climate Editor", articlesCount: 19, totalViews: "389,000", retentionRate: "68.1%" },
];

export function AuthorLeaderboardClient() {
  return (
    <div className="space-y-6 text-xs font-sans">
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-cyan-400" /> Correspondent Performance Rankings
          </span>
        </div>

        <table className="w-full text-left font-mono">
          <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="p-3">Journalist Name</th>
              <th className="p-3">Editorial Desk</th>
              <th className="p-3">Published Articles</th>
              <th className="p-3">Total Pageviews</th>
              <th className="p-3">Reader Retention</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {AUTHORS.map((a) => (
              <tr key={a.name} className="hover:bg-muted/20 transition-colors">
                <td className="p-3 font-bold text-foreground">{a.name}</td>
                <td className="p-3 text-muted-foreground">{a.role}</td>
                <td className="p-3 text-muted-foreground">{a.articlesCount}</td>
                <td className="p-3 text-cyan-400 font-bold">{a.totalViews}</td>
                <td className="p-3 text-emerald-400 font-bold">{a.retentionRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
