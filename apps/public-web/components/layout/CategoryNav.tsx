"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ArrowRight, Layers, Flame, Compass, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubCategoryItem {
  id: string;
  name: string;
  slug: string;
  href: string;
  description?: string;
}

export interface NavCategoryItem {
  id: string;
  name: string;
  slug: string;
  href: string;
  description?: string;
  subcategories: SubCategoryItem[];
}

export function CategoryNav({ items }: { items: NavCategoryItem[] }) {
  const pathname = usePathname();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeCategory = items.find((c) => c.id === openDropdownId);

  const handleMouseEnter = (id: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdownId(id);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdownId(null);
    }, 200);
  };

  return (
    <div 
      className="relative border-t border-border bg-background z-40"
      onMouseLeave={handleMouseLeave}
    >
      <div className="container mx-auto max-w-[1200px] px-4 md:px-6">
        <nav className="flex items-center gap-0">
          {items.map((item) => {
            const currentPath = pathname || "";
            const hasChildren = item.subcategories && item.subcategories.length > 0;
            const isChildActive = hasChildren && item.subcategories.some((sub) => currentPath.startsWith(sub.href));
            const active = currentPath.startsWith(item.href) || isChildActive;
            const isOpen = openDropdownId === item.id;

            return (
              <div
                key={item.id}
                className="relative flex-none"
                onMouseEnter={() => {
                  if (hasChildren) {
                    handleMouseEnter(item.id);
                  } else {
                    setOpenDropdownId(null);
                  }
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpenDropdownId(null)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
                    active || isOpen
                      ? "border-primary text-primary"
                      : "border-transparent text-foreground/75 hover:text-foreground hover:border-primary/50"
                  )}
                >
                  <span>{item.name}</span>
                  {hasChildren && (
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200 opacity-60",
                        isOpen ? "rotate-180 text-primary opacity-100" : "group-hover:opacity-100"
                      )}
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Full-width Industry Standard Mega-Menu Dropdown Panel */}
      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div
          className="absolute top-full left-0 w-full bg-background border-b border-border shadow-2xl z-50 animate-in fade-in-0 slide-in-from-top-1 duration-200"
          onMouseEnter={() => handleMouseEnter(activeCategory.id)}
          onMouseLeave={handleMouseLeave}
        >
          {/* Subtle top red line indicator */}
          <div className="h-0.5 w-full bg-primary/20">
            <div className="h-0.5 bg-primary w-24" />
          </div>

          <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8">
            <div className="grid grid-cols-12 gap-8">
              
              {/* Column 1: Category Spotlight & Overview (3.5 Cols) */}
              <div className="col-span-4 border-r border-border/80 pr-8 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
                    <Layers className="h-3 w-3" />
                    <span>Editorial Hub</span>
                  </div>
                  <h3 className="text-2xl font-black font-headline uppercase tracking-tight text-foreground mb-2">
                    {activeCategory.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                    {activeCategory.description ||
                      `Comprehensive reporting, live field dispatches, investigative insights, and continuous updates covering ${activeCategory.name}.`}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/60">
                  <Link
                    href={activeCategory.href}
                    onClick={() => setOpenDropdownId(null)}
                    className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs uppercase tracking-wider transition-all shadow-xs group/btn"
                  >
                    <span>View All {activeCategory.name}</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href={`/search?q=${encodeURIComponent(activeCategory.name)}`}
                    onClick={() => setOpenDropdownId(null)}
                    className="inline-flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors px-1"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Search inside {activeCategory.name} archive</span>
                  </Link>
                </div>
              </div>

              {/* Column 2: Sub-categories Grid (5 Cols) */}
              <div className="col-span-5 pr-4">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
                  <Flame className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Sub-Sections &amp; Desks
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-auto">
                    {activeCategory.subcategories.length} Topics
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {activeCategory.subcategories.map((sub) => {
                    const isSubActive = pathname?.startsWith(sub.href);
                    return (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        onClick={() => setOpenDropdownId(null)}
                        className={cn(
                          "group/sub flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-medium",
                          isSubActive
                            ? "bg-primary/10 border-primary/30 text-primary font-bold shadow-2xs"
                            : "bg-card hover:bg-muted/70 border-border/60 text-foreground/80 hover:text-foreground hover:border-border"
                        )}
                      >
                        <div className="min-w-0 pr-2">
                          <span className="block capitalize font-bold text-sm text-foreground group-hover/sub:text-primary transition-colors truncate">
                            {sub.name}
                          </span>
                          <span className="block text-[10px] font-mono text-muted-foreground mt-0.5">
                            /categories/{sub.slug}
                          </span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover/sub:text-primary group-hover/sub:translate-x-0.5 transition-all flex-none" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Column 3: Live & Continuous Feeds (3 Cols) */}
              <div className="col-span-3 pl-4 border-l border-border/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
                    <Radio className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Continuous Feeds
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <Link
                      href="/live"
                      onClick={() => setOpenDropdownId(null)}
                      className="block p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border/60 transition-all group/quick"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-xs font-bold text-foreground group-hover/quick:text-primary transition-colors">
                          Live Broadcasting
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Watch real-time live video and coverage
                      </p>
                    </Link>

                    <Link
                      href="/podcasts"
                      onClick={() => setOpenDropdownId(null)}
                      className="block p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border/60 transition-all group/quick"
                    >
                      <span className="text-xs font-bold text-foreground group-hover/quick:text-primary transition-colors block mb-1">
                        Audio &amp; Podcasts
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        In-depth audio analysis and news roundups
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">
                    Edition TV Fast Nav
                  </span>
                  <span className="text-xs text-foreground font-semibold">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">?</kbd> for shortcuts
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
