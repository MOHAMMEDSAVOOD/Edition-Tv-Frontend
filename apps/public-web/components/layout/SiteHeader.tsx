"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, User, Bookmark, Menu, ArrowLeft, Globe } from "lucide-react";
import { savedArticlesService } from "@/services/savedArticlesService";
import { authService } from "@/services/authService";
import { useAuth } from "@edition/auth";
import { CategoryNav, NavCategoryItem } from "./CategoryNav";
import { NotificationPopover } from "./NotificationPopover";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { apiClient } from "@/lib/api-client";
import { ChevronDown } from "lucide-react";

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  showInNav?: boolean;
  parentId?: string | null;
}

export function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [navCategories, setNavCategories] = useState<NavCategoryItem[]>([]);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Record<string, boolean>>({});
  // AuthProvider (app/layout.tsx) owns the Firebase subscription and caches /auth/me,
  // so the header reads the shared state instead of fetching the session itself.
  const { user, profile } = useAuth();
  const handle = profile?.username || user?.email?.split("@")[0] || user?.uid || "";

  useEffect(() => {
    setMounted(true);

    const updateBookmarks = () => {
      savedArticlesService
        .getSavedCount()
        .then((count) => setBookmarkCount(count))
        .catch(() => {});
    };

    updateBookmarks();
    window.addEventListener("edition_bookmark_changed", updateBookmarks);

    const fetchCategories = async () => {
      try {
        const data = await apiClient.get<ApiCategory[]>("/cms/categories");
        if (Array.isArray(data)) {
          const visible = data.filter((cat) => cat.showInNav !== false);
          const parents = visible
            .filter((cat) => !cat.parentId)
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

          const formatted: NavCategoryItem[] = parents.map((parent) => {
            const children = visible
              .filter((cat) => cat.parentId === parent.id)
              .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
              .map((child) => ({
                id: child.id,
                name: child.name,
                slug: child.slug,
                href: `/categories/${child.slug}`,
                description: child.description,
              }));

            return {
              id: parent.id,
              name: parent.name,
              slug: parent.slug,
              href: `/categories/${parent.slug}`,
              description: parent.description,
              subcategories: children,
            };
          });

          setNavCategories(formatted);
        }
      } catch {
        // Pure API mode: no fallback mock data
      }
    };
    
    fetchCategories();

    return () => {
      window.removeEventListener("edition_bookmark_changed", updateBookmarks);
    };
  }, []);

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background border-b border-border shadow-xs max-w-full">
        {/* Top bar: logo + date + weather + utilities */}
        <div className="container mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="flex items-center justify-between h-14 relative">
            
            {/* Mobile Hamburger Menu (Left) */}
            <button
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted transition-colors z-10"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo (Center on mobile, Left on desktop) */}
            <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex-1 md:flex-none flex justify-center md:justify-start pointer-events-none md:pointer-events-auto">
              <Link href="/" className="flex items-center gap-2 group pointer-events-auto">
                <Image src="/logo.png" alt="Edition TV Logo" width={180} height={40} className="h-8 md:h-9 max-h-9 w-auto object-contain dark:invert" priority />
              </Link>
            </div>

            {/* Desktop Center — date & weather */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">
                {mounted &&
                  new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
              </span>
              <WeatherWidget />
            </div>

            {/* Utilities (Right) */}
            <div className="flex items-center gap-1 z-10">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 -mr-2 md:mr-0 rounded-md hover:bg-muted transition-colors"
                aria-label="Search"
                title="Search (/)"
              >
                <Search className="h-5 w-5 md:h-4 md:w-4" />
              </button>

              {/* Desktop Only Utilities */}
              <div className="hidden md:flex items-center gap-1">
                <NotificationPopover />

                <Link href="/saved" className="p-2 rounded-md hover:bg-muted transition-colors relative" aria-label="Saved articles" title="Saved Bookmarks">
                  <Bookmark className="h-4 w-4" />
                  {bookmarkCount > 0 && (
                    <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-primary text-black font-extrabold text-[8px] rounded-full flex items-center justify-center font-mono">
                      {bookmarkCount}
                    </span>
                  )}
                </Link>

                {mounted && user ? (
                  <Link
                    href="/account"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors text-xs font-semibold text-foreground group border border-border/60 bg-muted/20"
                    title={`Reader Account (@${handle})`}
                  >
                    <div className="relative">
                      <User className="h-3.5 w-3.5" />
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                    </div>
                    <span className="font-mono text-xs hidden lg:inline-block max-w-[110px] truncate">
                      @{handle}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-2xs"
                    title="Sign In"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Search bar drop down */}
          {searchOpen && (
            <div className="pb-3 border-t border-border pt-3">
              <form action="/search" method="get">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    name="q"
                    autoFocus
                    type="search"
                    placeholder="Search news, topics, correspondents..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans"
                  />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Category navigation (Hidden on mobile) */}
        <div className="hidden md:block">
          <CategoryNav items={navCategories} />
        </div>
      </header>

      {/* Mobile Side Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 transition-opacity md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Side Drawer Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-[300px] bg-background z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col overflow-y-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-1 -ml-1 rounded-md hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <WeatherWidget />
          </div>
        </div>

        {/* Drawer Account Block */}
        {mounted && user ? (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-mono text-sm uppercase">
                {handle.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate font-mono">@{handle}</p>
                <span className="inline-block px-1.5 py-0.2 text-[9px] font-semibold uppercase bg-emerald-500/10 text-emerald-600 rounded-xs">
                  Active Subscriber
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="py-2 bg-primary text-primary-foreground text-center text-xs font-bold rounded-sm tracking-wide"
              >
                My Account
              </Link>
              <button
                type="button"
                onClick={() => {
                  authService.logout();
                  setMobileOpen(false);
                }}
                className="py-2 border border-border text-center text-xs font-bold rounded-sm hover:bg-muted text-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold">Welcome to Edition TV</p>
                <p className="text-[10px] text-muted-foreground">Sign in for saved stories & preferences</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="py-2 bg-primary text-primary-foreground text-center text-xs font-bold rounded-sm tracking-wide"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="py-2 border border-border text-center text-xs font-bold rounded-sm hover:bg-muted"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Drawer Navigation */}
        <nav className="flex-1 py-2 divide-y divide-border/40">
          {navCategories.map((item) => {
            const hasChildren = item.subcategories && item.subcategories.length > 0;
            const isExpanded = !!expandedMobileCategories[item.id];

            return (
              <div key={item.id} className="py-1">
                <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide flex-1 text-foreground"
                  >
                    <Globe className="h-4 w-4 text-primary" />
                    {item.name}
                  </Link>
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMobileCategories((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-md"
                      aria-label="Toggle Subcategories"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Mobile Subcategories Accordion */}
                {hasChildren && isExpanded && (
                  <div className="pl-11 pr-4 py-1.5 space-y-1 bg-muted/20 border-l-2 border-primary ml-6 my-1 rounded-r-lg">
                    {item.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between py-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
                      >
                        <span className="capitalize">{sub.name}</span>
                        <span className="text-[10px] text-red-500 font-bold">→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Drawer Footer Links */}
        <div className="border-t border-border p-4 space-y-3 bg-muted/10">
          <Link 
            href="/saved" 
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-4 text-sm font-medium"
          >
            <Bookmark className="h-5 w-5 text-muted-foreground" />
            Saved Articles
            {bookmarkCount > 0 && (
              <span className="ml-auto bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                {bookmarkCount}
              </span>
            )}
          </Link>
          <Link 
            href="/about" 
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-4 text-sm font-medium text-muted-foreground pt-2"
          >
            Editorial Standards
          </Link>
        </div>
      </div>
    </>
  );
}
