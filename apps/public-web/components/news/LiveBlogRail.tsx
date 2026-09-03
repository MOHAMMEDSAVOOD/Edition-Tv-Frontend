"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { liveBlogService, LiveBlogItem } from "@/services/liveBlogService";

export function LiveBlogRail() {
  const [liveBlog, setLiveBlog] = useState<LiveBlogItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    liveBlogService
      .getActiveLiveCoverage()
      .then((data) => {
        setLiveBlog(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-muted/30 border border-border p-4 rounded-sm animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 bg-slate-200 w-24 rounded" />
          <div className="h-3 bg-slate-200 w-16 rounded" />
        </div>
        <div className="h-4 bg-slate-200 w-48 mb-3 rounded" />
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="h-3 bg-slate-200 w-full rounded" />
          <div className="h-3 bg-slate-200 w-3/4 rounded" />
        </div>
      </div>
    );
  }

  if (!liveBlog || !liveBlog.updates || liveBlog.updates.length === 0) {
    return (
      <div className="bg-muted/30 border border-border p-4 rounded-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          <span className="section-label text-xs">Live Coverage</span>
        </div>
        <p className="text-xs text-muted-foreground italic">
          No live breaking coverage is active at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border border-border p-4 rounded-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="live-dot h-2 w-2 rounded-full bg-primary" />
          <span className="section-label text-xs">Live Coverage</span>
        </div>
        <Link href={`/liveblog/${liveBlog.id}`} className="text-[11px] text-primary hover:underline font-semibold">
          View Stream →
        </Link>
      </div>

      <h3 className="headline-sm text-sm mb-3">
        <Link href={`/liveblog/${liveBlog.id}`} className="hover:text-primary transition-colors">
          {liveBlog.title}
        </Link>
      </h3>

      <div className="space-y-3 pt-2 border-t border-border/60">
        {liveBlog.updates.slice(0, 5).map((update) => (
          <div key={update.id} className="flex items-start gap-2.5 text-xs">
            <span className="font-mono text-muted-foreground text-[11px] whitespace-nowrap pt-0.5">
              {update.timestamp}
            </span>
            <p className="font-medium text-foreground/90 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
              {update.headline || update.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
