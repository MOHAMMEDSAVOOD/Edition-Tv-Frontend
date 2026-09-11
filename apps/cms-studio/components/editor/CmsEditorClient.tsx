"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Save,
  Send,
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CmsEditorClientProps {
  isNew?: boolean;
  entryId?: string;
}

type EntryStatus = "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED";

import { apiClient } from "@/lib/api-client";

export function CmsEditorClient({ isNew = false, entryId = "" }: CmsEditorClientProps) {
  const [articleId, setArticleId] = useState(entryId);
  const [title, setTitle] = useState(
    isNew ? "" : "Global AI Engineering Standard Adopted Across Enterprise Systems"
  );
  const [slug, setSlug] = useState(isNew ? "" : "enterprise-ai-standards");
  const [category, setCategory] = useState("Technology");
  const [status, setStatus] = useState<EntryStatus>(isNew ? "DRAFT" : "PUBLISHED");
  const [author, setAuthor] = useState("reporter");
  const [summary, setSummary] = useState(
    isNew
      ? ""
      : "How next-generation editorial architectures and transactional outbox patterns are redefining digital newsrooms."
  );
  const [bodyText, setBodyText] = useState(
    isNew
      ? ""
      : "The digital news ecosystem is undergoing a fundamental transformation. Enterprise publishing platforms must evolve beyond traditional content management frameworks."
  );

  const [seoTitle, setSeoTitle] = useState(title);
  const [seoDesc, setSeoDesc] = useState(summary);
  const [activeTab, setActiveTab] = useState<"publish" | "seo" | "ai">("publish");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiHeadline, setAiHeadline] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!articleId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const saveArticleToBackend = async (targetStatus?: EntryStatus) => {
    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    if (!title.trim() || !bodyText.trim()) {
      setErrorMsg("Headline and Article Body Content are required.");
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        headline: title.trim(),
        summary: summary.trim() || title.trim(),
        contentBody: bodyText.trim(),
      };

      let endpoint = `/articles`;
      if (articleId) {
        endpoint = `/articles/${articleId}`;
      }

      const savedData = articleId 
        ? await apiClient.put<any>(endpoint, payload)
        : await apiClient.post<any>(endpoint, payload);

      if (savedData.id) {
        setArticleId(savedData.id);
        if (savedData.slug) setSlug(savedData.slug);
      }

      const newStatus = targetStatus || status;
      if (savedData.id && newStatus && newStatus !== "DRAFT") {
        const statusData = await apiClient.post<any>(`/articles/${savedData.id}/status?targetStatus=${newStatus}`);
        if (statusData && statusData.status) setStatus(statusData.status);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("CMS Save Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save article to backend.";
      setErrorMsg(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiSuggestHeadline = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      setAiHeadline("Enterprise AI Governance Standard Mandated Across Global Systems");
    }, 600);
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4">
      {/* Top Editor Toolbar */}
      <div className="flex items-center justify-between border-b border-border pb-3 flex-none bg-card px-4 py-2 rounded-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              {articleId ? `Editing Entry #${articleId.slice(0, 8)}` : "New Article Entry"}
            </span>
            <h1 className="text-sm font-bold text-foreground line-clamp-1">{title || "Untitled Entry"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Saved to Database & Published
            </span>
          )}
          <button
            onClick={() => saveArticleToBackend("DRAFT")}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border bg-background hover:bg-muted rounded-md transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => saveArticleToBackend("PUBLISHED")}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-1.5 rounded-md transition-colors shadow-xs"
          >
            <Send className="h-3.5 w-3.5" /> Publish Entry
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Split-Pane Editor Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 min-h-0 overflow-hidden">
        {/* Left Column: Main Content Fields */}
        <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar">
          {/* Title & Slug */}
          <div className="bg-card border border-border p-5 rounded-md space-y-3">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                Article Title / Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter compelling headline..."
                className="w-full text-lg font-bold bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-mono">Slug:</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 font-mono text-xs bg-background border border-border rounded px-2 py-1 focus:outline-none"
              />
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-card border border-border p-5 rounded-md space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block">
              Executive Summary / Excerpt
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief 2-3 sentence overview for feeds..."
              className="w-full text-xs bg-background border border-border rounded-md p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
            />
          </div>

          {/* Rich Body Content */}
          <div className="bg-card border border-border p-5 rounded-md space-y-3 flex-1">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Article Body Content
              </label>
              <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-mono text-muted-foreground">
                {bodyText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              rows={14}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Write or paste rich article body text here..."
              className="w-full font-sans text-sm bg-background border border-border rounded-md p-4 text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* Right Column: Metadata & Side Panel */}
        <div className="bg-card border border-border rounded-md flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center border-b border-border text-xs font-bold bg-muted/20">
            <button
              onClick={() => setActiveTab("publish")}
              className={cn(
                "flex-1 py-2.5 text-center border-b-2 transition-colors",
                activeTab === "publish"
                  ? "border-sky-500 text-sky-400 bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Publishing
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={cn(
                "flex-1 py-2.5 text-center border-b-2 transition-colors",
                activeTab === "seo"
                  ? "border-sky-500 text-sky-400 bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              SEO Meta
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={cn(
                "flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1",
                activeTab === "ai"
                  ? "border-sky-500 text-sky-400 bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-3 w-3 text-sky-400" /> AI
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs no-scrollbar">
            {activeTab === "publish" && (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Workflow Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EntryStatus)}
                    className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 font-bold text-xs"
                  >
                    <option value="DRAFT">🟡 Draft</option>
                    <option value="UNDER_REVIEW">🔵 Under Review</option>
                    <option value="APPROVED">🟢 Approved</option>
                    <option value="PUBLISHED">✅ Published</option>
                  </select>
                </div>

                {/* Phase 4 Fact-Check & Copy-Edit Badges */}
                <div className="p-3 bg-muted/40 border border-border rounded-md space-y-2">
                  <div className="flex items-center justify-between text-2xs font-bold uppercase text-muted-foreground">
                    <span>Fact Check</span>
                    <span className="text-emerald-400">PASSED ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-2xs font-bold uppercase text-muted-foreground">
                    <span>Copy Edit</span>
                    <span className="text-indigo-400">READY FOR APPROVAL</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Category Section</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs font-semibold"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="World">World</option>
                    <option value="Science">Science</option>
                    <option value="Politics">Politics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Assigned Author / Byline</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="reporter"
                    className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs"
                  />
                </div>

                {/* Newsroom Internal Comments Widget */}
                <div className="pt-2 border-t border-border space-y-2">
                  <label className="font-bold text-muted-foreground block text-xs">Internal Newsroom Comments</label>
                  <div className="p-2.5 bg-background border border-border rounded-md space-y-2 text-2xs">
                    <div className="text-muted-foreground font-semibold">
                      <span className="text-indigo-400 font-bold">@editor</span> Please verify the official quote source.
                    </div>
                    <input
                      type="text"
                      placeholder="Add newsroom comment (@editor, @reporter)..."
                      className="w-full bg-muted border border-border rounded px-2 py-1 text-2xs"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "seo" && (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">SEO Meta Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Meta Description</label>
                  <textarea
                    rows={3}
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    className="w-full bg-background border border-border rounded-md p-2 text-xs"
                  />
                </div>
              </>
            )}

            {activeTab === "ai" && (
              <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-md space-y-2">
                <span className="font-bold text-sky-400 flex items-center gap-1 text-xs">
                  <Sparkles className="h-3.5 w-3.5" /> AI Editorial Assistant
                </span>
                <button
                  onClick={handleAiSuggestHeadline}
                  disabled={aiGenerating}
                  className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded text-xs transition-colors"
                >
                  {aiGenerating ? "Generating..." : "Suggest Alternative Headline"}
                </button>
                {aiHeadline && (
                  <div className="p-2 bg-card border border-sky-500/40 rounded mt-2 text-xs font-bold text-foreground">
                    {aiHeadline}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
