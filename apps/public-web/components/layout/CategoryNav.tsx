"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ArrowRight, Layers, Search, Compass, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SafeImage } from "../common/SafeImage";
import { apiClient } from "@/lib/api-client";

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

interface ApiArticleItem {
  id: string;
  headline?: string;
  title?: string;
  slug: string;
  category?: string;
  categoryId?: string;
  featuredImageUrl?: string;
  imageUrl?: string;
  publishedAt?: string;
  createdAt?: string;
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return "Recently published";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diffMs)) return "Recently published";
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "Recently published";
  }
}

// Default fallback trending stories if API is still indexing or populating
const DEFAULT_FALLBACK_STORIES: ApiArticleItem[] = [
  {
    id: "reuters-1",
    headline: "Federal Reserve Holds Benchmark Rates Steady as Global Central Banks Reassess Inflation Outlook",
    title: "Federal Reserve Holds Benchmark Rates Steady as Global Central Banks Reassess Inflation Outlook",
    slug: "fed-holds-rates-steady-global-banks",
    category: "Markets",
    featuredImageUrl: "/business.png",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "reuters-2",
    headline: "US Senate Advances Sweeping Cross-Border Cryptocurrency & Digital Asset Framework",
    title: "US Senate Advances Sweeping Cross-Border Cryptocurrency & Digital Asset Framework",
    slug: "us-senate-advances-digital-asset-framework",
    category: "Legal",
    featuredImageUrl: "/technology.png",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "reuters-3",
    headline: "Digital Payment Networks Expand Cross-Border Instant Clearing Across 14 Asian Economies",
    title: "Digital Payment Networks Expand Cross-Border Instant Clearing Across 14 Asian Economies",
    slug: "digital-payment-networks-cross-border-asia",
    category: "Fintech",
    featuredImageUrl: "/politics.png",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "reuters-4",
    headline: "Election Regulators and State Security Officials Prepare Safeguards Ahead of Key Ballots",
    title: "Election Regulators and State Security Officials Prepare Safeguards Ahead of Key Ballots",
    slug: "election-regulators-state-security-safeguards",
    category: "Investigations",
    featuredImageUrl: "/world.png",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

export function CategoryNav({ items }: { items: NavCategoryItem[] }) {
  const pathname = usePathname();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [moreSearchQuery, setMoreSearchQuery] = useState("");
  const [articles, setArticles] = useState<ApiArticleItem[]>([]);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Exactly first 14 categories for primary navigation bar
  const PRIMARY_LIMIT = 14;
  const first14Categories = useMemo(() => items.slice(0, PRIMARY_LIMIT), [items]);
  const hasOverflow = items.length > PRIMARY_LIMIT;
  const overflowItems = useMemo(() => (hasOverflow ? items.slice(PRIMARY_LIMIT) : []), [items, hasOverflow]);

  const activeCategory = items.find((c) => c.id === openDropdownId);
  const isWithinFirst14 = activeCategory ? first14Categories.some((c) => c.id === activeCategory.id) : false;
  const isMoreOpen = openDropdownId === "more_sections";

  // Check if any overflow category is currently active in the URL
  const activeOverflowItem = pathname
    ? overflowItems.find((cat) => {
        const p = pathname || "";
        const isSelf = p.startsWith(cat.href);
        const isChild = cat.subcategories?.some((s) => p.startsWith(s.href));
        return isSelf || isChild;
      })
    : null;

  // Load real published articles directly from backend API (/public/articles) as specified in EditionTv-api-collection.json
  useEffect(() => {
    async function fetchPublicArticles() {
      try {
        const data = await apiClient.get<ApiArticleItem[]>("/public/articles");
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        }
      } catch (err) {
        console.error("Failed to load category related articles:", err);
      }
    }
    fetchPublicArticles();
  }, []);

  // Filter for More sections search input
  const filteredOverflowItems = useMemo(() => {
    if (!moreSearchQuery.trim()) return overflowItems;
    const q = moreSearchQuery.toLowerCase();
    return overflowItems.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.subcategories?.some((sub) => sub.name.toLowerCase().includes(q))
    );
  }, [overflowItems, moreSearchQuery]);

  // Distribute overflow items across 3 balanced columns for Reuters-style typography layout
  const overflowColumns = useMemo(() => {
    const cols: NavCategoryItem[][] = [[], [], []];
    filteredOverflowItems.forEach((item, index) => {
      cols[index % 3].push(item);
    });
    return cols;
  }, [filteredOverflowItems]);

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
    }, 220);
  };

  // Get related real articles for the hovered category from API
  const getCategoryRelatedStories = (cat: NavCategoryItem | undefined): ApiArticleItem[] => {
    if (!cat) return DEFAULT_FALLBACK_STORIES.slice(0, 4);
    const catName = cat.name.trim().toLowerCase();
    const catSlug = cat.slug.trim().toLowerCase();

    // Match articles belonging to this category
    const matching = articles.filter((a) => {
      const aCat = (a.category || "").trim().toLowerCase();
      const aSlug = (a.slug || "").trim().toLowerCase();
      return (
        aCat === catName ||
        aCat === catSlug ||
        aSlug === catSlug ||
        aSlug.includes(catSlug) ||
        aCat.includes(catSlug) ||
        catName.includes(aCat) ||
        (a.categoryId && a.categoryId === cat.id)
      );
    });

    if (matching.length >= 4) {
      return matching.slice(0, 4);
    }

    // Merge matching articles with general articles or fallback stories
    const combined = [...matching, ...articles.filter((a) => !matching.includes(a)), ...DEFAULT_FALLBACK_STORIES];
    return combined.slice(0, 4);
  };

  // Trending stories for the "More" dropdown (matches Reuters layout)
  const trendingStories = useMemo(() => {
    if (articles.length >= 4) {
      return articles.slice(0, 4);
    }
    const combined = [...articles, ...DEFAULT_FALLBACK_STORIES];
    return combined.slice(0, 4);
  }, [articles]);

  const activeStories = activeCategory ? getCategoryRelatedStories(activeCategory) : [];

  return (
    <div
      className="relative border-t border-border bg-white dark:bg-[#0a0b0d] z-40 w-full max-w-full"
      onMouseLeave={handleMouseLeave}
    >
      <div className="container mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="flex items-center justify-between w-full min-w-0">
          
          {/* Main Navigation Bar — First 14 Categories */}
          <nav className="flex items-center gap-0 overflow-x-auto scrollbar-none min-w-0 flex-1 scroll-smooth">
            {first14Categories.map((item) => {
              const currentPath = pathname || "";
              const hasSubcategories = item.subcategories && item.subcategories.length > 0;
              const isChildActive = hasSubcategories && item.subcategories.some((sub) => currentPath.startsWith(sub.href));
              const active = currentPath.startsWith(item.href) || isChildActive;
              const isOpen = openDropdownId === item.id;

              return (
                <div
                  key={item.id}
                  className="relative flex-none"
                  onMouseEnter={() => handleMouseEnter(item.id)}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpenDropdownId(null)}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2.5 text-[12px] font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
                      active || isOpen
                        ? "border-primary text-primary font-extrabold bg-primary/5 md:bg-transparent"
                        : "border-transparent text-foreground/80 hover:text-foreground hover:border-primary/60"
                    )}
                  >
                    <span>{item.name}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform duration-200 opacity-60",
                        isOpen ? "rotate-180 text-primary opacity-100" : ""
                      )}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* "+ More ▾" Button for all categories beyond the first 14 */}
          {hasOverflow && (
            <div
              className="relative flex-none pl-2 ml-auto"
              onMouseEnter={() => handleMouseEnter("more_sections")}
            >
              <button
                type="button"
                onClick={() => setOpenDropdownId(isMoreOpen ? null : "more_sections")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
                  isMoreOpen || activeOverflowItem
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50"
                )}
              >
                <span>
                  {activeOverflowItem ? activeOverflowItem.name : "More"}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted text-muted-foreground font-bold rounded-full">
                  +{overflowItems.length}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200 opacity-70",
                    isMoreOpen ? "rotate-180 text-primary opacity-100" : ""
                  )}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          REUTERS/NYT MEGA MENU WITH RELATED STORIES (FIRST 14 CATEGORIES)
          ───────────────────────────────────────────────────────────── */}
      {activeCategory && isWithinFirst14 && !isMoreOpen && (
        <div
          className="absolute top-full left-0 w-full mega-menu-dropdown border-b border-border shadow-2xl z-50 animate-in fade-in-0 slide-in-from-top-1 duration-150"
          onMouseEnter={() => handleMouseEnter(activeCategory.id)}
          onMouseLeave={handleMouseLeave}
        >
          {/* Top red accent line */}
          <div className="h-0.5 w-full bg-border">
            <div className="h-0.5 bg-primary w-28" />
          </div>

          <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-6">
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Category Header & Subcategories (5 of 12 columns) */}
              <div className="col-span-5 border-r border-border pr-8">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Layers className="h-3 w-3" />
                    <span>Editorial Desk</span>
                  </div>
                  <Link
                    href={activeCategory.href}
                    onClick={() => setOpenDropdownId(null)}
                    className="text-[11px] font-mono text-primary hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <h3 className="text-xl font-black font-headline uppercase tracking-tight text-foreground mb-1.5">
                  {activeCategory.name}
                </h3>
                {activeCategory.description ? (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                    {activeCategory.description}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Live reporting, analyses, and breaking updates from the {activeCategory.name} desk.
                  </p>
                )}

                {/* Real subcategories if present */}
                {activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold tracking-wider block">
                      Sub-Sections ({activeCategory.subcategories.length})
                    </span>
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-none">
                      {activeCategory.subcategories.map((sub) => {
                        const isSubActive = pathname?.startsWith(sub.href);
                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            onClick={() => setOpenDropdownId(null)}
                            className={cn(
                              "text-xs py-1 px-1.5 rounded transition-colors flex items-center justify-between group/sublink",
                              isSubActive
                                ? "text-primary font-bold bg-primary/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            <span className="truncate">{sub.name}</span>
                            <ArrowRight className="h-2.5 w-2.5 opacity-0 group-hover/sublink:opacity-100 text-primary transition-opacity shrink-0 ml-1" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Link
                      href={activeCategory.href}
                      onClick={() => setOpenDropdownId(null)}
                      className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      <span>Explore {activeCategory.name} Newsroom</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Reuters-style Related Stories & Articles (7 of 12 columns) */}
              <div className="col-span-7 pl-2">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
                  <span className="text-xs font-headline font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Related Stories &bull; {activeCategory.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Live Feed
                  </span>
                </div>

                {activeStories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                    {/* Story 0 */}
                    {activeStories[0] && (
                      <Link
                        href={`/articles/${activeStories[0].slug}`}
                        onClick={() => setOpenDropdownId(null)}
                        className="group/story flex items-start justify-between gap-3 p-1 hover:bg-muted/40 transition-colors rounded"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-muted-foreground group-hover/story:text-primary uppercase tracking-wider block mb-1 truncate transition-colors">
                            {activeStories[0].category || activeCategory.name}
                          </span>
                          <h4 className="text-xs font-bold leading-snug line-clamp-2 text-foreground group-hover/story:text-primary transition-colors">
                            {activeStories[0].headline || activeStories[0].title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                            {formatTimeAgo(activeStories[0].publishedAt || activeStories[0].createdAt)}
                          </span>
                        </div>
                        <div className="relative w-18 h-14 bg-muted shrink-0 overflow-hidden border border-border/60">
                          <SafeImage
                            src={activeStories[0].featuredImageUrl || activeStories[0].imageUrl}
                            alt={activeStories[0].headline || "Story"}
                            className="w-full h-full object-cover group-hover/story:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                    )}

                    {/* Story 1 */}
                    {activeStories[1] && (
                      <Link
                        href={`/articles/${activeStories[1].slug}`}
                        onClick={() => setOpenDropdownId(null)}
                        className="group/story flex items-start justify-between gap-3 p-1 hover:bg-muted/40 transition-colors rounded"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-muted-foreground group-hover/story:text-primary uppercase tracking-wider block mb-1 truncate transition-colors">
                            {activeStories[1].category || activeCategory.name}
                          </span>
                          <h4 className="text-xs font-bold leading-snug line-clamp-2 text-foreground group-hover/story:text-primary transition-colors">
                            {activeStories[1].headline || activeStories[1].title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                            {formatTimeAgo(activeStories[1].publishedAt || activeStories[1].createdAt)}
                          </span>
                        </div>
                        <div className="relative w-18 h-14 bg-muted shrink-0 overflow-hidden border border-border/60">
                          <SafeImage
                            src={activeStories[1].featuredImageUrl || activeStories[1].imageUrl}
                            alt={activeStories[1].headline || "Story"}
                            className="w-full h-full object-cover group-hover/story:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                    )}

                    {/* Horizontal Divider Line */}
                    <div className="col-span-2 border-b border-border/60 my-0.5" />

                    {/* Story 2 */}
                    {activeStories[2] && (
                      <Link
                        href={`/articles/${activeStories[2].slug}`}
                        onClick={() => setOpenDropdownId(null)}
                        className="group/story flex items-start justify-between gap-3 p-1 hover:bg-muted/40 transition-colors rounded"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-muted-foreground group-hover/story:text-primary uppercase tracking-wider block mb-1 truncate transition-colors">
                            {activeStories[2].category || activeCategory.name}
                          </span>
                          <h4 className="text-xs font-bold leading-snug line-clamp-2 text-foreground group-hover/story:text-primary transition-colors">
                            {activeStories[2].headline || activeStories[2].title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                            {formatTimeAgo(activeStories[2].publishedAt || activeStories[2].createdAt)}
                          </span>
                        </div>
                        <div className="relative w-18 h-14 bg-muted shrink-0 overflow-hidden border border-border/60">
                          <SafeImage
                            src={activeStories[2].featuredImageUrl || activeStories[2].imageUrl}
                            alt={activeStories[2].headline || "Story"}
                            className="w-full h-full object-cover group-hover/story:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                    )}

                    {/* Story 3 */}
                    {activeStories[3] && (
                      <Link
                        href={`/articles/${activeStories[3].slug}`}
                        onClick={() => setOpenDropdownId(null)}
                        className="group/story flex items-start justify-between gap-3 p-1 hover:bg-muted/40 transition-colors rounded"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-muted-foreground group-hover/story:text-primary uppercase tracking-wider block mb-1 truncate transition-colors">
                            {activeStories[3].category || activeCategory.name}
                          </span>
                          <h4 className="text-xs font-bold leading-snug line-clamp-2 text-foreground group-hover/story:text-primary transition-colors">
                            {activeStories[3].headline || activeStories[3].title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                            {formatTimeAgo(activeStories[3].publishedAt || activeStories[3].createdAt)}
                          </span>
                        </div>
                        <div className="relative w-18 h-14 bg-muted shrink-0 overflow-hidden border border-border/60">
                          <SafeImage
                            src={activeStories[3].featuredImageUrl || activeStories[3].imageUrl}
                            alt={activeStories[3].headline || "Story"}
                            className="w-full h-full object-cover group-hover/story:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center border border-dashed border-border rounded text-xs text-muted-foreground">
                    Awaiting published stories in this category
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          REUTERS-STYLE "MORE" MEGA MENU WITH TAXONOMY & TRENDING STORIES
          ───────────────────────────────────────────────────────────── */}
      {isMoreOpen && hasOverflow && (
        <div
          className="absolute top-full left-0 w-full mega-menu-dropdown border-b border-border shadow-2xl z-50 animate-in fade-in-0 slide-in-from-top-1 duration-150"
          onMouseEnter={() => handleMouseEnter("more_sections")}
          onMouseLeave={handleMouseLeave}
        >
          {/* Top red accent line */}
          <div className="h-0.5 w-full bg-border">
            <div className="h-0.5 bg-primary w-32" />
          </div>

          <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-6">
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* LEFT SIDE: Editorial Taxonomy & News Desks (7 of 12 columns) */}
              <div className="col-span-7 border-r border-border pr-8">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-border">
                  <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-foreground">
                    Editorial Sections &amp; Desks
                  </h3>

                  {/* Subtle Filter Input */}
                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Filter sections..."
                      value={moreSearchQuery}
                      onChange={(e) => setMoreSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1 text-[11px] bg-muted/40 border border-border rounded focus:outline-none focus:border-primary font-mono text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* 3 Balanced Columns of Clean Typographic Links (Matches Reuters Style) */}
                <div className="grid grid-cols-3 gap-6 max-h-[380px] overflow-y-auto scrollbar-none pr-2">
                  {overflowColumns.map((col, colIdx) => (
                    <div key={colIdx} className="space-y-4">
                      {col.map((cat) => {
                        const isCatActive = pathname?.startsWith(cat.href);
                        const hasSubs = cat.subcategories && cat.subcategories.length > 0;

                        return (
                          <div key={cat.id} className="group/sec">
                            {/* Section Header */}
                            <Link
                              href={cat.href}
                              onClick={() => setOpenDropdownId(null)}
                              className={cn(
                                "font-bold text-[13px] tracking-tight block transition-colors leading-tight",
                                isCatActive
                                  ? "text-primary underline"
                                  : "text-foreground hover:text-primary"
                              )}
                            >
                              {cat.name}
                            </Link>

                            {/* Subcategories (like Sports -> Cricket, Football, F1, etc. in Reuters) */}
                            {hasSubs && (
                              <div className="mt-1 space-y-0.5">
                                {cat.subcategories.map((sub) => {
                                  const isSubActive = pathname?.startsWith(sub.href);
                                  return (
                                    <Link
                                      key={sub.id}
                                      href={sub.href}
                                      onClick={() => setOpenDropdownId(null)}
                                      className={cn(
                                        "text-[12px] block py-0.5 transition-colors truncate",
                                        isSubActive
                                          ? "text-primary font-bold"
                                          : "text-muted-foreground hover:text-foreground hover:text-primary"
                                      )}
                                    >
                                      {sub.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Directory Bottom Link */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <Link
                    href="/categories"
                    onClick={() => setOpenDropdownId(null)}
                    className="font-bold text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-mono uppercase tracking-wider"
                  >
                    <Compass className="h-3 w-3" />
                    <span>Explore Full Taxonomy Directory</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {overflowItems.length} extended coverage desks
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE: Reuters Trending Stories 2x2 Layout (5 of 12 columns) */}
              <div className="col-span-5 pl-2">
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-border">
                  <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-foreground">
                    Trending Stories
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Live Feed
                  </span>
                </div>

                {/* 2x2 Grid with Horizontal Divider (Identical to Reuters Screenshot) */}
                <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
                  {/* Story 0 */}
                  {trendingStories[0] && (
                    <Link
                      href={`/articles/${trendingStories[0].slug}`}
                      onClick={() => setOpenDropdownId(null)}
                      className="group/card flex items-start justify-between gap-3 p-1 hover:bg-muted/40 transition-colors rounded"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-muted-foreground group-hover/card:text-primary uppercase tracking-wider block mb-1 truncate transition-colors">
                          {trendingStories[0].category || "Markets"}
                        </span>
                        <h4 className="text-xs font-bold leading-snug line-clamp-3 text-foreground group-hover/card:text-primary transition-colors">
                          {trendingStories[0].headline || trendingStories[0].title}
                        </h4>
                      </div>
                      <div className="relative w-18 h-14 bg-muted shrink-0 overflow-hidden border border-border/60">
                        <SafeImage
                          src={trendingStories[0].featuredImageUrl || trendingStories[0].imageUrl}
                          alt={trendingStories[0].headline || "Trending Story"}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                  )}

                  {/* Story 1 */}
                  {trendingStories[1] && (
                    <Link
                      href={`/articles/${trendingStories[1].slug}`}
                      onClick={() => setOpenDropdownId(null)}
                      className="group/card flex items-start justify-between gap-3 p-1 hover:bg-muted/40 transition-colors rounded"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-muted-foreground group-hover/card:text-primary uppercase tracking-wider block mb-1 truncate transition-colors">
                          {trendingStories[1].category || "Legal"}
                        </span>
                        <h4 className="text-xs font-bold leading-snug line-clamp-3 text-foreground group-hover/card:text-primary transition-colors">
                          {trendingStories[1].headline || trendingStories[1].title}
                        </h4>
                      </div>
                      <div className="relative w-18 h-14 bg-muted shrink-0 overflow-hidden border border-border/60">
                        <SafeImage
                          src={trendingStories[1].featuredImageUrl || trendingStories[1].imageUrl}
                          alt={trendingStories[1].headline || "Trending Story"}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                  )}

                  {/* Horizontal Divider Line */}
                  <div className="col-span-2 border-b border-border/60 my-0.5" />

                  {/* Story 2 */}
                  {trendingStories[2] && (
                    <Link
                      href={`/articles/${trendingStories[2].slug}`}
                      onClick={() => setOpenDropdownId(null)}
                      className="group/card flex items-start justify-between gap-3 p-1 hover:bg-muted/40 transition-colors rounded"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-muted-foreground group-hover/card:text-primary uppercase tracking-wider block mb-1 truncate transition-colors">
                          {trendingStories[2].category || "Economy"}
                        </span>
                        <h4 className="text-xs font-bold leading-snug line-clamp-3 text-foreground group-hover/card:text-primary transition-colors">
                          {trendingStories[2].headline || trendingStories[2].title}
                        </h4>
                      </div>
                      <div className="relative w-18 h-14 bg-muted shrink-0 overflow-hidden border border-border/60">
                        <SafeImage
                          src={trendingStories[2].featuredImageUrl || trendingStories[2].imageUrl}
                          alt={trendingStories[2].headline || "Trending Story"}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                  )}

                  {/* Story 3 */}
                  {trendingStories[3] && (
                    <Link
                      href={`/articles/${trendingStories[3].slug}`}
                      onClick={() => setOpenDropdownId(null)}
                      className="group/card flex items-start justify-between gap-3 p-1 hover:bg-muted/40 transition-colors rounded"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-muted-foreground group-hover/card:text-primary uppercase tracking-wider block mb-1 truncate transition-colors">
                          {trendingStories[3].category || "Investigations"}
                        </span>
                        <h4 className="text-xs font-bold leading-snug line-clamp-3 text-foreground group-hover/card:text-primary transition-colors">
                          {trendingStories[3].headline || trendingStories[3].title}
                        </h4>
                      </div>
                      <div className="relative w-18 h-14 bg-muted shrink-0 overflow-hidden border border-border/60">
                        <SafeImage
                          src={trendingStories[3].featuredImageUrl || trendingStories[3].imageUrl}
                          alt={trendingStories[3].headline || "Trending Story"}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                  )}
                </div>

                {/* Additional Quick Action */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">Updated in real-time</span>
                  <Link
                    href="/"
                    onClick={() => setOpenDropdownId(null)}
                    className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>View Edition TV Front Page</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

