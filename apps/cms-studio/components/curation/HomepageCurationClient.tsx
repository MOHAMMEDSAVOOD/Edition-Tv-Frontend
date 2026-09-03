"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layers, Pin, Trash2, Plus, Star, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface SlotPlacement {
  id: string;
  articleId: string;
  articleHeadline?: string;
  slotType: string;
  displayOrder?: number;
  pinned?: boolean;
  createdBy?: string;
}

export default function HomepageCurationClient() {
  const [activeSlot, setActiveSlot] = useState<string>("HERO_LEAD");
  const [placements, setPlacements] = useState<SlotPlacement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newArticleId, setNewArticleId] = useState("");
  const [newHeadline, setNewHeadline] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; placementId: string; headline: string }>({
    open: false,
    placementId: "",
    headline: "",
  });

  const fetchPlacements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<any[]>(`/admin/curation/slots/${activeSlot}`).catch(() => []);
      const list = Array.isArray(data) ? data : [];
      setPlacements(list);
    } catch (err: any) {
      setError(err.message || `Failed to load curation placements for ${activeSlot}`);
    } finally {
      setLoading(false);
    }
  }, [activeSlot]);

  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticleId || !newHeadline) return;
    try {
      const payload = {
        articleId: newArticleId,
        articleHeadline: newHeadline,
        slotType: activeSlot,
        displayOrder: placements.length,
        pinned: false,
      };
      await apiClient.post("/admin/curation/slots", payload).catch(() => null);
      fetchPlacements();
      setNewArticleId("");
      setNewHeadline("");
    } catch (err: any) {
      alert("Failed to curate story placement: " + err.message);
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      await apiClient.post(`/admin/curation/slots/${id}/pin?pinned=${!currentPinned}`).catch(() => null);
      setPlacements((prev) => prev.map((p) => (p.id === id ? { ...p, pinned: !currentPinned } : p)));
    } catch (err: any) {
      alert("Failed to toggle pin: " + err.message);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await apiClient.delete(`/admin/curation/slots/${id}`).catch(() => null);
      setPlacements((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Failed to remove placement: " + err.message);
    }
  };

  const columns: ColumnDef<SlotPlacement>[] = [
    {
      id: "displayOrder",
      header: "Order",
      width: "80px",
      cell: (item) => (
        <span className="font-mono text-xs font-bold text-muted-foreground">
          #{ (item.displayOrder ?? 0) + 1 }
        </span>
      ),
    },
    {
      id: "headline",
      header: "Article Headline & ID",
      cell: (item) => (
        <div>
          <h4 className="font-bold text-foreground text-xs">{item.articleHeadline || item.articleId}</h4>
          <span className="text-[11px] font-mono text-muted-foreground">ID: {item.articleId} | Curated by {item.createdBy || "Managing Editor"}</span>
        </div>
      ),
    },
    {
      id: "pinned",
      header: "Pinned",
      cell: (item) => (
        item.pinned ? (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
            <Pin className="h-3 w-3" /> PINNED
          </span>
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground">Standard</span>
        )
      ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (item) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleTogglePin(item.id, !!item.pinned)}
            className={`p-1.5 rounded-lg border transition ${
              item.pinned
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle Pin"
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setConfirmDelete({
                open: true,
                placementId: item.id,
                headline: item.articleHeadline || item.articleId,
              });
            }}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
            title="Remove from Slot"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span className="font-semibold text-foreground font-sans">Publishing</span>
            <span>/</span>
            <span className="text-indigo-400 font-bold">Front-Page Curation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Homepage Curation Control Room
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              <Layers className="h-3 w-3" /> SLOT PLACEMENT
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pin hero lead stories, secondary grid cards, breaking news banners, and editor&apos;s picks across the public web.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={fetchPlacements}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold border border-border bg-card hover:bg-muted rounded-lg transition shadow-xs text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Slots
          </button>
        </div>
      </div>

      {/* Slot Tabs */}
      <div className="flex border-b border-border space-x-2 overflow-x-auto font-mono text-xs font-bold">
        {[
          { id: "HERO_LEAD", label: "Hero Lead Story" },
          { id: "SECONDARY_GRID", label: "Secondary Grid" },
          { id: "BREAKING_BANNER", label: "Breaking Banner" },
          { id: "EDITORS_PICKS", label: "Editor's Picks" },
          { id: "TRENDING_SIDEBAR", label: "Trending Sidebar" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSlot(tab.id)}
            className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeSlot === tab.id
                ? "border-indigo-500 text-indigo-400 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curate Form */}
        <div className="p-5 border border-border rounded-xl bg-card space-y-4 shadow-xs h-fit font-sans">
          <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-400" /> Curate Story to {activeSlot.replace("_", " ")}
          </h2>
          <form onSubmit={handleAssign} className="space-y-3 text-xs">
            <div>
              <label className="block font-mono font-bold text-[10px] uppercase text-muted-foreground mb-1">Article ID</label>
              <input
                type="text"
                required
                placeholder="e.g. art-101"
                value={newArticleId}
                onChange={(e) => setNewArticleId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-[10px] uppercase text-muted-foreground mb-1">Display Headline</label>
              <input
                type="text"
                required
                placeholder="Headline preview..."
                value={newHeadline}
                onChange={(e) => setNewHeadline(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background font-sans focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition shadow-xs font-mono"
            >
              Curate Story Placement
            </button>
          </form>
        </div>

        {/* Curated DataTable */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Curated Placements ({placements.length})
          </h2>

          <DataTable<SlotPlacement>
            columns={columns}
            data={placements}
            loading={loading}
            error={error}
            emptyTitle="No Stories Curated"
            emptyDescription={`Add an article ID to curate ${activeSlot.replace("_", " ")}.`}
            searchPlaceholder="Filter slot placements..."
            onRetry={fetchPlacements}
            pageSize={8}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete((prev) => ({ ...prev, open: false }))}
        onConfirm={() => handleRemove(confirmDelete.placementId)}
        title="Remove Curation Placement"
        description={`Are you sure you want to remove "${confirmDelete.headline}" from ${activeSlot}?`}
        confirmText="Remove Placement"
      />
    </div>
  );
}
