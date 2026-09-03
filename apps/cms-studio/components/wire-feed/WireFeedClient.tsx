"use client";

import { useEffect, useState } from "react";
import {
  Rss,
  RefreshCw,
  FilePlus,
  UserCheck,
  CheckCircle,
  Archive,
  Search,
  ExternalLink,
  Clock,
  User,
  Tag,
  Music,
  Video,
  FileText,
  Shield,
} from "lucide-react";

interface WireItem {
  id: string;
  feedId: string;
  sourceId: string;
  guid: string;
  canonicalUrl: string;
  title: string;
  summary: string;
  contentHtml: string;
  author: string;
  pubDate: string;
  state: string;
  deskId: string | null;
  sectionId: string | null;
  storyId: string | null;
  priority: string;
  createdAt: string;
  enclosureUrl?: string;
  enclosureType?: string;
  enclosureLength?: number;
  mediaThumbnailUrl?: string;
  copyright?: string;
  language?: string;
}

export function WireFeedClient() {
  const [items, setItems] = useState<WireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("WIRE_RAW");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWireItems = async () => {
    setLoading(true);
    try {
      const url = selectedState
        ? `/api/v1/newsroom/wire-items?state=${selectedState}&page=0&size=50`
        : `/api/v1/newsroom/wire-items?page=0&size=50`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data.content || []);
      }
    } catch (e) {
      console.error("Failed to fetch wire candidate items:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWireItems();
  }, [selectedState]);

  const handleUpdateState = async (itemId: string, newState: string) => {
    try {
      await fetch(`/api/v1/newsroom/wire-items/${itemId}/state?state=${newState}`, {
        method: "PUT",
      });
      fetchWireItems();
    } catch (e) {
      console.error("Failed to update wire item state:", e);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Rss className="h-5 w-5 text-blue-500" />
            Editorial Wire Candidates & Research Stream
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Inspect ingested external wire stories, route candidate items to desks, or convert them into assignments.
          </p>
        </div>
        <button
          onClick={() => fetchWireItems()}
          className="px-3 py-2 text-xs font-semibold rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stream
        </button>
      </div>

      {/* Navigation Filter Tabs & Search */}
      <div className="bg-[hsl(var(--card))] border border-white/10 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "WIRE_RAW", label: "Raw Candidates" },
            { id: "REVIEWED", label: "Reviewed" },
            { id: "ASSIGNED", label: "Assigned" },
            { id: "CONVERTED_TO_STORY", label: "Converted Stories" },
            { id: "ARCHIVED", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedState(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                selectedState === tab.id
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search wire candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-black/40 border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-[hsl(var(--card))] border border-white/10 rounded-lg py-12 text-center text-gray-500 text-xs">
            No wire items found for state &quot;{selectedState}&quot;. Ingested items from news sources will appear here automatically.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[hsl(var(--card))] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {item.state}
                    </span>
                    {item.priority === "HIGH" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Urgent Wire
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white hover:text-blue-400 transition-colors">
                    <a href={item.canonicalUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                      {item.title}
                      <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                    </a>
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 flex-none">
                  {item.state !== "CONVERTED_TO_STORY" && (
                    <button
                      onClick={() => handleUpdateState(item.id, "CONVERTED_TO_STORY")}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition-colors"
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                      Create Story
                    </button>
                  )}
                  {item.state !== "REVIEWED" && item.state !== "CONVERTED_TO_STORY" && (
                    <button
                      onClick={() => handleUpdateState(item.id, "REVIEWED")}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                      Mark Reviewed
                    </button>
                  )}
                  {item.state !== "ARCHIVED" && (
                    <button
                      onClick={() => handleUpdateState(item.id, "ARCHIVED")}
                      className="px-2 py-1.5 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title="Archive Wire Item"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {item.mediaThumbnailUrl && (
                <div className="overflow-hidden rounded-md max-h-48 bg-black/40 border border-white/5">
                  <img src={item.mediaThumbnailUrl} alt={item.title} className="w-full object-cover max-h-48" />
                </div>
              )}

              {item.summary && (
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {item.summary.replace(/<[^>]*>?/gm, "")}
                </p>
              )}

              {item.enclosureUrl && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-[11px] text-gray-300">
                  {item.enclosureType?.startsWith("audio/") ? (
                    <Music className="h-3.5 w-3.5 text-blue-400" />
                  ) : item.enclosureType?.startsWith("video/") ? (
                    <Video className="h-3.5 w-3.5 text-rose-400" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <span className="font-mono truncate flex-1">{item.enclosureUrl}</span>
                  {item.enclosureLength && (
                    <span className="text-[10px] text-gray-500 font-mono">
                      {(item.enclosureLength / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-4 flex-wrap">
                  {item.author && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-gray-500" />
                      {item.author}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    {new Date(item.pubDate || item.createdAt).toLocaleString()}
                  </span>
                  {item.copyright && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Shield className="h-3 w-3 text-amber-500/70" />
                      {item.copyright}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-gray-500">{item.guid}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
