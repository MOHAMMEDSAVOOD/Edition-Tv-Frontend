"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Top Stories", slug: "top-stories", href: "/" },
  { name: "World", slug: "world", href: "/" },
  { name: "Politics", slug: "politics", href: "/" },
  { name: "Business", slug: "business", href: "/" },
  { name: "Technology", slug: "technology", href: "/" },
  { name: "Science", slug: "science", href: "/" },
  { name: "Opinion", slug: "opinion", href: "/" },
  { name: "Live Coverage", slug: "liveblog", href: "/" },
] as const;

export function CategoryBar() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b bg-card/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 no-scrollbar">
        {categories.map((cat) => {
          const currentPath = pathname || "";
          const isActive = currentPath === cat.href;
          return (
            <Link
              key={cat.slug}
              href="/"
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
