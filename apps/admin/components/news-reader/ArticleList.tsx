"use client";

import React from "react";
import { Search, RefreshCw, CheckCheck, Star, Circle, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WireItem {
  id: string;
  feedId: string;
  sourceId: string;
  guid: string;
  canonicalUrl: string;
  title: string;
  summary?: string;
  contentHtml?: string;
  author?: string;
  pubDate?: string;
  state: string;
  priority: string;
  enclosureUrl?: string;
  enclosureType?: string;
  mediaThumbnailUrl?: string;
  copyright?: string;
  language?: string;
  read: boolean;
  starred: boolean;
}

interface ArticleListProps {
  items: WireItem[];
  selectedItemId: string | null;
  activeFilter: string;
  searchQuery: string;
  isLoading: boolean;
  onSelectItem: (item: WireItem) => void;
  onFilterChange: (filter: string) => void;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  onToggleStar: (e: React.MouseEvent, item: WireItem) => void;
}

export function ArticleList({
  items,
  selectedItemId,
  activeFilter,
  searchQuery,
  isLoading,
  onSelectItem,
  onFilterChange,
  onSearchChange,
  onRefresh,
  onMarkAllRead,
  onToggleStar,
}: ArticleListProps) {
  const FILTER_OPTIONS = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "starred", label: "Starred" },
    { id: "PUBLISHED", label: "Published 🌐" },
    { id: "CONVERTED_TO_STORY", label: "Converted 🪄" },
    { id: "ASSIGNED", label: "Assigned 🛡️" },
    { id: "WIRE_RAW", label: "Raw Wire 📰" },
  ];

  return (
    <div className="w-80 md:w-96 h-full bg-white border-r border-slate-200 flex flex-col flex-none select-none">
      {/* Top Search Bar & Action Controls */}
      <div className="p-3 border-b border-slate-200 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search wire headlines..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 transition font-sans"
            />
          </div>
          <button
            onClick={onRefresh}
            title="Refresh Feeds"
            disabled={isLoading}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin text-red-600")} />
          </button>
          <button
            onClick={onMarkAllRead}
            title="Mark All as Read"
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-red-600 hover:bg-slate-100 transition"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition border",
                activeFilter === f.id
                  ? "bg-red-600 border-red-500 text-white shadow-2xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stream List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
        {isLoading && items.length === 0 ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 animate-pulse space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 bg-slate-200 rounded-full" />
                  <div className="h-3 w-12 bg-slate-200 rounded-full" />
                </div>
                <div className="h-4 w-full bg-slate-200 rounded-lg" />
                <div className="h-4 w-3/4 bg-slate-200 rounded-lg" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-3 w-14 bg-slate-200 rounded-full" />
                  <div className="h-3 w-10 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-1 font-mono">
            <p className="font-bold text-slate-700">No wire items found</p>
            <p className="text-[11px]">Try selecting a different feed or search query</p>
          </div>
        ) : (
          items.map((item) => {
            const isSelected = selectedItemId === item.id;
            const timeFormatted = item.pubDate
              ? new Date(item.pubDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Just now";

            const getStateBadge = (state: string) => {
              switch (state) {
                case "WIRE_RAW":
                  return { label: "Raw Wire", bg: "bg-slate-100 text-slate-700 border-slate-200" };
                case "CONVERTED_TO_STORY":
                  return { label: "Converted to Story 🪄", bg: "bg-amber-50 text-amber-700 border-amber-200" };
                case "ASSIGNED":
                  return { label: "Assigned to Desk 🛡️", bg: "bg-blue-50 text-blue-700 border-blue-200" };
                case "PUBLISHED":
                  return { label: "Published Live 🌐", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
                default:
                  return {
                    label: state ? state.replace(/_/g, " ") : "Raw Wire",
                    bg: "bg-slate-100 text-slate-700 border-slate-200",
                  };
              }
            };

            const stateBadge = getStateBadge(item.state);

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={cn(
                  "p-3.5 cursor-pointer transition relative group font-sans",
                  isSelected
                    ? "bg-red-50/80 border-l-4 border-red-600 text-slate-900 shadow-2xs"
                    : item.read
                    ? "bg-white text-slate-700 hover:bg-slate-50"
                    : "bg-slate-50/50 text-slate-900 font-semibold hover:bg-slate-100/80"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    {!item.read && <Circle className="h-2 w-2 fill-red-600 text-red-600 flex-none" />}
                    <span className="truncate max-w-[150px] font-extrabold text-red-600">
                      {item.sourceId || item.feedId || "Wire Stream"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-500 font-bold">
                      <Clock className="h-2.5 w-2.5 text-slate-400" />
                      {timeFormatted}
                    </span>
                  </div>

                  <button
                    onClick={(e) => onToggleStar(e, item)}
                    className="text-slate-400 hover:text-amber-500 transition-colors p-0.5"
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        item.starred ? "text-amber-500 fill-amber-500" : "text-slate-400"
                      )}
                    />
                  </button>
                </div>

                <h4
                  className={cn(
                    "text-xs leading-snug line-clamp-2 mb-1 font-serif",
                    item.read ? "text-slate-600 font-normal" : "text-slate-900 font-extrabold"
                  )}
                >
                  {item.title}
                </h4>

                {item.summary && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 font-normal leading-relaxed font-sans">
                    {item.summary.replace(/<[^>]*>?/gm, "")}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-500 border-t border-slate-100">
                  <span className={cn("px-2.5 py-0.5 rounded-full font-mono font-bold border text-[10px]", stateBadge.bg)}>
                    {stateBadge.label}
                  </span>
                  {item.enclosureUrl && (
                    <span className="flex items-center gap-1 text-slate-600 font-mono font-bold">
                      <Tag className="h-3 w-3 text-red-600" /> Media Attached
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
