"use client";

import React, { useState } from "react";
import { Star, Circle, Folder, ChevronDown, ChevronRight, Rss, Globe, Sparkles, ShieldCheck, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeedCategoryItem {
  id: string;
  name: string;
  unreadCount: number;
  feeds: {
    id: string;
    name: string;
    unreadCount: number;
  }[];
}

interface FeedNavigationProps {
  activeView: string;
  selectedFeedId: string | null;
  selectedCategoryId: string | null;
  unreadCount: number;
  starredCount: number;
  totalCount: number;
  categories: FeedCategoryItem[];
  onSelectView: (view: string) => void;
  onSelectFeed: (feedId: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

export function FeedNavigation({
  activeView,
  selectedFeedId,
  selectedCategoryId,
  unreadCount,
  starredCount,
  totalCount,
  categories,
  onSelectView,
  onSelectFeed,
  onSelectCategory,
}: FeedNavigationProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    all: true,
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <div className="w-64 h-full bg-white border-r border-slate-200/80 flex flex-col flex-none select-none font-sans">
      {/* Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
          <Rss className="h-4 w-4 text-red-600" /> Feed Library
        </span>
        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
          {totalCount} items
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="p-2 space-y-1 border-b border-slate-100">
        <button
          onClick={() => onSelectView("all")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition font-sans",
            activeView === "all"
              ? "bg-red-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <div className="flex items-center gap-2">
            <Rss className="h-4 w-4" />
            <span>All Articles</span>
          </div>
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono",
              activeView === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            )}
          >
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => onSelectView("unread")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition font-sans",
            activeView === "unread"
              ? "bg-red-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <div className="flex items-center gap-2">
            <Circle className="h-2.5 w-2.5 fill-red-600 text-red-600" />
            <span>Unread Wire</span>
          </div>
          {unreadCount > 0 && (
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono",
                activeView === "unread" ? "bg-white/20 text-white" : "bg-red-50 text-red-700 border border-red-200"
              )}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectView("starred")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition font-sans",
            activeView === "starred"
              ? "bg-red-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>Starred Items</span>
          </div>
          {starredCount > 0 && (
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono",
                activeView === "starred" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
              )}
            >
              {starredCount}
            </span>
          )}
        </button>
      </div>

      {/* Workflow State Filters */}
      <div className="p-2 space-y-1 border-b border-slate-100 font-sans">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 my-1 font-mono">
          Workflow States
        </div>
        <button
          onClick={() => onSelectView("PUBLISHED")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl transition font-sans",
            activeView === "PUBLISHED"
              ? "bg-red-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span>Published Live</span>
          </div>
        </button>

        <button
          onClick={() => onSelectView("CONVERTED_TO_STORY")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl transition font-sans",
            activeView === "CONVERTED_TO_STORY"
              ? "bg-red-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-slate-500" />
            <span>Converted to Story</span>
          </div>
        </button>

        <button
          onClick={() => onSelectView("ASSIGNED")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl transition font-sans",
            activeView === "ASSIGNED"
              ? "bg-red-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>Assigned to Desk</span>
          </div>
        </button>

        <button
          onClick={() => onSelectView("WIRE_RAW")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl transition font-sans",
            activeView === "WIRE_RAW"
              ? "bg-red-600 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-slate-500" />
            <span>Raw Wire Stream</span>
          </div>
        </button>
      </div>

      {/* Categories & Feeds Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar font-sans">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 my-2 font-mono">
          Categories & Feeds
        </div>
        {categories.map((cat) => {
          const isExpanded = expandedCategories[cat.id] ?? true;
          const isCatSelected = selectedCategoryId === cat.id;

          return (
            <div key={cat.id} className="space-y-0.5">
              <div
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition font-sans",
                  isCatSelected ? "bg-red-50 text-red-700 font-bold border border-red-200" : "text-slate-700 hover:bg-slate-100"
                )}
                onClick={() => onSelectCategory(cat.id)}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(cat.id);
                    }}
                    className="text-slate-400 hover:text-slate-700 p-0.5"
                  >
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                  <Folder className="h-4 w-4 text-red-600 flex-none" />
                  <span className="truncate">{cat.name}</span>
                </div>
                {cat.unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                    {cat.unreadCount}
                  </span>
                )}
              </div>

              {/* Child Feeds */}
              {isExpanded && (
                <div className="pl-6 space-y-0.5">
                  {cat.feeds.map((feed) => {
                    const isFeedSelected = selectedFeedId === feed.id;
                    return (
                      <button
                        key={feed.id}
                        onClick={() => onSelectFeed(feed.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1 text-xs rounded-xl transition font-sans text-left",
                          isFeedSelected
                            ? "bg-red-600 text-white font-bold shadow-2xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <span className="truncate">{feed.name}</span>
                        {feed.unreadCount > 0 && (
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono",
                            isFeedSelected ? "bg-white/20 text-white" : "bg-red-50 text-red-700 border border-red-200"
                          )}>
                            {feed.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
