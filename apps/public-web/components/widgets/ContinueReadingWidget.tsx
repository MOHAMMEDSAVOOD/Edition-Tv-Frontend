"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Article } from "@/types/models";
import { apiClient } from "@/lib/api-client";

export function ContinueReadingWidget() {
  const [recentArticle, setRecentArticle] = useState<Article | null>(null);

  useEffect(() => {
    // Loaded from localStorage if available
    try {
      const stored = localStorage.getItem("edition_last_read_article");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.slug) {
          apiClient.get<any>(`/public/articles?slug=${encodeURIComponent(parsed.slug)}`)
            .then((data) => {
              if (data) {
                setRecentArticle(parsed);
              } else {
                localStorage.removeItem("edition_last_read_article");
                setRecentArticle(null);
              }
            })
            .catch(() => {
              setRecentArticle(null);
            });
        }
      }
    } catch {
      // Ignored
    }
  }, []);

  if (!recentArticle) return null;

  return (
    <div className="bg-secondary border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground ">
          Continue Reading
        </div>
        <div className="text-sm font-bold text-foreground line-clamp-1 mt-1">
          {recentArticle.title}
        </div>
      </div>
      <Link
        href={`/articles/${recentArticle.slug}`}
        className="px-3 py-1.5 bg-primary hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex-shrink-0 transition"
      >
        Resume
      </Link>
    </div>
  );
}
