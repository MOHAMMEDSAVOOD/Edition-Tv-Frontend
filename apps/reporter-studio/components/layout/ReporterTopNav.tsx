"use client";
import { useState } from "react";
import { Search, Wifi, Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ReporterTopNav() {
  const { theme, setTheme } = useTheme();
  const [isSaved] = useState(true);

  return (
    <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-between flex-none z-20">
      {/* Left: Quick Search */}
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search stories, sources, research..."
            className="w-full pl-8 pr-3 py-1 text-xs border border-border bg-background rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded border border-border">
          <Wifi className="h-3 w-3 text-emerald-500" />
          <span className="font-semibold text-foreground">Syncing to Cloud</span>
        </div>
      </div>

      {/* Right: Autosave Badge & Reporter Profile */}
      <div className="flex items-center gap-3">
        {isSaved && (
          <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Autosaved
          </span>
        )}

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted text-xs font-bold"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2 border-l border-border pl-3">
          <div className="h-7 w-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center border border-primary/30">
            ER
          </div>
          <div className="hidden md:block text-left text-xs">
            <span className="font-bold text-foreground block leading-tight">Elena Rostova</span>
            <span className="text-[10px] text-muted-foreground">Tech & Economy Desk</span>
          </div>
        </div>
      </div>
    </header>
  );
}
