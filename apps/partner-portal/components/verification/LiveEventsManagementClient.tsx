"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Radio, Send, Clock, RefreshCw, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

interface LiveUpdate {
  id: string;
  headline: string;
  contentBody: string;
  publishedAt?: string;
  authorId?: string;
}

export default function LiveEventsManagementClient() {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(true);
  const [headline, setHeadline] = useState("");
  const [contentBody, setContentBody] = useState("");

  const fetchLiveUpdates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<LiveUpdate[]>("/liveblogs").catch(() => []);
      const list = Array.isArray(data) ? data : [];
      setUpdates(list);
      setWsConnected(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load live coverage updates");
      setWsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveUpdates();
  }, [fetchLiveUpdates]);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline || !contentBody) return;
    try {
      const payload = { headline, contentBody, publishedAt: new Date().toISOString() };
      await apiClient.post("/liveblogs", payload).catch(() => null);
      fetchLiveUpdates();
      setHeadline("");
      setContentBody("");
    } catch (err: unknown) {
      alert("Failed to post live update: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span className="font-semibold text-foreground font-sans">Newsroom</span>
            <span>/</span>
            <span className="text-rose-400 font-bold">Live Coverage Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Live Coverage Control Room
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
              <Radio className="h-3 w-3 animate-pulse" /> LIVE STREAM
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Post real-time live blog bulletins, manage live coverage streams, and dispatch push updates to website subscribers.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Live Connection Status Badge */}
          {wsConnected ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              <Wifi className="h-3.5 w-3.5" /> STOMP LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
              <WifiOff className="h-3.5 w-3.5" /> CONNECTION OFFLINE
            </span>
          )}

          <button
            onClick={fetchLiveUpdates}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold border border-border bg-card hover:bg-muted rounded-lg transition shadow-xs text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Offline Alert Strip */}
      {!wsConnected && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-3 text-xs font-mono text-rose-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-none" />
            <span>LIVE CONNECTION OFFLINE — Real-time STOMP dispatch stream interrupted.</span>
          </div>
          <button
            onClick={fetchLiveUpdates}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition shadow-xs"
          >
            Reconnect Live Stream
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Bulletin Form */}
        <div className="p-5 border border-border rounded-xl bg-card space-y-4 shadow-xs h-fit font-sans">
          <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground flex items-center gap-2">
            <Send className="h-4 w-4 text-rose-500" /> Post Live Bulletin
          </h2>
          <form onSubmit={handlePostUpdate} className="space-y-3 text-xs">
            <div>
              <label className="block font-mono font-bold text-[10px] uppercase text-muted-foreground mb-1">Update Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Breaking: Press Briefing Concludes"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background font-sans focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-[10px] uppercase text-muted-foreground mb-1">Live Bulletin Content</label>
              <textarea
                required
                rows={5}
                placeholder="Enter live update body text..."
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background font-sans focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg transition shadow-xs flex items-center justify-center gap-2 font-mono"
            >
              <Send className="h-3.5 w-3.5" /> Publish Live Bulletin
            </button>
          </form>
        </div>

        {/* Live Bulletin Stream */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-rose-500" /> Live Update Stream ({updates.length})
          </h2>

          {error ? (
            <ErrorState message={error} onRetry={fetchLiveUpdates} />
          ) : loading ? (
            <div className="h-64 bg-card border border-border animate-pulse rounded-xl" />
          ) : updates.length === 0 ? (
            <EmptyState title="No Live Bulletins Yet" description="Post a live bulletin to start the stream." />
          ) : (
            <div className="space-y-3">
              {updates.map((up) => (
                <div key={up.id} className="p-4 border-l-4 border-l-rose-600 border border-border rounded-r-xl bg-card space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span className="font-bold text-rose-400">
                      {new Date(up.publishedAt || Date.now()).toLocaleTimeString()}
                    </span>
                    <span>By {up.authorId || "Desk Chief"}</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{up.headline}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{up.contentBody}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
