"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  FolderKanban,
  FileText,
  ShieldCheck,
  Radio,
  Layers,
  Send,
  History,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/authService";

const NEWSROOM_NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Wire Intelligence", href: "/intelligence", icon: Sparkles },
  { label: "Story Workspace", href: "/workspace", icon: FolderKanban },
  { label: "Editorial Planning", href: "/planning", icon: CalendarDays },
  { label: "Newsroom Assignments", href: "/assignments", icon: FileText },
];

const VERIFICATION_NAV = [
  { label: "Claims & Fact-Check", href: "/verification", icon: ShieldCheck },
  { label: "Live Coverage", href: "/live-events", icon: Radio },
];

const PUBLISHING_NAV = [
  { label: "Homepage Curation", href: "/curation", icon: Layers },
  { label: "Publishing Pipeline", href: "/publish", icon: Send },
  { label: "Audit Provenance", href: "/audit", icon: History },
];

export function CmsSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderNavItem = (item: { label: string; href: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200",
          active
            ? "bg-red-600 text-white shadow-md shadow-red-600/30 font-bold"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-500")} />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Drawer Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-md"
        aria-label="Toggle Menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40"
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 z-40 font-sans transition-transform duration-300 shadow-xs",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
          <Link href="/" className="block">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 font-heading block leading-none">
              EDITION <span className="text-red-600">TV</span>
            </span>
            <span className="text-[10px] text-blue-600 uppercase font-mono font-bold tracking-wider block mt-0.5">
              Partner CMS Studio
            </span>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0 no-scrollbar">
          <div className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Editorial Command
          </div>
          {NEWSROOM_NAV.map(renderNavItem)}

          <div className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">
            Verification & Fact-Check
          </div>
          {VERIFICATION_NAV.map(renderNavItem)}

          <div className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">
            Publishing Pipeline
          </div>
          {PUBLISHING_NAV.map(renderNavItem)}
        </nav>

        {/* Footer & Sign Out */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 shrink-0">
          <button
            onClick={() => authService.logout()}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl text-red-600 hover:text-white bg-red-50 hover:bg-red-600 transition duration-200 border border-red-200/80 shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </span>
            <span className="text-[9px] font-mono opacity-80 uppercase">JWT</span>
          </button>

          <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] font-mono px-1">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              CMS ONLINE
            </span>
            <span className="text-slate-400">v2026.9</span>
          </div>
        </div>
      </aside>
    </>
  );
}
