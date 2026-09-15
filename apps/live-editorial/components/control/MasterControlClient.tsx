"use client";
import { useState } from "react";
import { Send, Pin, Rss, Bell, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface WireItem {
  id: string;
  source: "AP" | "REUTERS" | "AFP" | "INTERNAL";
  time: string;
  headline: string;
  urgent: boolean;
}

interface LivePost {
  id: string;
  time: string;
  headline: string;
  content: string;
  isPinned: boolean;
}

export function MasterControlClient() {
  // TODO: wire the stream and the live blog to the backend. Both stay empty rather than showing
  // sample wire copy attributed to Reuters/AP/AFP that never came off a wire.
  const [wires] = useState<WireItem[]>([]);
  const [posts] = useState<LivePost[]>([]);

  // New Live Post Form State
  const [postHeadline, setPostHeadline] = useState("");
  const [postContent, setPostContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const handleDispatchPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postHeadline.trim()) return;

    // A dispatched post must reach the live blog backend. Appending it locally would show the
    // desk a published update that no reader can see.
    setIsDispatching(false);
    setDispatchError("Live dispatch is not connected to the live blog backend yet.");
  };

  const handleTriageWire = (wire: WireItem) => {
    setPostHeadline(wire.headline);
    setPostContent(`Relayed from ${wire.source} Wire Service at ${wire.time}.`);
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden text-xs">
      {/* ── LEFT PANE (3 cols): Wire Feed Stream ── */}
      <div className="lg:col-span-3 bg-card border border-border flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-border bg-black/40 flex items-center justify-between font-bold text-primary">
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <Rss className="h-3.5 w-3.5" /> Wire Stream
          </span>
          <span className="text-[10px] text-muted-foreground">{wires.length} ALERTS</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border no-scrollbar">
          {wires.length === 0 && (
            <p className="p-4 text-center text-muted-foreground font-mono text-[11px]">No wire items.</p>
          )}
          {wires.map((wire) => (
            <div
              key={wire.id}
              onClick={() => handleTriageWire(wire)}
              className={cn(
                "p-3 space-y-1 hover:bg-muted/40 cursor-pointer transition-colors group",
                wire.urgent && "border-l-2 border-red-500 bg-red-500/5"
              )}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-primary">{wire.source}</span>
                <span className="text-muted-foreground font-mono">{wire.time}</span>
              </div>
              <p className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                {wire.headline}
              </p>
              <span className="text-[9px] text-muted-foreground/70 uppercase">Click to triage →</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CENTER PANE (6 cols): Active Live Stream Poster & Timeline ── */}
      <div className="lg:col-span-6 bg-card border border-border flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-border bg-black/40 flex items-center justify-between font-bold text-primary">
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" /> Live Stream Poster
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">STATUS: BROADCASTING</span>
        </div>

        {/* Dispatch Form */}
        <form onSubmit={handleDispatchPost} className="p-4 border-b border-border bg-muted/20 space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Post Headline</label>
            <input
              type="text"
              required
              value={postHeadline}
              onChange={(e) => setPostHeadline(e.target.value)}
              placeholder="Enter live update headline or click wire entry..."
              className="w-full bg-background border border-border p-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Post Content</label>
            <textarea
              rows={3}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Enter paragraph text..."
              className="w-full bg-background border border-border p-2 text-xs text-foreground focus:outline-none focus:border-primary resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="accent-primary"
              />
              <span>Pin to Top (Key Development)</span>
            </label>

            <button
              type="submit"
              disabled={isDispatching || !postHeadline.trim()}
              className="flex items-center gap-1.5 bg-primary text-black font-extrabold text-xs px-4 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {isDispatching ? "DISPATCHING..." : "DISPATCH UPDATE"}
            </button>
          </div>

          {dispatchError && (
            <p className="mt-2 p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[11px]">
              {dispatchError}
            </p>
          )}
        </form>

        {/* Active Feed List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {posts.length === 0 && (
            <p className="p-4 text-center text-muted-foreground font-mono text-[11px]">No live posts.</p>
          )}
          {posts.map((post) => (
            <div
              key={post.id}
              className={cn(
                "p-3 border space-y-1.5 bg-background",
                post.isPinned ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-primary flex items-center gap-1">
                  {post.isPinned && <Pin className="h-3 w-3 fill-current" />} {post.time}
                </span>
                {post.isPinned && <span className="text-primary font-bold uppercase text-[9px]">PINNED</span>}
              </div>
              <h3 className="font-bold text-sm text-foreground">{post.headline}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{post.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANE (3 cols): Push Alerts & Control Queue ── */}
      <div className="lg:col-span-3 bg-card border border-border flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-border bg-black/40 flex items-center justify-between font-bold text-primary">
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <Bell className="h-3.5 w-3.5" /> Push Alerts
          </span>
          <span className="text-[10px] text-muted-foreground">MOBILE / WEB</span>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto no-scrollbar">
          {/* TODO: the push composer and outbox telemetry need backend endpoints. The previous
              version showed a fabricated breaking headline behind a button that only raised an
              alert() claiming 1.2M subscribers had been notified. */}
          <p className="text-muted-foreground font-mono text-[11px] py-4 text-center">
            Push dispatch is not connected yet.
          </p>

          <div className="border-t border-border pt-3 space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Outbox Health</span>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Queue Lag:</span>
                <span className="text-muted-foreground font-bold">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outbox Events:</span>
                <span className="text-muted-foreground font-bold">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
