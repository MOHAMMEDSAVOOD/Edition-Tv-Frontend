"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlayCircle, Bookmark, User } from "lucide-react";
import { useState, useEffect } from "react";
import { savedArticlesService } from "@/services/savedArticlesService";

export function BottomNav() {
  const pathname = usePathname();
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    const updateBookmarks = () => {
      savedArticlesService
        .getSavedCount()
        .then((count) => setBookmarkCount(count))
        .catch(() => {});
    };

    updateBookmarks();
    window.addEventListener("edition_bookmark_changed", updateBookmarks);
    return () => {
      window.removeEventListener("edition_bookmark_changed", updateBookmarks);
    };
  }, []);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Live", href: "/categories/video", icon: PlayCircle },
    { label: "Saved", href: "/saved", icon: Bookmark, badge: bookmarkCount },
    { label: "Profile", href: "/account", icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)" }}
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const currentPath = pathname || "";
          const isActive = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-1 space-y-0.5 transition-colors ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.badge ? (
                  <span className="absolute -top-1 -right-2.5 h-3.5 min-w-3.5 px-0.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium leading-none tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
