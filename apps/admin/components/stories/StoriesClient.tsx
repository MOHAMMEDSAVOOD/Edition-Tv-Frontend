"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Globe,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

interface ArticleStats {
  total: number;
  draft: number;
  inReview: number;
  approved: number;
  scheduled: number;
  published: number;
  publishedToWeb: number;
  archived: number;
}

interface StoryItem {
  id: string;
  headline: string;
  slug: string;
  summary: string | null;
  status: string;
  primaryAuthorId: string;
  publishedAt: string | null;
  updatedAt: string | null;
  createdAt: string | null;
  category: string | null;
  featuredImageUrl: string | null;
  isFeatured: boolean | null;
  isPublishedToWeb: boolean | null;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface PageData {
  content: StoryItem[];
  totalElements: number;
  totalPages: number;
  number: number;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
  SUBMITTED_FOR_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  IN_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  EDITOR_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  FACT_CHECK: "bg-orange-50 text-orange-700 border-orange-200",
  FACT_CHECK_PENDING: "bg-orange-50 text-orange-700 border-orange-200",
  COPY_EDIT: "bg-orange-50 text-orange-700 border-orange-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  UPDATED: "bg-teal-50 text-teal-700 border-teal-200",
  RETRACTED: "bg-rose-50 text-rose-700 border-rose-200",
  ARCHIVED: "bg-slate-100 text-slate-500 border-slate-200",
};

export function StoriesClient() {
  const router = useRouter();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 20;

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null;
    setAuthToken(stored);
    apiClient.setAccessToken(stored);
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    apiClient.get<CategoryItem[]>('/cms/categories')
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Fetch article stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await apiClient.get<ArticleStats>('/articles/stats');
      if (statsData) setStats(statsData);
    } catch {}
  }, []);

  // Fetch stories list
  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const data = await apiClient.get<PageData>(`/articles?${params.toString()}`);
      if (data) {
        setStories(Array.isArray(data.content) ? data.content : []);
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? 0);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Authorization headers are automatically handled by apiClient

  const handlePublish = async (story: StoryItem) => {
    if (!authToken) return alert("Login required to publish.");
    setActionLoading(story.id);
    try {
      // Transition status chain if needed
      const currentStatus = story.status;
      const publishChain: string[] = [];
      if (currentStatus === "DRAFT") publishChain.push("SUBMITTED_FOR_REVIEW", "APPROVED", "PUBLISHED");
      else if (currentStatus === "SUBMITTED_FOR_REVIEW" || currentStatus === "IN_REVIEW" || currentStatus === "EDITOR_REVIEW") publishChain.push("APPROVED", "PUBLISHED");
      else if (currentStatus === "FACT_CHECK" || currentStatus === "FACT_CHECK_PENDING" || currentStatus === "COPY_EDIT") publishChain.push("APPROVED", "PUBLISHED");
      else if (currentStatus === "APPROVED") publishChain.push("PUBLISHED");
      else if (currentStatus === "SCHEDULED") publishChain.push("PUBLISHED");

      for (const targetStatus of publishChain) {
        await apiClient.post(`/articles/${story.id}/status?targetStatus=${targetStatus}`);
      }

      // Mark as published to web
      await apiClient.get(`/newsroom/wire-items`);

      await fetchStories();
      await fetchStats();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (story: StoryItem) => {
    if (!authToken) return alert("Login required to unpublish.");
    if (!confirm(`Unpublish "${story.headline}" and revert to DRAFT?`)) return;
    setActionLoading(story.id);
    try {
      await apiClient.post(`/articles/${story.id}/status?targetStatus=DRAFT`);
      setStories((prev) => prev.map((s) => (s.id === story.id ? { ...s, status: "DRAFT", isPublishedToWeb: false } : s)));
      await fetchStories();
      await fetchStats();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Unpublish failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (story: StoryItem) => {
    if (!authToken) return alert("Login required.");
    if (!confirm(`Archive "${story.headline}"?`)) return;
    setActionLoading(story.id);
    try {
      await apiClient.post(`/articles/${story.id}/status?targetStatus=ARCHIVED`);
      await fetchStories();
      await fetchStats();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Archive failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (story: StoryItem) => {
    if (!authToken) return alert("Login required.");
    if (!confirm(`Permanently delete "${story.headline}"? This cannot be undone.`)) return;
    setActionLoading(story.id);
    try {
      await apiClient.delete(`/articles/${story.id}`);
      setStories((prev) => prev.filter((s) => s.id !== story.id));
      setTotalElements((prev) => Math.max(0, prev - 1));
      await fetchStories();
      await fetchStats();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const fmt = (isoStr: string | null) => {
    if (!isoStr) return "—";
    try { return new Date(isoStr).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }); }
    catch { return isoStr; }
  };

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 font-sans">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 font-heading">
            <FileText className="h-6 w-6 text-red-600" />
            Editorial Stories Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {totalElements > 0 ? `${totalElements} stories total` : "Create and manage editorial content"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { fetchStories(); fetchStats(); }}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-semibold text-xs"
          >
            <RefreshCw className="h-4 w-4 mr-1 text-red-600" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/stories/new")}
            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-2xs text-xs font-sans"
          >
            <Plus className="h-4 w-4 mr-1" /> New Story
          </Button>
        </div>
      </div>

      {/* Stats Overview Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Total", value: stats.total, icon: FileText, color: "text-slate-700" },
            { label: "Drafts", value: stats.draft, icon: Edit2, color: "text-amber-600" },
            { label: "In Review", value: stats.inReview, icon: Clock, color: "text-amber-600" },
            { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-emerald-600" },
            { label: "Scheduled", value: stats.scheduled, icon: Clock, color: "text-blue-600" },
            { label: "Published", value: stats.published, icon: Globe, color: "text-emerald-600" },
            { label: "On Web", value: stats.publishedToWeb, icon: Eye, color: "text-teal-600" },
            { label: "Archived", value: stats.archived, icon: Archive, color: "text-slate-400" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center shadow-2xs">
                <Icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                <div className={`text-xl font-extrabold font-heading ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wide font-semibold">{stat.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search headlines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-sans"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
        >
          <option value="">All Statuses</option>
          {["IDEA","ASSIGNED","DRAFT","SUBMITTED_FOR_REVIEW","EDITOR_REVIEW","IN_REVIEW","FACT_CHECK","COPY_EDIT","APPROVED","SCHEDULED","PUBLISHED","UPDATED","RETRACTED","ARCHIVED"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        {(statusFilter || categoryFilter || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStatusFilter(""); setCategoryFilter(""); setSearchQuery(""); }}
            className="text-slate-500 hover:text-slate-900 text-xs"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-xs font-medium font-mono">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-4 w-1/3 bg-slate-200 rounded-lg" />
                <div className="h-4 w-20 bg-slate-200 rounded-full" />
                <div className="h-4 w-24 bg-slate-200 rounded-full" />
                <div className="h-4 w-16 bg-slate-200 rounded-lg ml-auto" />
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 font-mono text-xs">
            <FileText className="h-10 w-10 mb-3 opacity-30 text-slate-400" />
            <p className="text-sm font-bold text-slate-700">No stories found</p>
            <p className="text-xs mt-1 text-slate-400">
              {statusFilter || categoryFilter || debouncedSearch ? "Try adjusting your filters" : "Create your first story"}
            </p>
            {!statusFilter && !categoryFilter && !debouncedSearch && (
              <Button size="sm" onClick={() => router.push("/stories/new")} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-2xs text-xs">
                <Plus className="h-4 w-4 mr-1" /> New Story
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 font-mono font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="text-left px-4 py-3.5">Headline</th>
                  <th className="text-left px-4 py-3.5">Status</th>
                  <th className="text-left px-4 py-3.5">Category</th>
                  <th className="text-left px-4 py-3.5">Author</th>
                  <th className="text-left px-4 py-3.5">Updated</th>
                  <th className="text-right px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stories.map((story) => (
                  <tr key={story.id} className="hover:bg-slate-50/60 transition group">
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex items-start gap-2">
                        {story.isFeatured && <Star className="h-3 w-3 text-amber-500 fill-amber-500 mt-0.5 flex-none" />}
                        {story.isPublishedToWeb && <Globe className="h-3 w-3 text-emerald-600 mt-0.5 flex-none" />}
                        <div>
                          <p className="text-slate-900 font-bold text-xs leading-snug line-clamp-2 group-hover:text-red-600 transition cursor-pointer font-serif"
                             onClick={() => router.push(`/stories/${story.id}/edit`)}>
                            {story.headline}
                          </p>
                          <p className="text-slate-400 text-[11px] font-mono mt-0.5">/articles/{story.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${STATUS_COLORS[story.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {story.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs font-semibold">
                      {story.category || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs font-mono truncate max-w-[120px]">
                      {story.primaryAuthorId}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs font-mono whitespace-nowrap">
                      {fmt(story.updatedAt || story.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/stories/${story.id}/edit`)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        {story.status === "PUBLISHED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnpublish(story)}
                            disabled={actionLoading === story.id}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-xl"
                            title="Unpublish (Revert to Draft)"
                          >
                            <FileText className="h-3.5 w-3.5 text-amber-600" />
                          </Button>
                        )}
                        {story.status !== "PUBLISHED" && story.status !== "ARCHIVED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublish(story)}
                            disabled={actionLoading === story.id}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-xl"
                            title="Publish"
                          >
                            {actionLoading === story.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                            ) : (
                              <Globe className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                        {story.status !== "ARCHIVED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(story)}
                            disabled={actionLoading === story.id}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-xl"
                            title="Archive"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(story)}
                          disabled={actionLoading === story.id}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 font-mono">
            <span className="text-xs text-slate-500">
              Page {page + 1} of {totalPages} · {totalElements} total
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-7 px-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-7 px-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
