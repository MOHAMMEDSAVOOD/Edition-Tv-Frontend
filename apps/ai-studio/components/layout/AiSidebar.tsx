"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  ShieldCheck,
  BarChart3,
  Bot,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AI_NAV_ITEMS = [
  { label: "AI Chat Workbench", href: "/", icon: MessageSquare },
  { label: "Writing & Headlines", href: "/writing", icon: Sparkles },
  { label: "Image Generation", href: "/images", icon: ImageIcon },
  { label: "Toxicity & Moderation", href: "/toxicity", icon: ShieldCheck },
  { label: "Model Benchmarks", href: "/models", icon: BarChart3 },
];

export function AiSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-full bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col flex-none z-30 font-sans">
      {/* Brand AI Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[hsl(var(--sidebar-border))]">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-purple-600 flex items-center justify-center text-white font-bold text-xs ai-glow">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight ai-gradient-text block">AI STUDIO</span>
            <span className="text-[10px] text-[hsl(var(--sidebar-muted))] uppercase font-semibold">Multi-Model Engine</span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        <div className="text-[10px] font-bold text-[hsl(var(--sidebar-muted))] uppercase tracking-wider px-3 mb-2">
          AI Tools & Agents
        </div>
        {AI_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors",
                active
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                  : "text-[hsl(var(--sidebar-muted))] hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-purple-400" : "text-[hsl(var(--sidebar-muted))]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Model Quota Info */}
      <div className="p-3 border-t border-[hsl(var(--sidebar-border))] bg-black/30 text-[11px] text-muted-foreground space-y-2 font-mono">
        <div className="flex items-center justify-between text-purple-400 font-bold">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-cyan-400" /> GPU Compute Ready
          </span>
          <span>99.9%</span>
        </div>
      </div>
    </aside>
  );
}
