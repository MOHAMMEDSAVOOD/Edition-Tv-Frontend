"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Article } from "@/types/models";

export function RecentlyViewedWidget() {
  const [recentStories, setRecentStories] = useState<Article[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("edition_recently_viewed");
      if (stored) {
        setRecentStories(JSON.parse(stored).slice(0, 4));
      }
    } catch {
      // Ignored
    }
  }, []);

  if (recentStories.length === 0) return null;

  return (
    <div className="bg-white border border-border rounded-xs p-5 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Recently Viewed
      </h3>
      <div className="space-y-3">
        {recentStories.map((story) => (
          <Link
            key={story.id}
            href={`/articles/${story.slug}`}
            className="block text-sm font-semibold text-foreground hover:text-primary transition line-clamp-2"
          >
            {story.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
