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
    savedArticlesService.getSavedArticles().then((items) => setBookmarkCount(items.length)).catch(() => {});
  }, []);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Live", href: "/categories/video", icon: PlayCircle },
    { label: "Saved", href: "/saved", icon: Bookmark, badge: bookmarkCount },
    { label: "Profile", href: "/account", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const currentPath = pathname || "";
          const isActive = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.badge ? (
                  <span className="absolute -top-1 -right-2 h-3.5 w-3.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
