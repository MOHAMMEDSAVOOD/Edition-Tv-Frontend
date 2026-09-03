"use client";

import React, { useEffect, useState } from "react";
import { FeedNavigation, FeedCategoryItem } from "./FeedNavigation";
import { ArticleList, WireItem } from "./ArticleList";
import { ArticleReader } from "./ArticleReader";
import { DirectPublishModal } from "./DirectPublishModal";
import { PublicationDetailsModal } from "./PublicationDetailsModal";

export function NewsReaderClient() {
  const [items, setItems] = useState<WireItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WireItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal States
  const [publishingItem, setPublishingItem] = useState<WireItem | null>(null);
  const [viewingDetailsItem, setViewingDetailsItem] = useState<WireItem | null>(null);

  // Stats state
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [starredCount, setStarredCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [categories, setCategories] = useState<FeedCategoryItem[]>([]);

  // Fetch Reader Stats
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/v1/newsroom/wire-items/stats");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.totalUnread || 0);
        setStarredCount(data.totalStarred || 0);
        setTotalCount(data.totalItems || 0);
      }
    } catch (e) {
      console.error("Failed to fetch reader stats", e);
    }
  };

  // Fetch Categories & Sources
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/v1/admin/news-sources");
      if (res.ok) {
        const data = await res.json();
        const catMap: Record<string, FeedCategoryItem> = {};

        data.forEach((src: { id: string; name: string; categoryId?: string }) => {
          const catName = src.categoryId || "General Wire";
          if (!catMap[catName]) {
            catMap[catName] = {
              id: catName,
              name: catName,
              unreadCount: 0,
              feeds: [],
            };
          }
          catMap[catName].feeds.push({
            id: src.id,
            name: src.name,
            unreadCount: 0,
          });
        });

        setCategories(Object.values(catMap));
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  };

  // Fetch Wire Stream Items
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", "0");
      params.append("size", "50");

      if (activeFilter === "unread") params.append("unreadOnly", "true");
      if (activeFilter === "starred") params.append("starredOnly", "true");
      if (["PUBLISHED", "CONVERTED_TO_STORY", "ASSIGNED", "WIRE_RAW"].includes(activeFilter)) {
        params.append("state", activeFilter);
      }
      if (selectedFeedId) params.append("feedId", selectedFeedId);
      if (selectedCategoryId) params.append("sourceId", selectedCategoryId);
      if (searchQuery) params.append("query", searchQuery);

      const res = await fetch(`/api/v1/newsroom/wire-items/reader?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const content = data.content || [];
        setItems(content);
        if (content.length > 0 && !selectedItem) {
          setSelectedItem(content[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch wire stream", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [activeFilter, selectedFeedId, selectedCategoryId, searchQuery]);

  // Handlers
  const handleSelectItem = async (item: WireItem) => {
    setSelectedItem(item);
    if (!item.read) {
      try {
        await fetch(`/api/v1/newsroom/wire-items/${item.id}/read?read=true`, { method: "PUT" });
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        console.error("Failed to mark item read", e);
      }
    }
  };

  const handleToggleRead = async (item: WireItem) => {
    const nextState = !item.read;
    try {
      await fetch(`/api/v1/newsroom/wire-items/${item.id}/read?read=${nextState}`, { method: "PUT" });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: nextState } : i)));
      if (selectedItem?.id === item.id) {
        setSelectedItem({ ...selectedItem, read: nextState });
      }
      setUnreadCount((c) => (nextState ? Math.max(0, c - 1) : c + 1));
    } catch (e) {
      console.error("Failed to toggle read state", e);
    }
  };

  const handleToggleStar = async (item: WireItem) => {
    const nextState = !item.starred;
    try {
      await fetch(`/api/v1/newsroom/wire-items/${item.id}/star?starred=${nextState}`, { method: "PUT" });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, starred: nextState } : i)));
      if (selectedItem?.id === item.id) {
        setSelectedItem({ ...selectedItem, starred: nextState });
      }
      setStarredCount((c) => (nextState ? c + 1 : Math.max(0, c - 1)));
    } catch (e) {
      console.error("Failed to toggle star state", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/v1/newsroom/wire-items/mark-all-read", { method: "POST" });
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Failed to mark all read", e);
    }
  };

  const handleConvertToStory = async (item: WireItem) => {
    try {
      const res = await fetch(`/api/v1/newsroom/wire-items/${item.id}/convert-to-story`, { method: "POST" });
      if (res.ok) {
        const updated: WireItem = await res.json();
        setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
        if (selectedItem?.id === item.id) {
          setSelectedItem(updated);
        }
        alert("Wire candidate successfully converted to Draft Story in CMS Studio Workspace! Click 'Open in CMS Studio' to edit and refine.");
      }
    } catch (e) {
      console.error("Failed to convert story", e);
    }
  };

  const handleAssignToDesk = async (item: WireItem) => {
    try {
      await fetch(`/api/v1/newsroom/wire-items/${item.id}/state?state=ASSIGNED`, { method: "PUT" });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, state: "ASSIGNED" } : i)));
      if (selectedItem?.id === item.id) {
        setSelectedItem({ ...selectedItem, state: "ASSIGNED" });
      }
      alert("Wire item assigned to news desk!");
    } catch (e) {
      console.error("Failed to assign desk", e);
    }
  };

  const handlePublishSuccess = (item: WireItem) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, state: "PUBLISHED" } : i)));
    if (selectedItem?.id === item.id) {
      setSelectedItem({ ...selectedItem, state: "PUBLISHED" });
    }
    setPublishingItem(null);
    setViewingDetailsItem({ ...item, state: "PUBLISHED" });
  };

  const handleUnpublishFromPublicWeb = async (item: WireItem) => {
    try {
      const res = await fetch(`/api/v1/newsroom/wire-items/${item.id}/unpublish`, { method: "POST" });
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, state: "WIRE_RAW" } : i)));
        if (selectedItem?.id === item.id) {
          setSelectedItem({ ...selectedItem, state: "WIRE_RAW" });
        }
        alert("Article successfully unpublished/paused from Edition TV Public Web!");
      } else {
        alert("Failed to unpublish article.");
      }
    } catch (e) {
      console.error("Failed to unpublish from public web", e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-slate-950 font-sans relative">
      {/* 1. Feed Navigation Sidebar */}
      <FeedNavigation
        activeView={activeFilter}
        selectedFeedId={selectedFeedId}
        selectedCategoryId={selectedCategoryId}
        unreadCount={unreadCount}
        starredCount={starredCount}
        totalCount={totalCount}
        categories={categories}
        onSelectView={(v) => {
          setActiveFilter(v);
          setSelectedFeedId(null);
          setSelectedCategoryId(null);
        }}
        onSelectFeed={(feedId) => {
          setSelectedFeedId(feedId);
          setSelectedCategoryId(null);
        }}
        onSelectCategory={(catId) => {
          setSelectedCategoryId(catId);
          setSelectedFeedId(null);
        }}
      />

      {/* 2. Article Stream List */}
      <ArticleList
        items={items}
        selectedItemId={selectedItem?.id || null}
        activeFilter={activeFilter}
        searchQuery={searchQuery}
        isLoading={isLoading}
        onSelectItem={handleSelectItem}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearchQuery}
        onRefresh={fetchItems}
        onMarkAllRead={handleMarkAllRead}
        onToggleStar={(e, item) => {
          e.stopPropagation();
          handleToggleStar(item);
        }}
      />

      {/* 3. Reading Detail Pane */}
      <ArticleReader
        item={selectedItem}
        onToggleRead={handleToggleRead}
        onToggleStar={handleToggleStar}
        onConvertToStory={handleConvertToStory}
        onAssignToDesk={handleAssignToDesk}
        onPublishToPublicWeb={(item) => setPublishingItem(item)}
        onUnpublishFromPublicWeb={handleUnpublishFromPublicWeb}
        onViewPublicationDetails={(item) => setViewingDetailsItem(item)}
      />

      {/* 4. Production-Ready Publication Settings Modal */}
      {publishingItem && (
        <DirectPublishModal
          item={publishingItem}
          onClose={() => setPublishingItem(null)}
          onSuccess={() => handlePublishSuccess(publishingItem)}
        />
      )}

      {/* 5. Already Published Details Modal */}
      {viewingDetailsItem && (
        <PublicationDetailsModal
          item={viewingDetailsItem}
          onClose={() => setViewingDetailsItem(null)}
        />
      )}
    </div>
  );
}
