"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Globe,
  Archive,
  ArrowLeft,
  Star,
  Loader2,
  CheckCircle,
  AlertCircle,
  ImageIcon,
  ShieldCheck,
  FileText,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryBlockComposer, StoryBlock } from "@/components/workspace/StoryBlockComposer";
import { MediaLibraryModal, MediaAsset } from "@/components/workspace/MediaLibraryModal";
import { FactCheckPanel } from "@/components/workspace/FactCheckPanel";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.editiontv.com/api/v1";

interface CategoryItem { id: string; name: string; slug: string; }
interface TagItem { id: string; name: string; slug: string; }
interface DeskItem { id: string; name: string; slug: string; }

interface StoryDetail {
  id: string;
  headline: string;
  slug: string;
  summary: string | null;
  contentBody: string;
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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  SUBMITTED_FOR_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
  EDITOR_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200",
  FACT_CHECK: "bg-purple-50 text-purple-700 border-purple-200",
  COPY_EDIT: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
  ARCHIVED: "bg-slate-100 text-slate-400 border-slate-200",
};

const PUBLISH_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED_FOR_REVIEW", "APPROVED", "PUBLISHED"],
  SUBMITTED_FOR_REVIEW: ["APPROVED", "PUBLISHED"],
  IN_REVIEW: ["APPROVED", "PUBLISHED"],
  EDITOR_REVIEW: ["APPROVED", "PUBLISHED"],
  FACT_CHECK: ["APPROVED", "PUBLISHED"],
  FACT_CHECK_PENDING: ["APPROVED", "PUBLISHED"],
  COPY_EDIT: ["APPROVED", "PUBLISHED"],
  APPROVED: ["PUBLISHED"],
  SCHEDULED: ["PUBLISHED"],
};

export function StoryEditorClient({ storyId }: { storyId: string }) {
  const router = useRouter();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [desks, setDesks] = useState<DeskItem[]>([]);

  // Form fields
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [contentBody, setContentBody] = useState("");
  const [blocks, setBlocks] = useState<StoryBlock[]>([]);
  const [editorMode, setEditorMode] = useState<"BLOCKS" | "RAW">("BLOCKS");
  const [category, setCategory] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Modal State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeBlockIdForMedia, setActiveBlockIdForMedia] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"EDITOR" | "FACT_CHECK">("EDITOR");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null;
    setAuthToken(stored);
  }, []);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }), [authToken]);

  // Load story
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/articles/${storyId}`)
      .then((r) => { if (!r.ok) throw new Error(`Story not found (${r.status})`); return r.json(); })
      .then((data: StoryDetail) => {
        setStory(data);
        setHeadline(data.headline ?? "");
        setSummary(data.summary ?? "");
        const bodyText = data.contentBody ?? "";
        setContentBody(bodyText);
        setCategory(data.category ?? "");
        setFeaturedImageUrl(data.featuredImageUrl ?? "");
        setIsFeatured(data.isFeatured ?? false);

        // Parse contentBody into blocks if JSON
        let initialBlocks: StoryBlock[] = [];
        if (bodyText.trim().startsWith("[")) {
          try {
            initialBlocks = JSON.parse(bodyText);
          } catch {
            initialBlocks = [{ id: "b-1", type: "PARAGRAPH", content: bodyText }];
          }
        } else if (bodyText.trim()) {
          initialBlocks = [{ id: "b-1", type: "PARAGRAPH", content: bodyText }];
        }
        setBlocks(initialBlocks);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load story"))
      .finally(() => setLoading(false));
  }, [storyId]);

  // Load taxonomy
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/cms/categories`).then((r) => r.json()).catch(() => []),
      fetch(`${API_BASE}/cms/tags`).then((r) => r.json()).catch(() => []),
      fetch(`${API_BASE}/cms/desks`).then((r) => r.json()).catch(() => []),
    ]).then(([cats, tgs, dks]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setTags(Array.isArray(tgs) ? tgs : []);
      setDesks(Array.isArray(dks) ? dks : []);
    });
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleBlocksChange = (newBlocks: StoryBlock[]) => {
    setBlocks(newBlocks);
    setContentBody(JSON.stringify(newBlocks));
  };

  const handleRawTextChange = (rawText: string) => {
    setContentBody(rawText);
    if (rawText.trim().startsWith("[")) {
      try {
        setBlocks(JSON.parse(rawText));
      } catch {
        // Ignored
      }
    } else {
      setBlocks([{ id: "b-1", type: "PARAGRAPH", content: rawText }]);
    }
  };

  const handleSelectMedia = (media: MediaAsset) => {
    if (activeBlockIdForMedia) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === activeBlockIdForMedia
            ? { ...b, url: media.url, caption: media.caption || b.caption, credit: media.credit || b.credit }
            : b
        )
      );
      setContentBody(
        JSON.stringify(
          blocks.map((b) =>
            b.id === activeBlockIdForMedia
              ? { ...b, url: media.url, caption: media.caption || b.caption, credit: media.credit || b.credit }
              : b
          )
        )
      );
    } else {
      setFeaturedImageUrl(media.url);
    }
    setActiveBlockIdForMedia(null);
  };

  const handleSave = async () => {
    if (!authToken) return alert("Login required to save.");
    setSaving(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/articles/${storyId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ headline, summary, contentBody, category, featuredImageUrl, isFeatured }),
      });
      if (!r.ok) {
        const errData = await r.json().catch(() => ({}));
        throw new Error((errData as { message?: string }).message || `Save failed: ${r.status}`);
      }
      const updated: StoryDetail = await r.json();
      setStory(updated);
      showSuccess("Story saved successfully");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!authToken) return alert("Login required to publish.");
    if (!story) return;
    setPublishing(true);
    setError(null);
    try {
      const chain = PUBLISH_TRANSITIONS[story.status] ?? [];
      for (const targetStatus of chain) {
        const r = await fetch(`${API_BASE}/articles/${storyId}/status?targetStatus=${targetStatus}`, {
          method: "POST",
          headers: authHeaders(),
        });
        if (!r.ok) throw new Error(`Transition to ${targetStatus} failed`);
        const updated: StoryDetail = await r.json();
        setStory(updated);
      }
      showSuccess("Story published to Public Web");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!authToken) return alert("Login required.");
    if (!story) return;
    if (!confirm("Archive this story?")) return;
    setSaving(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/articles/${storyId}/status?targetStatus=ARCHIVED`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`Archive failed: ${r.status}`);
      const updated: StoryDetail = await r.json();
      setStory(updated);
      showSuccess("Story archived");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Archive failed");
    } finally {
      setSaving(false);
    }
  };

  const handleTransition = async (targetStatus: string) => {
    if (!authToken) return alert("Login required.");
    setSaving(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/articles/${storyId}/status?targetStatus=${targetStatus}`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`Transition to ${targetStatus} failed: ${r.status}`);
      const updated: StoryDetail = await r.json();
      setStory(updated);
      showSuccess(`Status updated to ${targetStatus.replace(/_/g, " ")}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transition failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-500 font-sans text-xs">
      <Loader2 className="h-6 w-6 animate-spin mr-2 text-red-600" /> Loading story...
    </div>
  );

  if (!story) return (
    <div className="text-center py-20 text-rose-600 font-sans text-xs">
      <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
      <p className="font-semibold text-slate-900">{error || "Story not found"}</p>
      <Button variant="ghost" onClick={() => router.push("/stories")} className="mt-4 text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Stories
      </Button>
    </div>
  );

  const canPublish = !!(PUBLISH_TRANSITIONS[story.status]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/stories")}
            className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-serif">Edit Story</h1>
            <p className="text-xs text-slate-500 font-mono">/articles/{story.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase border ${STATUS_COLORS[story.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {story.status.replace(/_/g, " ")}
          </span>
          {story.isPublishedToWeb && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Globe className="h-3 w-3" /> Live on Web
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-2xs"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin text-red-600" /> : <Save className="h-4 w-4 text-red-600" />}
            Save
          </button>
          {canPublish && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-2xs"
            >
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              Publish to Web
            </button>
          )}
        </div>
      </div>

      {/* Mode / Sub-navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1 font-mono text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("EDITOR")}
            className={`px-3 py-1.5 font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "EDITOR"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Story Composition
          </button>
          <button
            onClick={() => setActiveTab("FACT_CHECK")}
            className={`px-3 py-1.5 font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "FACT_CHECK"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Fact Check & Verification
          </button>
        </div>

        {activeTab === "EDITOR" && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setEditorMode("BLOCKS")}
              className={`px-2.5 py-1 font-bold rounded-lg transition text-[11px] ${
                editorMode === "BLOCKS" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Block Builder
            </button>
            <button
              onClick={() => setEditorMode("RAW")}
              className={`px-2.5 py-1 font-bold rounded-lg transition text-[11px] ${
                editorMode === "RAW" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Raw Text / HTML
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-none text-rose-600" /> {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-700 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4 flex-none text-emerald-600" /> {successMsg}
        </div>
      )}

      {activeTab === "FACT_CHECK" ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <FactCheckPanel articleId={storyId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Headline *</label>
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Story headline…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-base font-extrabold font-serif focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Summary / Deck</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary or introductory paragraph…"
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 resize-none font-sans leading-relaxed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Content Body *</label>
                  <span className="text-[10px] font-mono text-slate-400">Mode: {editorMode}</span>
                </div>

                {editorMode === "BLOCKS" ? (
                  <StoryBlockComposer
                    blocks={blocks}
                    onChange={handleBlocksChange}
                    onOpenMediaLibrary={(blockId) => {
                      setActiveBlockIdForMedia(blockId);
                      setIsMediaModalOpen(true);
                    }}
                  />
                ) : (
                  <textarea
                    value={contentBody}
                    onChange={(e) => handleRawTextChange(e.target.value)}
                    placeholder="Full story content (JSON blocks or HTML / plain text)..."
                    rows={18}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 resize-y font-mono leading-relaxed"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Settings Column */}
          <div className="space-y-4">
            {/* Publication Settings */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Publication Settings</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                >
                  <option value="">— No Category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600 font-mono">Featured Image URL</label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBlockIdForMedia(null);
                      setIsMediaModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1 font-mono"
                  >
                    <ImageIcon className="h-3 w-3" /> Select Media
                  </button>
                </div>
                <input
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 font-mono"
                />
                {featuredImageUrl ? (
                  <img src={featuredImageUrl} alt="Preview" className="mt-2 rounded-xl w-full h-36 object-cover border border-slate-200" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : null}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-red-600 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Featured Story
                </label>
              </div>
            </div>

            {/* Status Workflow */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Status Workflow</h3>
              <p className="text-xs text-slate-500 font-medium">Current: <span className={`font-bold uppercase ${STATUS_COLORS[story.status]?.split(" ")[1] || "text-slate-800"}`}>{story.status.replace(/_/g, " ")}</span></p>

              <div className="space-y-2">
                {["SUBMITTED_FOR_REVIEW", "EDITOR_REVIEW", "FACT_CHECK", "COPY_EDIT", "APPROVED", "PUBLISHED", "RETRACTED", "ARCHIVED"].map((ts) => {
                  const canDo = story.status !== ts;
                  return canDo ? (
                    <button
                      key={ts}
                      onClick={() => handleTransition(ts)}
                      disabled={saving}
                      className="w-full text-left text-xs font-medium px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition disabled:opacity-40"
                    >
                      Transition to: <span className="font-bold text-red-600">{ts.replace(/_/g, " ")}</span>
                    </button>
                  ) : null;
                })}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2 text-xs text-slate-600 font-mono">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Metadata</h3>
              <div><span className="text-slate-400">ID:</span> {story.id}</div>
              <div><span className="text-slate-400">Author:</span> {story.primaryAuthorId}</div>
              {story.createdAt && <div><span className="text-slate-400">Created:</span> {new Date(story.createdAt).toLocaleString()}</div>}
              {story.updatedAt && <div><span className="text-slate-400">Updated:</span> {new Date(story.updatedAt).toLocaleString()}</div>}
              {story.publishedAt && <div><span className="text-slate-400">Published:</span> {new Date(story.publishedAt).toLocaleString()}</div>}
            </div>

            {/* Archive */}
            {story.status !== "ARCHIVED" && (
              <Button
                variant="ghost"
                onClick={handleArchive}
                disabled={saving}
                className="w-full text-slate-500 hover:text-amber-700 border border-slate-200 hover:bg-slate-50 text-xs font-medium rounded-xl transition"
              >
                <Archive className="h-4 w-4 mr-2" /> Archive Story
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setActiveBlockIdForMedia(null);
        }}
        onSelectMedia={handleSelectMedia}
      />
    </div>
  );
}
