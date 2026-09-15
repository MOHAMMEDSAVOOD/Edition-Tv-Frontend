"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import {
  FileText,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface StorySummary {
  id: string;
  headline: string;
  category: string;
  status: string;
  createdAt: string | null;
}

interface WireSummary {
  id: string;
  source: string;
  title: string;
  receivedAt: string | null;
}

interface DashboardStats {
  totalStories: number | null;
  totalCategories: number | null;
  mediaFiles: number | null;
  pendingReviews: number | null;
}

interface PipelineStats {
  draft: number;
  inReview: number;
  approved: number;
  scheduled: number;
  published: number;
  archived: number;
}

const EMPTY_STATS: DashboardStats = {
  totalStories: null,
  totalCategories: null,
  mediaFiles: null,
  pendingReviews: null,
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function countOf(value: unknown): number | null {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") {
    const page = value as { totalElements?: number; content?: unknown[] };
    if (typeof page.totalElements === "number") return page.totalElements;
    if (Array.isArray(page.content)) return page.content.length;
  }
  return null;
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${accent}`}>{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline">
        <span className="text-2xl font-extrabold text-slate-900 font-serif">
          {value === null ? "—" : value.toLocaleString("en-GB")}
        </span>
      </div>
    </div>
  );
}

export function AdminDashboardClient() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [wireItems, setWireItems] = useState<WireSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [pipeline, setPipeline] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [articleStats, categories, media, latest, wire] = await Promise.allSettled([
      apiClient.get<Record<string, number>>("/articles/stats"),
      apiClient.get<unknown>("/cms/categories"),
      apiClient.get<unknown>("/media"),
      apiClient.get<Record<string, unknown>>("/articles?size=6"),
      apiClient.get<Record<string, unknown>>("/newsroom/wire-items/reader?page=0&size=4"),
    ]);

    const next: DashboardStats = { ...EMPTY_STATS };

    if (articleStats.status === "fulfilled" && articleStats.value) {
      const s = articleStats.value;
      next.totalStories = typeof s.total === "number" ? s.total : null;
      next.pendingReviews = typeof s.inReview === "number" ? s.inReview : null;
      setPipeline({
        draft: s.draft ?? 0,
        inReview: s.inReview ?? 0,
        approved: s.approved ?? 0,
        scheduled: s.scheduled ?? 0,
        published: s.published ?? 0,
        archived: s.archived ?? 0,
      });
    } else {
      setPipeline(null);
    }

    if (categories.status === "fulfilled") next.totalCategories = countOf(categories.value);
    if (media.status === "fulfilled") next.mediaFiles = countOf(media.value);

    setStats(next);

    if (latest.status === "fulfilled" && latest.value) {
      const content = Array.isArray(latest.value.content) ? latest.value.content : [];
      setStories(
        content.map(
          (art: {
            id?: string;
            headline?: string;
            title?: string;
            category?: string;
            status?: string;
            createdAt?: string;
          }) => ({
            id: art.id ?? "",
            headline: art.headline || art.title || "—",
            category: art.category || "—",
            status: art.status || "—",
            createdAt: art.createdAt ?? null,
          })
        )
      );
    } else {
      setStories([]);
    }

    if (wire.status === "fulfilled" && wire.value) {
      const content = Array.isArray(wire.value.content) ? wire.value.content : [];
      setWireItems(
        content.map(
          (item: {
            id?: string;
            sourceId?: string;
            feedId?: string;
            title?: string;
            pubDate?: string;
            createdAt?: string;
          }) => ({
            id: item.id ?? "",
            source: item.sourceId || item.feedId || "—",
            title: item.title || "—",
            receivedAt: item.pubDate ?? item.createdAt ?? null,
          })
        )
      );
    } else {
      setWireItems([]);
    }

    if (
      articleStats.status === "rejected" &&
      latest.status === "rejected" &&
      wire.status === "rejected"
    ) {
      setError("Failed to load dashboard data from the backend API.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const pipelineRows: { label: string; value: number }[] = pipeline
    ? [
        { label: "Draft", value: pipeline.draft },
        { label: "In Review", value: pipeline.inReview },
        { label: "Approved", value: pipeline.approved },
        { label: "Scheduled", value: pipeline.scheduled },
        { label: "Published", value: pipeline.published },
        { label: "Archived", value: pipeline.archived },
      ]
    : [];
  const pipelineMax = pipelineRows.reduce((max, r) => Math.max(max, r.value), 0);

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto font-sans pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-slate-900 font-serif">Newsroom Overview</h2>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition text-xs font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-red-600" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-medium">
          <AlertCircle className="h-4 w-4 flex-none text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Counts sourced from /articles/stats, /cms/categories and /media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Stories"
          value={stats.totalStories}
          accent="bg-red-50 text-red-600"
          icon={<FileText className="h-4.5 w-4.5" />}
        />
        <StatCard
          label="Total Categories"
          value={stats.totalCategories}
          accent="bg-blue-50 text-blue-600"
          icon={<Layers className="h-4.5 w-4.5" />}
        />
        <StatCard
          label="Media Assets"
          value={stats.mediaFiles}
          accent="bg-indigo-50 text-indigo-600"
          icon={<ImageIcon className="h-4.5 w-4.5" />}
        />
        <StatCard
          label="Awaiting Review"
          value={stats.pendingReviews}
          accent="bg-amber-50 text-amber-600"
          icon={<MessageSquare className="h-4.5 w-4.5" />}
        />
      </div>

      {/* Editorial pipeline breakdown */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
        <h3 className="text-base font-extrabold text-slate-900 font-serif">Editorial Pipeline</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Article counts by workflow status.</p>

        {pipelineRows.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-mono text-xs">
            {loading ? "Loading pipeline counts..." : "Pipeline counts unavailable."}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {pipelineRows.map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-semibold text-slate-600">{row.label}</span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all"
                    style={{ width: pipelineMax > 0 ? `${(row.value / pipelineMax) * 100}%` : "0%" }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-bold text-slate-900 font-mono">
                  {row.value.toLocaleString("en-GB")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Latest stories */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 font-serif">Latest Stories</h3>
            <Link href="/stories" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
              <span>View All{stats.totalStories !== null ? ` (${stats.totalStories})` : ""}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && stories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-mono">
                      Loading stories...
                    </td>
                  </tr>
                ) : stories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-mono">
                      No stories found.
                    </td>
                  </tr>
                ) : (
                  stories.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-bold text-slate-900 max-w-[200px] truncate">{s.headline}</td>
                      <td className="py-3 text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[10px]">{s.category}</span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200 font-mono">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400 font-mono">{formatDate(s.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent wire ingestions */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 font-serif">Recent Wire Ingestions</h3>
            <Link href="/news-reader" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
              <span>Open Reader</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Source</th>
                  <th className="pb-3 font-semibold">Headline</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && wireItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400 font-mono">
                      Loading wire items...
                    </td>
                  </tr>
                ) : wireItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400 font-mono">
                      No wire items ingested.
                    </td>
                  </tr>
                ) : (
                  wireItems.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-bold text-slate-900 max-w-[140px] truncate">{w.source}</td>
                      <td className="py-3 text-slate-600 max-w-[220px] truncate">{w.title}</td>
                      <td className="py-3 text-right text-slate-400 font-mono">{formatDate(w.receivedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
