"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { feedService } from "@/services/feedService";

export function TopicExplorerWidget() {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedService
      .getTopics()
      .then((data) => {
        setTopics(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-xs p-5 shadow-sm animate-pulse" suppressHydrationWarning>
        <div className="h-4 bg-muted w-32 mb-3 rounded-xs" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 w-20 bg-muted rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (topics.length === 0) return null;

  return (
    <div className="bg-white border border-border rounded-xs p-5 shadow-sm" suppressHydrationWarning>
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Explore Topics
      </h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((tag) => (
          <Link
            key={tag}
            href={`/topics/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, "-"))}`}
            className="px-3 py-1 bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold rounded-full transition"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}

