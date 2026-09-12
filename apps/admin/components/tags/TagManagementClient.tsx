"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Tag as TagIcon, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { apiClient } from "@/lib/api-client";
interface TagItem {
  id: string;
  name: string;
  slug: string;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function TagManagementClient() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<TagItem[]>(`/cms/tags`);
      setTags(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load tags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    setError(null);

    const slug = formSlug.trim() || slugify(formName);

    try {
      await apiClient.post<TagItem>(`/cms/tags`, { name: formName.trim(), slug });
      showSuccess(`Tag "${formName.trim()}" created`);
      setFormName("");
      setFormSlug("");
      fetchTags();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create tag");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (tag: TagItem) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditSlug(tag.slug);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await apiClient.put<TagItem>(`/cms/tags/${id}`, { name: editName.trim(), slug: editSlug.trim() || slugify(editName) });
      showSuccess("Tag updated");
      setEditingId(null);
      fetchTags();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update tag");
    }
  };

  const handleDeleteTag = async (tag: TagItem) => {
    if (!confirm(`Delete tag "${tag.name}"?`)) return;
    try {
      await apiClient.delete<unknown>(`/cms/tags/${tag.id}`);
      showSuccess(`Tag "${tag.name}" deleted`);
      fetchTags();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <TagIcon className="h-6 w-6 text-red-600" /> Tag Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">{tags.length} tags in database</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTags} className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold">
            <RefreshCw className="h-3.5 w-3.5 mr-1 text-slate-500" /> Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-none text-rose-600" /> {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-700 text-xs font-medium flex items-center gap-2">
          <Check className="h-4 w-4 flex-none text-emerald-600" /> {successMsg}
        </div>
      )}

      {/* Create Tag Form */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 font-heading mb-3">Create New Tag</h2>
        <form onSubmit={handleCreateTag} className="flex flex-wrap gap-3">
          <input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Tag name (e.g. Breaking News)"
            className="flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500"
          />
          <input
            value={formSlug || (formName ? slugify(formName) : "")}
            onChange={(e) => setFormSlug(e.target.value)}
            placeholder="slug (auto)"
            className="w-48 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-red-500 font-mono"
          />
          <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs">
            <Plus className="h-4 w-4 mr-1" /> {submitting ? "Creating…" : "Create Tag"}
          </Button>
        </form>
      </div>

      {/* Tags List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 font-mono text-xs">
            <RefreshCw className="h-4 w-4 animate-spin mr-2 text-red-600" /> Loading tags...
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-mono text-xs">
            <TagIcon className="h-8 w-8 mx-auto mb-2 opacity-30 text-slate-400" />
            <p>No tags yet. Create your first tag above.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 font-mono uppercase text-[10px]">
                <th className="px-5 py-3.5 font-semibold">Name</th>
                <th className="px-5 py-3.5 font-semibold">Slug</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3 font-bold text-slate-900">
                    {editingId === tag.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900"
                      />
                    ) : (
                      tag.name
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-500">
                    {editingId === tag.id ? (
                      <input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700"
                      />
                    ) : (
                      tag.slug
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {editingId === tag.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" onClick={() => handleSaveEdit(tag.id)} className="bg-red-600 hover:bg-red-500 text-white text-[10px] px-2.5 py-1 rounded-lg">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-slate-400 text-[10px]">Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleStartEdit(tag)} className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition" title="Edit Tag">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteTag(tag)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition" title="Delete Tag">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
