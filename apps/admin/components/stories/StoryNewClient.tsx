"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, Loader2, AlertCircle, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface CategoryItem { id: string; name: string; slug: string; }

export function StoryNewClient() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [contentBody, setContentBody] = useState("");
  const [category, setCategory] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null;
    setAuthToken(stored);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/cms/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }), [authToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return alert("Login required to create stories.");
    if (!headline.trim()) return setError("Headline is required.");
    if (!contentBody.trim()) return setError("Content body is required.");
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/articles`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          headline: headline.trim(),
          summary: summary.trim() || null,
          contentBody: contentBody.trim(),
          category: category || null,
          featuredImageUrl: featuredImageUrl.trim() || null,
        }),
      });
      if (!r.ok) {
        const errData = await r.json().catch(() => ({}));
        throw new Error((errData as { message?: string }).message || `Create failed: ${r.status}`);
      }
      const created = await r.json();
      router.push(`/stories/${created.id}/edit`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create story");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/stories")} className="text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" /> New Story
          </h1>
          <p className="text-xs text-zinc-500">Create a new draft article</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-none" /> {error}
        </div>
      )}

      {!authToken && (
        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 text-yellow-400 text-sm">
          ⚠ You must be logged in to create stories. Please log in via the Categories page first.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Headline <span className="text-red-600">*</span>
              </label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Story headline…"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-base font-extrabold font-heading focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Summary / Deck</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary for the article listing…"
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 resize-none font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Content Body <span className="text-red-600">*</span>
              </label>
              <textarea
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                placeholder="Full story content…"
                rows={16}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 resize-y font-mono"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
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
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">Featured Image URL</label>
              <input
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://…"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFeaturedNew"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-red-600"
              />
              <label htmlFor="isFeaturedNew" className="text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Featured Story
              </label>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-500 font-medium shadow-2xs">
            Story will be created as <span className="font-bold text-red-600">DRAFT</span>. You can edit and publish from the story editor.
          </div>

          <Button
            type="submit"
            disabled={submitting || !authToken}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating…</>
            ) : (
              <><Plus className="h-4 w-4 mr-2" /> Create Draft Story</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
