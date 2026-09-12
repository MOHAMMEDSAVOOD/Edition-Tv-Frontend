"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, User, Bookmark, Menu, ArrowLeft, Globe } from "lucide-react";
import { savedArticlesService } from "@/services/savedArticlesService";
import { CategoryNav } from "./CategoryNav";
import { NotificationPopover } from "./NotificationPopover";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { apiClient } from "@/lib/api-client";

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  showInNav?: boolean;
}

export function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [navItems, setNavItems] = useState<{ label: string; href: string }[]>([]);

  useEffect(() => {
    setMounted(true);
    savedArticlesService.getSavedArticles().then((items) => setBookmarkCount(items.length)).catch(() => {});

    const fetchCategories = async () => {
      try {
        const data = await apiClient.get<ApiCategory[]>("/cms/categories");
        if (Array.isArray(data)) {
          const items = data
            .filter((cat) => cat.showInNav !== false)
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
            .map((cat) => ({
              label: cat.name,
              href: `/categories/${cat.slug}`,
            }));
          setNavItems(items);
        }
      } catch {
        // Pure API mode: no fallback mock data
      }
    };
    
    fetchCategories();
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
      <header className="sticky top-0 z-40 bg-background border-b border-border shadow-xs max-w-full overflow-x-hidden">
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

                <Link href="/account" className="p-2 rounded-md hover:bg-muted transition-colors" aria-label="Account" title="Reader Account">
                  <User className="h-4 w-4" />
                </Link>
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
          <CategoryNav items={navItems} />
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
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold">Welcome to Edition TV</p>
            </div>
          </div>
          <Link 
            href="/login" 
            onClick={() => setMobileOpen(false)}
            className="block w-full py-2 bg-primary text-primary-foreground text-center text-sm font-bold rounded-sm tracking-wide"
          >
            Sign In / Register
          </Link>
        </div>

        {/* Drawer Navigation */}
        <nav className="flex-1 py-2">
          {navItems.map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-4 py-3 px-4 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Globe className="h-5 w-5 text-muted-foreground" />
                {item.label}
              </Link>
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
