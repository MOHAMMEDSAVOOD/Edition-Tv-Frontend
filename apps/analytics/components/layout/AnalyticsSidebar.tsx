"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  FileText,
  UserCheck,
  Search,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ANALYTICS_NAV = [
  { label: "Executive Overview", href: "/", icon: BarChart3 },
  { label: "Audience & Geography", href: "/audience", icon: Users },
  { label: "Content Engagement", href: "/content", icon: FileText },
  { label: "Author Leaderboard", href: "/authors", icon: UserCheck },
  { label: "Search Analytics", href: "/search", icon: Search },
];

export function AnalyticsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-full bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col flex-none z-30 font-sans">
      {/* Brand Analytics Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[hsl(var(--sidebar-border))]">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-cyan-600 flex items-center justify-center text-black font-bold text-xs">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-cyan-400 block">ANALYTICS</span>
            <span className="text-[10px] text-[hsl(var(--sidebar-muted))] uppercase font-semibold">Grafana / GA4 Engine</span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        <div className="text-[10px] font-bold text-[hsl(var(--sidebar-muted))] uppercase tracking-wider px-3 mb-2">
          Telemetry Views
        </div>
        {ANALYTICS_NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors",
                active
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-[hsl(var(--sidebar-muted))] hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-cyan-400" : "text-[hsl(var(--sidebar-muted))]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Live Stream Ingestion Metric */}
      <div className="p-3 border-t border-[hsl(var(--sidebar-border))] bg-black/40 text-[11px] text-muted-foreground space-y-1 font-mono">
        <div className="flex items-center justify-between text-emerald-400 font-bold">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            TELEMETRY STREAM
          </span>
          <span>100% OK</span>
        </div>
      </div>
    </aside>
  );
}
