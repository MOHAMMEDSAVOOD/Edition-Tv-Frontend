"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Kanban,
  CheckSquare,
  FileText,
  Users,
  BookOpen,
  UploadCloud,
  Feather,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Story Pipeline", href: "/", icon: Kanban },
  { label: "My Assignments", href: "/assignments", icon: CheckSquare },
  { label: "Story Workspace", href: "/stories/s-1", icon: FileText },
  { label: "Source Vault", href: "/sources", icon: Users },
  { label: "Research Notes", href: "/research", icon: BookOpen },
  { label: "Field Uploads", href: "/uploads", icon: UploadCloud },
];

export function ReporterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-full bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col flex-none z-30">
      {/* Reporter Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[hsl(var(--sidebar-border))]">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-xs">
            <Feather className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-foreground block">REPORTER</span>
            <span className="text-[10px] text-[hsl(var(--sidebar-muted))] uppercase font-semibold">Notion Studio</span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        <div className="text-[10px] font-bold text-[hsl(var(--sidebar-muted))] uppercase tracking-wider px-3 mb-2">
          Journalist Desk
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-colors",
                active
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-[hsl(var(--sidebar-fg))] hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-[hsl(var(--sidebar-muted))]")} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Draft Trigger */}
      <div className="p-3 border-t border-[hsl(var(--sidebar-border))] space-y-2">
        <Link
          href="/stories/s-1"
          className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-bold text-xs py-2 rounded-md hover:opacity-90 transition-opacity shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" /> New Story Draft
        </Link>
      </div>
    </aside>
  );
}
