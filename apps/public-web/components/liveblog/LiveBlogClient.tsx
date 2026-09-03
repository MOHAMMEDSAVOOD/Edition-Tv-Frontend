"use client";
import { useState } from "react";
import { LiveBlogItem, LiveBlogUpdate } from "@/services/liveBlogService";
import { Radio, Pin, RefreshCw, Clock, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveBlogClientProps {
  initialBlog: LiveBlogItem;
}

export function LiveBlogClient({ initialBlog }: LiveBlogClientProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastChecked(new Date());
    }, 600);
  };

  const pinnedUpdates = initialBlog.updates.filter((u: LiveBlogUpdate) => u.isPinned);
  const regularUpdates = initialBlog.updates.filter((u: LiveBlogUpdate) => !u.isPinned);

  return (
    <div className="space-y-8 font-sans">
      {/* Real-time Status Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-muted/40 border border-border rounded-sm text-xs">
        <div className="flex items-center gap-3 text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <Radio className="h-3.5 w-3.5 text-primary animate-pulse" /> Live Stream Active
          </span>
          <span>·</span>
          <span>Last updated {lastChecked.toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-primary h-3.5 w-3.5"
            />
            <span>Auto-refresh</span>
          </label>
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1 px-2.5 py-1 bg-background border border-border rounded-sm hover:bg-muted transition-colors font-medium text-foreground"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Pinned Key Developments */}
      {pinnedUpdates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary font-mono">
            <Pin className="h-3.5 w-3.5 fill-current" /> Key Developments (Pinned)
          </div>
          {pinnedUpdates.map((update: LiveBlogUpdate) => (
            <div key={update.id} className="p-5 bg-card border-2 border-primary/40 rounded-sm shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="font-bold text-primary">{update.timestamp}</span>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">Pinned</span>
              </div>
              <h2 className="headline-md text-lg text-foreground font-bold">{update.headline}</h2>
              <p className="text-sm text-foreground/90 leading-relaxed font-sans">{update.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Timeline Stream Feed */}
      <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {regularUpdates.map((update: LiveBlogUpdate) => (
          <div key={update.id} className="relative pl-8 space-y-2 group">
            {/* Timeline node dot */}
            <div className="absolute left-1.5 top-1.5 -translate-x-1/2 h-3 w-3 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform" />

            <div className="p-4 bg-card border border-border rounded-sm space-y-2 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="font-bold text-foreground/80 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" /> {update.timestamp}
                </span>
                <button
                  onClick={() => {
                    if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors text-[11px] flex items-center gap-1"
                >
                  <Share2 className="h-3 w-3" /> Share Post
                </button>
              </div>
              <h3 className="headline-sm text-base text-foreground font-bold">{update.headline}</h3>
              <p className="text-sm text-foreground/90 leading-relaxed font-sans">{update.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
