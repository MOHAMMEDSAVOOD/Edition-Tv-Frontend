"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";
import {
  Rss,
  Plus,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Search,
  Layers,
  Upload,
  Download,
  Tag,
  Zap,
  BarChart3,
  Database,
  Bookmark,
  ExternalLink,
  FileCode,
  Clock,
  PieChart,
} from "lucide-react";

interface NewsFeed {
  id: string;
  sourceId: string;
  feedUrl: string;
  feedType: string;
  healthStatus: string;
  consecutiveFailures: number;
  lastFetchAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastErrorMessage: string | null;
  lastHttpStatus: number | null;
  lastLatencyMs: number | null;
}

interface NewsSource {
  id: string;
  name: string;
  description: string;
  sourceType: string;
  baseUrl: string;
  category: string;
  active: boolean;
  paused: boolean;
  createdAt: string;
  feeds: NewsFeed[];
}

interface IngestionRun {
  id: string;
  feedId: string;
  runType: string;
  httpStatus: number;
  itemsFetched: number;
  itemsInserted: number;
  itemsDeduped: number;
  durationMs: number;
  etagMatched: boolean;
  errorMessage: string | null;
  executedAt: string;
}

interface TestFeedResult {
  valid: boolean;
  httpStatus?: number;
  latencyMs?: number;
  feedType?: string;
  title?: string;
  description?: string;
  itemCount?: number;
  errorMessage?: string;
  sampleItems?: Array<{ id: string; title: string; canonicalUrl: string }>;
}

export function NewsSourcesClient() {
  const [activeTab, setActiveTab] = useState<"sources" | "subscriptions" | "labels" | "importexport" | "statistics">("sources");

  const [sources, setSources] = useState<NewsSource[]>([]);
  const [runs, setRuns] = useState<IngestionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testFeedUrl, setTestFeedUrl] = useState("");
  const [testResult, setTestResult] = useState<TestFeedResult | null>(null);
  const [testing, setTesting] = useState(false);

  // Categories, OPML, Labels & Stats State
  const [categories, setCategories] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [labels, setLabels] = useState<Array<{ id: string; name: string; color: string; count: number }>>([]);
  const [dynamicOpmlList, setDynamicOpmlList] = useState<Array<{ id: string; categoryName: string; opmlUrl: string; lastSyncedAt: string; status: string }>>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [statsData, setStatsData] = useState<any>(null);

  // Forms
  const [formData, setFormData] = useState({ name: "", description: "", baseUrl: "", category: "General" });
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newOpmlCategory, setNewOpmlCategory] = useState("");
  const [newOpmlUrl, setNewOpmlUrl] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [opmlXmlInput, setOpmlXmlInput] = useState("");
  const [importMessage, setImportMessage] = useState("");

  const fetchSourcesAndRuns = async () => {
    setLoading(true);
    try {
      const [dataSources, dataRuns, dataCats, dataLabels, dataOpml, dataStats] = await Promise.all([
        apiClient.get<unknown>("/admin/news-sources").catch(() => []),
        apiClient.get<unknown>("/admin/news-sources/runs/recent").catch(() => []),
        apiClient.get<unknown>("/admin/news-sources/categories").catch(() => []),
        apiClient.get<unknown>("/admin/news-sources/labels").catch(() => []),
        apiClient.get<unknown>("/admin/news-sources/opml/dynamic").catch(() => []),
        apiClient.get<unknown>("/admin/news-sources/statistics").catch(() => null),
      ]);

      const toArray = (val: unknown): unknown[] => {
        if (Array.isArray(val)) return val;
        if (val && typeof val === "object") {
          const obj = val as Record<string, unknown>;
          if (Array.isArray(obj.content)) return obj.content;
          if (Array.isArray(obj.data)) return obj.data;
          if (Array.isArray(obj.sources)) return obj.sources;
          if (Array.isArray(obj.items)) return obj.items;
        }
        return [];
      };

      setSources(toArray(dataSources) as NewsSource[]);
      setRuns(toArray(dataRuns) as IngestionRun[]);
      setCategories(toArray(dataCats) as Array<{ id: string; name: string; description: string }>);
      setLabels(toArray(dataLabels) as Array<{ id: string; name: string; color: string; count: number }>);
      setDynamicOpmlList(toArray(dataOpml) as Array<{ id: string; categoryName: string; opmlUrl: string; lastSyncedAt: string; status: string }>);
      if (dataStats) setStatsData(dataStats);
    } catch (e: unknown) {
      console.error("Failed to fetch news sources data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSourcesAndRuns();
  }, []);

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description || formData.name,
        baseUrl: formData.baseUrl,
        feedUrl: formData.baseUrl,
        url: formData.baseUrl,
        sourceType: "RSS",
        category: formData.category || "General News",
        active: true,
        paused: false,
      };

      const created = await apiClient.post<NewsSource>("/admin/news-sources", payload);
      setIsAddModalOpen(false);
      setFormData({ name: "", description: "", baseUrl: "", category: "General News" });
      setTestResult(null);

      if (created && created.id) {
        setSources((prev) => [created, ...prev]);
      }
      await fetchSourcesAndRuns();
    } catch (e: unknown) {
      console.error("Failed to create source:", e);
      const err = e as { message?: string };
      alert(`Failed to add news source: ${err?.message || "Unknown error"}`);
    }
  };

  const handleToggleSourceActive = async (source: NewsSource) => {
    try {
      const updated = await apiClient.put<NewsSource>(`/admin/news-sources/${source.id}`, {
        ...source,
        active: !source.active,
      });
      if (updated) {
        setSources((prev) => prev.map((s) => (s.id === source.id ? updated : s)));
      }
    } catch (e: unknown) {
      console.error("Failed to toggle source state:", e);
    }
  };

  const handleTriggerFetch = async (sourceId: string) => {
    try {
      await apiClient.post(`/admin/news-sources/${sourceId}/trigger-fetch`);
      fetchSourcesAndRuns();
    } catch (e: unknown) {
      console.error("Failed to trigger fetch:", e);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm("Are you sure you want to delete this news source?")) return;
    try {
      await apiClient.delete(`/admin/news-sources/${sourceId}`);
      fetchSourcesAndRuns();
    } catch (e: unknown) {
      console.error("Failed to delete source:", e);
    }
  };

  const handleTestFeed = async () => {
    if (!testFeedUrl) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiClient.post<TestFeedResult>(`/admin/news-sources/test-feed?feedUrl=${encodeURIComponent(testFeedUrl)}`);
      setTestResult(res);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setTestResult({ valid: false, errorMessage: err?.message || "Failed to connect to backend test-feed endpoint" });
    } finally {
      setTesting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await apiClient.post("/admin/news-sources/categories", { name: newCatName, description: newCatDesc });
      setNewCatName("");
      setNewCatDesc("");
      fetchSourcesAndRuns();
    } catch (e: unknown) {
      console.error("Failed to add category:", e);
    }
  };

  const handleAddDynamicOpml = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpmlUrl) return;
    try {
      await apiClient.post("/admin/news-sources/opml/dynamic", { categoryName: newOpmlCategory || "Dynamic Imports", opmlUrl: newOpmlUrl });
      setNewOpmlCategory("");
      setNewOpmlUrl("");
      fetchSourcesAndRuns();
    } catch (e: unknown) {
      console.error("Failed to add dynamic OPML:", e);
    }
  };

  const handleAddLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName) return;
    try {
      await apiClient.post("/admin/news-sources/labels", { name: newLabelName });
      setNewLabelName("");
      fetchSourcesAndRuns();
    } catch (e: unknown) {
      console.error("Failed to add label:", e);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    try {
      await apiClient.delete(`/admin/news-sources/labels/${id}`);
      fetchSourcesAndRuns();
    } catch (e: unknown) {
      console.error("Failed to delete label:", e);
    }
  };

  const handleImportOpml = async () => {
    if (!opmlXmlInput) return;
    try {
      const result = await apiClient.post<{ sourcesCreated?: number; feedsCreated?: number }>("/admin/news-sources/opml/import", opmlXmlInput, {
        headers: { "Content-Type": "application/xml" },
      });
      setImportMessage(`Successfully imported ${result?.sourcesCreated || 1} sources and ${result?.feedsCreated || 1} feeds.`);
      setOpmlXmlInput("");
      fetchSourcesAndRuns();
    } catch (e) {
      setImportMessage("Failed to import OPML content.");
    }
  };

  const handleExportOpml = async () => {
    try {
      const token = apiClient.getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const res = await fetch(`${baseUrl}/admin/news-sources/opml/export`, { headers });
      if (res.ok) {
        const xmlText = await res.text();
        const blob = new Blob([xmlText], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "edition_tv_sources.opml";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Failed to export OPML:", e);
    }
  };

  const handleDownloadDatabase = async () => {
    try {
      const token = apiClient.getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const res = await fetch(`${baseUrl}/admin/news-sources/db/export`, { headers });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "db.sqlite";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Failed to download database:", e);
    }
  };

  const filteredSources = sources.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.baseUrl && s.baseUrl.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 font-heading">
            <Rss className="w-6 h-6 text-red-600" />
            News Sources & Wire Ingestion Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            FreshRSS Forensic Parity: Dynamic OPML, Label Management, Database Backup & Ingestion Analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportOpml()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export OPML
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition font-sans"
          >
            <Plus className="w-4 h-4" />
            Add News Source
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("sources")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "sources" ? "bg-red-600 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Rss className="w-4 h-4" />
          Feeds & Sources ({sources.length})
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "subscriptions" ? "bg-red-600 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          Subscription Management
        </button>
        <button
          onClick={() => setActiveTab("labels")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "labels" ? "bg-red-600 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Tag className="w-4 h-4" />
          Label Management ({labels.length})
        </button>
        <button
          onClick={() => setActiveTab("importexport")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "importexport" ? "bg-red-600 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Upload className="w-4 h-4" />
          Import / Export & Backup
        </button>
        <button
          onClick={() => setActiveTab("statistics")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "statistics" ? "bg-red-600 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Main Statistics
        </button>
      </div>

      {/* TAB 1: FEEDS & SOURCES */}
      {activeTab === "sources" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Total Feed Sources</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1 font-serif">{sources.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-red-600 border border-red-100">
                <Rss className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Active Polling Feeds</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1 font-serif">
                  {sources.filter((s) => s.active && !s.paused).length}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Paused Feeds</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-1 font-serif">
                  {sources.filter((s) => s.paused).length}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                <Pause className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Failed Poll Runs</p>
                <p className="text-2xl font-extrabold text-rose-600 mt-1 font-serif">
                  {runs.filter((r) => r.httpStatus >= 400).length}
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search and Refresh Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search feeds by name or url..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
              />
            </div>
            <button
              onClick={() => fetchSourcesAndRuns()}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
              Refresh Engine
            </button>
          </div>

          {/* Sources List Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] uppercase text-slate-500 border-b border-slate-200 font-mono font-bold">
                <tr>
                  <th className="px-6 py-4">News Source</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Feeds & Health</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 w-36 bg-slate-200 rounded-full mb-1.5" />
                        <div className="h-3 w-48 bg-slate-200 rounded-full" />
                      </td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-200 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-slate-200 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredSources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-mono">
                      No news feed sources registered. Click &quot;Add News Source&quot; to configure an RSS feed.
                    </td>
                  </tr>
                ) : (
                  filteredSources.map((source) => (
                    <tr key={source.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{source.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs font-mono">{source.baseUrl || "No URL specified"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200 font-mono font-bold">
                          {source.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 font-bold">
                            {source.feeds ? source.feeds.length : 0} feeds
                          </span>
                          {source.feeds && source.feeds.some((f) => f.consecutiveFailures > 0) && (
                            <span className="flex items-center gap-1 text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              Degraded
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {source.paused ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 flex items-center w-max gap-1.5 font-mono">
                            <Pause className="w-3 h-3" /> Paused
                          </span>
                        ) : source.active ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center w-max gap-1.5 font-mono">
                            <Activity className="w-3 h-3 animate-pulse" /> Active Polling
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full border border-slate-200 font-mono">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTriggerFetch(source.id)}
                            title="Trigger Manual Fetch"
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-xl transition"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleSourceActive(source)}
                            title={source.paused ? "Resume Ingestion" : "Pause Ingestion"}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition"
                          >
                            {source.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteSource(source.id)}
                            title="Delete News Source"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION MANAGEMENT */}
      {activeTab === "subscriptions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Category Form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-heading">
              <Layers className="w-5 h-5 text-red-600" />
              Add Feed Category
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Investigative Journalism"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Description</label>
                <input
                  type="text"
                  placeholder="Optional scope description..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition font-sans"
              >
                <Plus className="w-4 h-4" /> Save Category
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs uppercase font-bold text-slate-400 mb-2 font-mono">Existing Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span key={c.id} className="px-3 py-1 bg-slate-100 text-xs font-bold text-slate-700 rounded-full border border-slate-200 font-mono">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic OPML ⚡ Form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-heading">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              Add Dynamic OPML ⚡
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Provide the URL to a remote OPML file to dynamically populate categories with auto-updating feeds.
            </p>
            <form onSubmit={handleAddDynamicOpml} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">OPML Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. World Tech News Wire"
                  value={newOpmlCategory}
                  onChange={(e) => setNewOpmlCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Remote OPML Feed URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/feeds.opml"
                  value={newOpmlUrl}
                  onChange={(e) => setNewOpmlUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition font-sans"
              >
                <Zap className="w-4 h-4" /> Add Dynamic OPML
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs uppercase font-bold text-slate-400 mb-2 font-mono">Registered Dynamic OPML Sources</h3>
              {dynamicOpmlList.length === 0 ? (
                <p className="text-xs text-slate-400 italic font-mono">No dynamic OPML subscriptions configured.</p>
              ) : (
                <div className="space-y-2">
                  {dynamicOpmlList.map((d) => (
                    <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-amber-700 font-mono">{d.categoryName}</span>
                        <p className="text-slate-500 truncate max-w-xs font-mono text-[11px]">{d.opmlUrl}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-mono font-bold text-[10px]">{d.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subscription Tools & Bookmarklet Widget */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 lg:col-span-2 shadow-2xs">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-heading">
              <Bookmark className="w-5 h-5 text-red-600" />
              Subscription Tools & Bookmarklet Widget
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 font-heading">
                  <ExternalLink className="w-4 h-4 text-red-600" />
                  1-Click Web Bookmarklet
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Drag this button to your browser bookmarks bar or right-click to bookmark. Click it on any web page to immediately subscribe in Edition TV News Reader.
                </p>
                <a
                  href="javascript:(function(){var u=encodeURIComponent(window.location.href);window.open('https://admin.editiontv.com/news-reader?add_url='+u);})();"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-grab transition font-sans"
                >
                  <Plus className="w-4 h-4" /> Subscribe in Edition TV
                </a>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 font-heading">
                  <FileCode className="w-4 h-4 text-red-600" />
                  External Integration API Endpoint
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Use this REST endpoint URL within external newsroom tools to trigger instant feed registration.
                </p>
                <code className="block p-3 bg-white rounded-xl text-xs font-mono text-red-600 border border-slate-200 break-all font-bold">
                  https://api.editiontv.com/api/v1/newsroom/wire-items/bookmarklet?url=%s
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LABEL MANAGEMENT */}
      {activeTab === "labels" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-heading">
              <Tag className="w-5 h-5 text-red-600" />
              Label & Hashtag Management
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Create custom editorial labels (#tags) to organize wire items across desks and reader views.
            </p>
          </div>

          <form onSubmit={handleAddLabel} className="flex items-center gap-3">
            <input
              type="text"
              placeholder="e.g. #breaking"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 w-64 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition font-sans"
            >
              <Plus className="w-4 h-4" /> Add Label
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            {labels.map((l) => (
              <div key={l.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="font-bold text-slate-900 text-xs font-mono">{l.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">{l.count || 0} articles</span>
                  <button onClick={() => handleDeleteLabel(l.id)} className="text-slate-400 hover:text-rose-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: IMPORT / EXPORT & DATABASE */}
      {activeTab === "importexport" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OPML Import */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-heading">
              <Upload className="w-5 h-5 text-red-600" />
              Import Feeds (OPML / XML)
            </h2>
            <textarea
              rows={8}
              placeholder="Paste OPML XML content here..."
              value={opmlXmlInput}
              onChange={(e) => setOpmlXmlInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-red-500"
            />
            <button
              onClick={handleImportOpml}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition font-sans"
            >
              <Upload className="w-4 h-4" /> Import OPML File
            </button>
            {importMessage && <p className="text-xs text-emerald-700 font-bold font-mono">{importMessage}</p>}
          </div>

          {/* Export & Database Backup */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-2xs">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-heading">
                <Download className="w-5 h-5 text-red-600" />
                Export & System Backups
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-mono">Export standard OPML feeds or download a full SQLite database snapshot.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 font-heading">Export List of Feeds (OPML)</p>
                  <p className="text-[11px] text-slate-500 font-mono">Standard XML format compatible with FreshRSS / Feedly</p>
                </div>
                <button
                  onClick={handleExportOpml}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 font-heading">Download User Database (db.sqlite)</p>
                  <p className="text-[11px] text-slate-500 font-mono">FreshRSS Parity: SQLite database snapshot download</p>
                </div>
                <button
                  onClick={handleDownloadDatabase}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Database className="w-3.5 h-3.5" /> Download SQLite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MAIN STATISTICS */}
      {activeTab === "statistics" && (
        <div className="space-y-6">
          {/* Entries Repartition Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-heading">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Articles & Entries Repartition
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-[11px] uppercase text-slate-500 border-b border-slate-200 font-mono font-bold">
                  <tr>
                    <th className="px-4 py-3">Stream</th>
                    <th className="px-4 py-3">Total Articles</th>
                    <th className="px-4 py-3">Read</th>
                    <th className="px-4 py-3">Unread</th>
                    <th className="px-4 py-3">Favourites (Starred)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  <tr>
                    <td className="px-4 py-3 font-sans font-bold text-slate-900">Main Stream</td>
                    <td className="px-4 py-3 font-bold">{statsData?.repartition?.mainStream?.total || 0}</td>
                    <td className="px-4 py-3 text-emerald-700 font-bold">{statsData?.repartition?.mainStream?.read || 0}</td>
                    <td className="px-4 py-3 text-amber-700 font-bold">{statsData?.repartition?.mainStream?.unread || 0}</td>
                    <td className="px-4 py-3 text-amber-600 font-bold">{statsData?.repartition?.mainStream?.favourites || 0}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-sans font-bold text-slate-900">All Feeds Combined</td>
                    <td className="px-4 py-3 font-bold">{statsData?.repartition?.allFeeds?.total || 0}</td>
                    <td className="px-4 py-3 text-emerald-700 font-bold">{statsData?.repartition?.allFeeds?.read || 0}</td>
                    <td className="px-4 py-3 text-amber-700 font-bold">{statsData?.repartition?.allFeeds?.unread || 0}</td>
                    <td className="px-4 py-3 text-amber-600 font-bold">{statsData?.repartition?.allFeeds?.favourites || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Feeds & Idle Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-heading">
                <PieChart className="w-4 h-4 text-red-600" /> Top Feeds Contribution
              </h3>
              <div className="space-y-2 text-xs">
                {(statsData?.topFeeds as Array<Record<string, unknown>>)?.length > 0 ? (
                  (statsData?.topFeeds as Array<Record<string, unknown>>).map((tf) => (
                    <div key={String(tf.id)} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{String(tf.name)}</span>
                        <p className="text-slate-500 font-mono text-[11px]">{String(tf.category)}</p>
                      </div>
                      <span className="font-mono text-red-600 font-bold">{String(tf.entryCount)} entries ({String(tf.percentageOfTotal)})</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic font-mono">No feed activity recorded yet.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-heading">
                <Clock className="w-4 h-4 text-amber-600" /> Idle Feeds (No New Articles)
              </h3>
              <div className="space-y-2 text-xs">
                {(statsData?.idleFeeds as Array<Record<string, unknown>>)?.length > 0 ? (
                  (statsData?.idleFeeds as Array<Record<string, unknown>>).map((idf) => (
                    <div key={String(idf.id)} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700 font-mono truncate max-w-xs">{String(idf.feedUrl)}</span>
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full font-bold font-mono text-[10px] border border-rose-200">{String(idf.consecutiveFailures)} failures</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic font-mono">All feeds are actively polling and healthy.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add News Source Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-heading">
              <Rss className="w-5 h-5 text-red-600" />
              Register External News Feed Source
            </h2>

            <form onSubmit={handleCreateSource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reuters Top News"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Feed RSS / Atom URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://www.ndtv.com/rss"
                    value={formData.baseUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, baseUrl: e.target.value });
                      setTestFeedUrl(e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestFeed}
                    disabled={testing}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 transition"
                  >
                    {testing ? "Testing..." : "Test"}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`p-3.5 rounded-xl text-xs ${testResult.valid ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                  {testResult.valid ? (
                    <div className="space-y-2 font-mono">
                      <p className="font-bold text-emerald-700">✓ Valid {testResult.feedType} Feed Found</p>
                      <p className="text-[11px] text-slate-600">{testResult.title} ({testResult.itemCount} items fetched)</p>
                      {testResult.sampleItems && testResult.sampleItems.length > 0 && (
                        <div className="pt-2 border-t border-emerald-200 space-y-1">
                          <p className="text-[10px] uppercase font-bold text-emerald-700">Preview Headlines:</p>
                          {testResult.sampleItems.slice(0, 3).map((item, idx: number) => (
                            <p key={idx} className="text-[11px] truncate text-slate-700">• {item.title}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="font-bold text-rose-700 font-mono">✕ Feed Test Failed: {testResult.errorMessage}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                >
                  <option value="General News">General News</option>
                  <option value="Technology">Technology</option>
                  <option value="Business & Markets">Business & Markets</option>
                  <option value="World News">World News</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional description or coverage scope notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-2xs transition font-sans"
                >
                  Save News Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
