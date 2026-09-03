"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radio,
  Tv,
  Rss,
  Bell,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TERMINAL_NAV = [
  { label: "Master Control", href: "/", icon: Tv, shortcut: "F1" },
  { label: "Live Events Stream", href: "/events", icon: Radio, shortcut: "F2" },
  { label: "Raw Wire Feeds", href: "/wires", icon: Rss, shortcut: "F3" },
  { label: "Push Alerts Desk", href: "/alerts", icon: Bell, shortcut: "F4" },
];

export function TerminalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-full bg-card text-foreground border-r border-border flex flex-col flex-none z-30 font-mono text-xs">
      {/* Brand Terminal Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border bg-black/40">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-none bg-primary flex items-center justify-center text-black font-bold text-xs">
            <Terminal className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-extrabold text-xs tracking-widest text-primary block uppercase">EDITION // LIVE</span>
            <span className="text-[9px] text-muted-foreground font-mono">CONTROL ROOM v3</span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto no-scrollbar">
        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">
          OPERATIONS MATRIX
        </div>
        {TERMINAL_NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-2.5 py-2 text-xs font-bold transition-colors border",
                active
                  ? "bg-primary/20 text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("h-3.5 w-3.5", active ? "text-primary" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground/60">{item.shortcut}</span>
            </Link>
          );
        })}
      </nav>

      {/* Status Indicators */}
      <div className="p-3 border-t border-border bg-black/40 text-[10px] space-y-2 font-mono">
        <div className="flex items-center justify-between text-emerald-400 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            ON AIR ACTIVE
          </span>
          <span>100% OK</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>OUTBOX RELAY</span>
          <span className="text-primary font-bold">30ms</span>
        </div>
      </div>
    </aside>
  );
}
