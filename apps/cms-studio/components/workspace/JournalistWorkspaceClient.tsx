"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  Save,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  Search,
  Plus,
  AlertCircle,
  ImageIcon,
  History,
  Eye,
  FileText,
  Tag,
  MessageSquare,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Lock,
  User,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { authService } from "@/services/authService";
import { StoryBlockComposer, StoryBlock } from "./StoryBlockComposer";
import { MediaLibraryModal, MediaAsset } from "./MediaLibraryModal";
import { FactCheckPanel } from "./FactCheckPanel";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.editiontv.com/api/v1";

interface Article {
  id: string;
  slug?: string;
  headline?: string;
  title?: string;
  summary?: string;
  contentBody?: string;
  category?: string;
  primaryAuthorId?: string;
  byline?: string;
  desk?: string;
  tags?: string;
  priority?: string;
  status: string;
  featuredImageUrl?: string;
  photographerCredit?: string;
  imageCaption?: string;
  altText?: string;
  updatedAt?: string;
  createdAt?: string;
  isPublishedToWeb?: boolean;
}

interface RevisionItem {
  id: string;
  articleId: string;
  revisionNumber: number;
  authorId: string;
  headline: string;
  changeSummary: string;
  createdAt?: string;
}

interface NoteItem {
  id: string;
  authorId: string;
  commentText: string;
  createdAt?: string;
}

interface LockInfo {
  articleId: string;
  lockedByUserId: string;
  expiresAt: string;
}

interface UserItem {
  id: string;
  username: string;
  fullName: string;
}

export function JournalistWorkspaceClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [activeTab, setActiveTab] = useState<
    "METADATA" | "MEDIA" | "FACT_CHECK" | "NOTES" | "HISTORY" | "PUBLISH" | "PREVIEW"
  >("METADATA");

  // Form Fields
  const [headline, setHeadline] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [byline, setByline] = useState("");
  const [category, setCategory] = useState("");
  const [desk, setDesk] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [tags, setTags] = useState("");
  const [blocks, setBlocks] = useState<StoryBlock[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [photographerCredit, setPhotographerCredit] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [altText, setAltText] = useState("");

  // API Taxonomy & Users
  const [apiCategories, setApiCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [apiDesks, setApiDesks] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [apiUsers, setApiUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);

  // Tab Data (Revisions, Notes, Locks)
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [activeLock, setActiveLock] = useState<LockInfo | null>(null);

  // Modals & Preview
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [targetBlockIdForMedia, setTargetBlockIdForMedia] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"DESKTOP" | "TABLET" | "MOBILE">("DESKTOP");
  const [submittingAction, setSubmittingAction] = useState(false);

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("edition_access_token");
    return null;
  };

  const authHeaders = useCallback(() => {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // 1. Fetch Taxonomy & Users
  useEffect(() => {
    fetch(`${API_BASE}/cms/categories`).then((r) => r.json()).then((d) => setApiCategories(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API_BASE}/cms/desks`).then((r) => r.json()).then((d) => setApiDesks(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API_BASE}/users`).then((r) => r.json()).then((d) => setApiUsers(Array.isArray(d) ? d : [])).catch(() => {});

    const token = getAuthToken();
    if (token) {
      fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((u) => { if (u && u.username) setCurrentUser(u); })
        .catch(() => {});
    }
  }, []);

  // 2. Fetch Articles list
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/articles?page=0&size=50`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const list: Article[] = Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : [];
      setArticles(list);
      if (list.length > 0 && !selectedArticle) {
        loadArticleIntoEditor(list[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [selectedArticle]);

  useEffect(() => {
    fetchArticles();
  }, []);

  // 3. Load Article into Editor
  const loadArticleIntoEditor = async (art: Article) => {
    setSelectedArticle(art);
    const artHeadline = art.headline || art.title || "";
    setHeadline(artHeadline);
    setSlug(art.slug || artHeadline.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    setSummary(art.summary || "");
    setByline(art.byline || art.primaryAuthorId || currentUser?.fullName || currentUser?.username || "");
    setCategory(art.category || "");
    setDesk(art.desk || "");
    setPriority(art.priority || "NORMAL");
    setTags(art.tags || "");
    setFeaturedImageUrl(art.featuredImageUrl || "");
    setPhotographerCredit(art.photographerCredit || "");
    setImageCaption(art.imageCaption || "");
    setAltText(art.altText || "");

    // Parse structured contentBody into blocks
    const bodyContent = art.contentBody || "";
    try {
      const parsed = JSON.parse(bodyContent);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
        setBlocks(parsed);
      } else {
        setBlocks([{ id: "b-1", type: "PARAGRAPH", content: bodyContent }]);
      }
    } catch {
      setBlocks([{ id: "b-1", type: "PARAGRAPH", content: bodyContent }]);
    }

    setSaveStatus("saved");

    // Fetch Revisions, Lock, Comments for this article
    fetchTabDetails(art.id);
  };

  const fetchTabDetails = async (articleId: string) => {
    // Revisions
    fetch(`${API_BASE}/admin/editorial/articles/${articleId}/revisions`)
      .then((r) => r.json())
      .then((d) => setRevisions(Array.isArray(d) ? d : []))
      .catch(() => setRevisions([]));

    // Lock
    fetch(`${API_BASE}/admin/editorial/articles/${articleId}/lock`)
      .then((r) => r.json())
      .then((d) => setActiveLock(d && d.lockedByUserId ? d : null))
      .catch(() => setActiveLock(null));

    // Comments / Notes
    fetch(`${API_BASE}/admin/editorial/comments?targetType=ARTICLE&targetId=${articleId}`)
      .then((r) => r.json())
      .then((d) => setNotes(Array.isArray(d) ? d : []))
      .catch(() => setNotes([]));
  };

  // 4. Create New Story via API
  const handleCreateNewStory = async () => {
    const token = getAuthToken();
    if (!token) return alert("Login required to create story drafts.");
    setSubmittingAction(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/articles`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          headline: "Untitled Story Draft",
          summary: "",
          contentBody: JSON.stringify([{ id: "b-1", type: "PARAGRAPH", content: "" }]),
          category: apiCategories[0]?.name || null,
        }),
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      const created: Article = await res.json();
      await fetchArticles();
      loadArticleIntoEditor(created);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create story draft");
    } finally {
      setSubmittingAction(false);
    }
  };

  // 5. Save Story via API
  const handleSave = async () => {
    if (!selectedArticle) return;
    const token = getAuthToken();
    if (!token) return alert("Login required to save story changes.");

    setSaveStatus("saving");
    try {
      const payload = {
        headline,
        summary,
        contentBody: JSON.stringify(blocks),
        category,
        desk,
        priority,
        byline,
        tags,
        featuredImageUrl,
        photographerCredit,
        imageCaption,
        altText,
      };

      const res = await fetch(`${API_BASE}/articles/${selectedArticle.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const updated: Article = await res.json();
      setSelectedArticle(updated);

      // Create Revision Snapshot via API
      fetch(`${API_BASE}/admin/editorial/articles/${selectedArticle.id}/revisions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          headline,
          summary,
          contentBody: JSON.stringify(blocks),
          changeSummary: "Updated story content in CMS Studio",
        }),
      }).then(() => fetchTabDetails(selectedArticle.id)).catch(() => {});

      setSaveStatus("saved");
      fetchArticles();
    } catch (err: unknown) {
      setSaveStatus("error");
      alert("Failed to save story: " + (err instanceof Error ? err.message : "API error"));
    }
  };

  // 6. Workflow Status Transition via API
  const handleStatusTransition = async (newStatus: string) => {
    if (!selectedArticle) return;
    const token = getAuthToken();
    if (!token) return alert("Login required to transition workflow status.");

    try {
      const res = await fetch(
        `${API_BASE}/articles/${selectedArticle.id}/status?targetStatus=${newStatus}`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );
      if (!res.ok) throw new Error(`Transition to ${newStatus} failed (${res.status})`);
      const updated: Article = await res.json();
      setSelectedArticle(updated);
      await fetchArticles();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `Failed to transition to ${newStatus}`);
    }
  };

  // 7. Acquire Concurrent Lock via API
  const handleAcquireLock = async () => {
    if (!selectedArticle) return;
    const token = getAuthToken();
    if (!token) return alert("Login required.");
    try {
      const res = await fetch(`${API_BASE}/admin/editorial/articles/${selectedArticle.id}/lock`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Lock acquisition failed: ${res.status}`);
      const lockData = await res.json();
      setActiveLock(lockData);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lock failed");
    }
  };

  // 8. Delete Story via API
  const handleDeleteStory = async (storyId?: string, headlineStr?: string) => {
    const targetId = storyId || selectedArticle?.id;
    const targetTitle = headlineStr || selectedArticle?.headline || selectedArticle?.title || "this story";
    if (!targetId) return;

    if (!confirm(`Are you sure you want to permanently delete "${targetTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/articles/${targetId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok || res.status === 204 || res.status === 404) {
        if (selectedArticle?.id === targetId) {
          setSelectedArticle(null);
        }
        await fetchArticles();
        alert(`Story "${targetTitle}" was permanently deleted.`);
      } else {
        alert(`Failed to delete story (HTTP ${res.status})`);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete story");
    }
  };

  // 8. Add Internal Editorial Note via API
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !newNoteText.trim()) return;
    const token = getAuthToken();
    if (!token) return alert("Login required.");

    try {
      const res = await fetch(`${API_BASE}/admin/editorial/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          targetType: "ARTICLE",
          targetId: selectedArticle.id,
          commentText: newNoteText.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      setNewNoteText("");
      fetchTabDetails(selectedArticle.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to add note");
    }
  };

  const handleMediaSelected = (media: MediaAsset) => {
    if (targetBlockIdForMedia) {
      setBlocks(
        blocks.map((b) =>
          b.id === targetBlockIdForMedia
            ? { ...b, url: media.url, caption: media.caption, credit: media.credit, altText: media.altText }
            : b
        )
      );
      setTargetBlockIdForMedia(null);
    } else {
      setFeaturedImageUrl(media.url);
      setPhotographerCredit(media.credit || "");
      setImageCaption(media.caption || "");
      setAltText(media.altText || "");
      setSaveStatus("unsaved");
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      (a.headline || a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-4 font-sans max-w-[1700px] w-full mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3 flex-none">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5 font-mono">
            <span className="font-bold text-slate-900 font-sans">Newsroom</span>
            <span>/</span>
            <span className="text-red-600 font-bold">Production Editorial Workspace</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 font-serif">
            CMS Story Workspace
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200 rounded-full">
              <FolderKanban className="h-3 w-3 text-red-600" /> API-BACKED CANONICAL DOMAIN
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-mono font-bold">
                <User className="h-3 w-3 text-emerald-600" />
                <span>{currentUser.fullName || currentUser.username}</span>
              </div>
              <button
                onClick={() => authService.logout()}
                title="Logout of CMS Studio"
                className="flex items-center gap-1 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 font-bold px-3 py-1.5 rounded-xl transition text-[11px]"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition shadow-2xs text-xs font-sans"
            >
              Sign In
            </button>
          )}

          <button
            onClick={handleCreateNewStory}
            disabled={submittingAction}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-2xs disabled:opacity-40 font-sans"
          >
            <Plus className="h-4 w-4" /> New Story Workspace
          </button>
        </div>
      </div>

      {/* 3-Column Studio Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Column 1: Story Navigator (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl flex flex-col min-h-0 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 space-y-2 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Story Drafts ({filteredArticles.length})
              </span>
              <button onClick={fetchArticles} className="text-slate-400 hover:text-slate-700 transition">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-red-500 font-sans text-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
            {loading ? (
              <div className="p-3 space-y-2.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 animate-pulse space-y-2">
                    <div className="h-3 w-16 bg-slate-200 rounded-full" />
                    <div className="h-4 w-full bg-slate-200 rounded-lg" />
                    <div className="h-3 w-20 bg-slate-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <EmptyState title="No stories found" description="Create a new story draft above." />
            ) : (
              filteredArticles.map((art) => {
                const active = selectedArticle?.id === art.id;
                return (
                  <div
                    key={art.id}
                    className={`w-full p-3.5 text-left transition-colors flex flex-col gap-1 group relative ${
                      active ? "bg-red-50/80 border-l-4 border-red-600" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-red-600 uppercase">{art.category || "GENERAL"}</span>
                      <div className="flex items-center gap-1">
                        <StatusBadge status={art.status || "DRAFT"} size="sm" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStory(art.id, art.headline || art.title);
                          }}
                          title="Delete Story"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => loadArticleIntoEditor(art)} className="text-left w-full">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug hover:text-red-600 transition font-serif">
                        {art.headline || art.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1">
                        Updated {art.updatedAt ? new Date(art.updatedAt).toLocaleTimeString() : "—"}
                      </span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Center Block Composition Canvas (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col min-h-0 shadow-2xs overflow-hidden">
          {selectedArticle ? (
            <div className="flex-1 flex flex-col p-4 space-y-3 min-h-0 overflow-y-auto">
              {/* Real Concurrent Lock Banner */}
              {activeLock ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-600 animate-pulse" />
                    <span>
                      <strong>Concurrent Lock Active:</strong> Locked by {activeLock.lockedByUserId}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 uppercase tracking-wider font-bold">Lock Active</span>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 text-slate-600 p-2.5 rounded-xl text-[11px] font-mono flex items-center justify-between">
                  <span>No concurrent lock acquired.</span>
                  <button onClick={handleAcquireLock} className="text-red-600 font-bold hover:underline text-[10px]">
                    Acquire Lock
                  </button>
                </div>
              )}

              {/* Save Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-none font-mono">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500">STATE:</span>
                  <StatusBadge status={selectedArticle.status || "DRAFT"} />
                  <span className="text-[11px] ml-2">
                    {saveStatus === "saving" && <span className="text-amber-600 font-bold animate-pulse">Saving to DB...</span>}
                    {saveStatus === "saved" && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Persisted
                      </span>
                    )}
                    {saveStatus === "unsaved" && <span className="text-rose-600 font-bold">Unsaved edits</span>}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteStory()}
                    title="Permanently delete story draft"
                    className="flex items-center gap-1 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 font-bold text-xs px-3 py-1.5 rounded-xl transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition shadow-2xs font-sans"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Story
                  </button>
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-1 flex-none">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Main Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => {
                    setHeadline(e.target.value);
                    setSaveStatus("unsaved");
                  }}
                  placeholder="Enter main headline..."
                  className="w-full text-base font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-red-500 font-serif"
                />
              </div>

              {/* Dek / Standfirst */}
              <div className="space-y-1 flex-none">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Dek / Subheadline Summary</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    setSaveStatus("unsaved");
                  }}
                  placeholder="Subheadline / summary deck..."
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 focus:outline-none focus:border-red-500 resize-none font-sans"
                />
              </div>

              {/* Block Composer */}
              <div className="space-y-2 flex-1 pt-2 border-t border-slate-200">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Structured Block Content Composer</label>
                <StoryBlockComposer
                  blocks={blocks}
                  onChange={(updated) => {
                    setBlocks(updated);
                    setSaveStatus("unsaved");
                  }}
                  onOpenMediaLibrary={(blockId) => {
                    setTargetBlockIdForMedia(blockId);
                    setMediaModalOpen(true);
                  }}
                />
              </div>
            </div>
          ) : (
            <EmptyState title="No Story Selected" description="Select a story or create a new draft above." />
          )}
        </div>

        {/* Column 3: 7-Tab Sidebar & Workflow Controls (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col min-h-0 shadow-2xs overflow-hidden font-sans">
          {selectedArticle ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tab Selector Header */}
              <div className="flex items-center border-b border-slate-200 bg-slate-50/50 p-1 overflow-x-auto font-mono text-[10px] flex-none no-scrollbar">
                {[
                  { id: "METADATA", label: "Meta", icon: FileText },
                  { id: "MEDIA", label: "Media", icon: ImageIcon },
                  { id: "FACT_CHECK", label: "FactCheck", icon: ShieldCheck },
                  { id: "NOTES", label: "Notes", icon: MessageSquare },
                  { id: "HISTORY", label: "Revisions", icon: History },
                  { id: "PUBLISH", label: "Workflow", icon: Send },
                  { id: "PREVIEW", label: "Preview", icon: Eye },
                ].map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                        active ? "bg-red-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Panel Body */}
              <div className="flex-1 p-4 overflow-y-auto min-h-0 space-y-4 text-xs">
                {/* TAB 1: METADATA & SEO */}
                {activeTab === "METADATA" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase font-mono text-muted-foreground border-b border-border pb-1">Story Metadata & SEO</h4>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">URL Slug</label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => { setSlug(e.target.value); setSaveStatus("unsaved"); }}
                        className="w-full text-xs font-mono bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Category</label>
                      <select
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setSaveStatus("unsaved"); }}
                        className="w-full text-xs font-mono bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">— Select Category —</option>
                        {apiCategories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Desk</label>
                        <select
                          value={desk}
                          onChange={(e) => { setDesk(e.target.value); setSaveStatus("unsaved"); }}
                          className="w-full text-xs font-mono bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">— Select Desk —</option>
                          {apiDesks.map((d) => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Priority</label>
                        <select
                          value={priority}
                          onChange={(e) => { setPriority(e.target.value); setSaveStatus("unsaved"); }}
                          className="w-full text-xs font-mono bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="NORMAL">NORMAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="URGENT">URGENT</option>
                          <option value="FLASH">FLASH</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Byline Author</label>
                      {apiUsers.length > 0 ? (
                        <select
                          value={byline}
                          onChange={(e) => { setByline(e.target.value); setSaveStatus("unsaved"); }}
                          className="w-full text-xs font-bold bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">— Select Author —</option>
                          {apiUsers.map((u) => (
                            <option key={u.id} value={u.fullName}>{u.fullName} ({u.username})</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={byline}
                          onChange={(e) => { setByline(e.target.value); setSaveStatus("unsaved"); }}
                          className="w-full text-xs font-bold bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => { setTags(e.target.value); setSaveStatus("unsaved"); }}
                        className="w-full text-xs font-mono bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: MEDIA MANAGEMENT */}
                {activeTab === "MEDIA" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-1">
                      <h4 className="text-xs font-bold uppercase font-mono text-muted-foreground">Featured Image & Attachments</h4>
                      <button
                        onClick={() => {
                          setTargetBlockIdForMedia(null);
                          setMediaModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
                      >
                        Browse Media Library
                      </button>
                    </div>

                    {featuredImageUrl ? (
                      <div className="space-y-2">
                        <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
                          <img src={featuredImageUrl} alt={altText || "Featured image"} className="w-full h-full object-cover" />
                        </div>
                        <input
                          type="text"
                          value={imageCaption}
                          onChange={(e) => { setImageCaption(e.target.value); setSaveStatus("unsaved"); }}
                          placeholder="Image Caption..."
                          className="w-full text-xs bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input
                          type="text"
                          value={photographerCredit}
                          onChange={(e) => { setPhotographerCredit(e.target.value); setSaveStatus("unsaved"); }}
                          placeholder="Photographer Credit..."
                          className="w-full text-xs bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                        />
                      </div>
                    ) : (
                      <div className="p-6 border border-dashed border-border rounded-xl text-center text-muted-foreground font-mono text-xs">
                        No featured image attached. Click above to select media from database.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: FACT CHECKING CLAIMS */}
                {activeTab === "FACT_CHECK" && (
                  <FactCheckPanel articleId={selectedArticle.id} />
                )}

                {/* TAB 4: EDITORIAL COLLABORATION & NOTES */}
                {activeTab === "NOTES" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase font-mono text-slate-500 border-b border-slate-200 pb-1">Reporter & Editor Notes</h4>

                    <form onSubmit={handleAddNote} className="space-y-2">
                      <textarea
                        rows={3}
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Add internal editorial research note..."
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-red-500 font-mono resize-none leading-relaxed text-slate-900"
                      />
                      <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-2xs font-sans">
                        Add Note
                      </button>
                    </form>

                    <div className="space-y-2 pt-2 border-t border-slate-200 font-mono text-xs">
                      {notes.length === 0 ? (
                        <div className="text-slate-400 p-3 text-center">No internal notes recorded.</div>
                      ) : (
                        notes.map((n) => (
                          <div key={n.id} className="p-3 border border-slate-200 bg-slate-50/50 rounded-xl space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span className="font-bold text-red-600">{n.authorId}</span>
                              <span>{n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : ""}</span>
                            </div>
                            <p className="text-slate-900 font-sans">{n.commentText}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: REVISION HISTORY */}
                {activeTab === "HISTORY" && (
                  <div className="space-y-3 font-mono text-xs">
                    <h4 className="text-xs font-bold uppercase font-mono text-slate-500 border-b border-slate-200 pb-1">Persisted Revision Snapshots</h4>
                    {revisions.length === 0 ? (
                      <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-slate-400">
                        No prior revisions recorded in database. Save changes to create version snapshots.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {revisions.map((rev) => (
                          <div key={rev.id} className="p-3 border border-slate-200 bg-slate-50/50 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Revision #{rev.revisionNumber}</span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {rev.authorId}
                              </span>
                            </div>
                            <div className="text-slate-600 text-[11px] font-sans truncate font-serif">{rev.headline}</div>
                            <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                              <span>{rev.changeSummary || "Editorial update"}</span>
                              <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleTimeString() : ""}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 6: PUBLISHING & WORKFLOW STATE MACHINE */}
                {activeTab === "PUBLISH" && (
                  <div className="space-y-3 font-mono text-xs">
                    <h4 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-200 pb-1">Editorial Workflow State Machine</h4>
                    <div className="space-y-2">
                      {[
                        { state: "DRAFT", label: "Save as Draft", color: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" },
                        { state: "SUBMITTED_FOR_REVIEW", label: "Submit for Review", color: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100" },
                        { state: "EDITOR_REVIEW", label: "Pass to Editor Review", color: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100" },
                        { state: "FACT_CHECK", label: "Require Fact Check", color: "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100" },
                        { state: "APPROVED", label: "Approve for Publication", color: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100" },
                        { state: "PUBLISHED", label: "Publish Immediately Live 🚀", color: "bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-2xs font-sans" },
                      ].map((item) => (
                        <button
                          key={item.state}
                          onClick={() => handleStatusTransition(item.state)}
                          className={`w-full p-3 rounded-xl border text-left font-bold transition flex items-center justify-between ${item.color}`}
                        >
                          <span>{item.label}</span>
                          <span className="text-[10px] font-mono opacity-80">{item.state}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 7: MULTI-DEVICE PREVIEW */}
                {activeTab === "PREVIEW" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-1 font-mono text-xs">
                      <h4 className="font-bold uppercase text-muted-foreground">Device Viewport</h4>
                      <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
                        <button
                          onClick={() => setPreviewDevice("DESKTOP")}
                          className={`p-1 rounded ${previewDevice === "DESKTOP" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
                        >
                          <Monitor className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setPreviewDevice("TABLET")}
                          className={`p-1 rounded ${previewDevice === "TABLET" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
                        >
                          <Tablet className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setPreviewDevice("MOBILE")}
                          className={`p-1 rounded ${previewDevice === "MOBILE" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-center bg-black/40 p-3 rounded-2xl border border-border">
                      <div
                        className={`bg-background border border-border rounded-xl p-4 space-y-3 transition-all ${
                          previewDevice === "MOBILE"
                            ? "w-[280px]"
                            : previewDevice === "TABLET"
                            ? "w-[380px]"
                            : "w-full"
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">{category || "GENERAL"}</span>
                        <h2 className="text-base font-bold text-foreground leading-snug">{headline}</h2>
                        {featuredImageUrl && (
                          <div className="aspect-video rounded-lg overflow-hidden border border-border">
                            <img src={featuredImageUrl} alt={altText} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground italic leading-relaxed">{summary}</p>
                        <div className="text-xs text-foreground space-y-2 border-t border-border pt-2 font-serif">
                          {blocks.map((b) => (
                            <p key={b.id}>{b.content}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState title="No Story Selected" description="Select a story to inspect metadata." />
          )}
        </div>
      </div>

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelectMedia={handleMediaSelected}
      />
    </div>
  );
}
