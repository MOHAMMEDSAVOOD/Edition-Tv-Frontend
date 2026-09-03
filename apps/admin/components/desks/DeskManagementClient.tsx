"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, RefreshCw, LayoutGrid, AlertCircle, CheckCircle, Power } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.editiontv.com/api/v1";

interface DeskItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  enabled: boolean;
  priority: number;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function DeskManagementClient() {
  const [desks, setDesks] = useState<DeskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);
  const [formPriority, setFormPriority] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null;
    setAuthToken(stored);
  }, []);

  const fetchDesks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/cms/desks`);
      if (!r.ok) throw new Error(`API ${r.status}`);
      const data = await r.json();
      setDesks(
        (Array.isArray(data) ? data : []).sort(
          (a: DeskItem, b: DeskItem) => a.priority - b.priority
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load desks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesks();
  }, [fetchDesks]);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }), [authToken]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormEnabled(true);
    setFormPriority(desks.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (desk: DeskItem) => {
    setEditingId(desk.id);
    setFormName(desk.name);
    setFormSlug(desk.slug);
    setFormDescription(desk.description || "");
    setFormEnabled(desk.enabled);
    setFormPriority(desk.priority);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    setError(null);

    const body = {
      name: formName.trim(),
      slug: formSlug.trim() || slugify(formName),
      description: formDescription.trim() || null,
      enabled: formEnabled,
      priority: formPriority,
    };

    try {
      const url = editingId ? `${API_BASE}/cms/desks/${editingId}` : `${API_BASE}/cms/desks`;
      const method = editingId ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(txt || `HTTP ${r.status}`);
      }
      showSuccess(editingId ? "Desk updated successfully" : "Desk created successfully");
      setIsModalOpen(false);
      fetchDesks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save desk");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (desk: DeskItem) => {
    try {
      const r = await fetch(`${API_BASE}/cms/desks/${desk.id}/toggle`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error("Toggle failed");
      showSuccess(`Desk '${desk.name}' ${!desk.enabled ? "enabled" : "disabled"}`);
      fetchDesks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    }
  };

  const handleDelete = async (desk: DeskItem) => {
    if (!confirm(`Delete desk "${desk.name}"?`)) return;
    try {
      const r = await fetch(`${API_BASE}/cms/desks/${desk.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error("Delete failed");
      showSuccess(`Desk '${desk.name}' deleted`);
      fetchDesks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto font-sans pb-10">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              {editingId ? "Edit Desk" : "Create New Desk"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Desk Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingId) setFormSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. Technology"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Slug</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="technology"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-mono focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief desk description..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 resize-none font-sans"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Priority Order</label>
                  <input
                    type="number"
                    value={formPriority}
                    onChange={(e) => setFormPriority(parseInt(e.target.value) || 10)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input
                    type="checkbox"
                    id="deskEnabled"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    className="h-4 w-4 rounded accent-red-600"
                  />
                  <label htmlFor="deskEnabled" className="text-xs font-semibold text-slate-700">Enabled</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-500 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs">
                  {submitting ? "Saving…" : editingId ? "Update Desk" : "Create Desk"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-red-600" /> Newsroom Desks
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {desks.length} desks total · Managed live via API & Database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDesks} className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold">
            <RefreshCw className="h-3.5 w-3.5 mr-1 text-slate-500" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreateModal} className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs">
            <Plus className="h-4 w-4 mr-1" /> Add Desk
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
          <CheckCircle className="h-4 w-4 flex-none text-emerald-600" /> {successMsg}
        </div>
      )}

      {/* Desks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs animate-pulse space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-slate-200 rounded-lg" />
                <div className="h-4 w-12 bg-slate-200 rounded-full" />
              </div>
              <div className="h-4 w-full bg-slate-200 rounded-lg" />
              <div className="h-4 w-2/3 bg-slate-200 rounded-lg" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-4 w-24 bg-slate-200 rounded-full" />
                <div className="h-6 w-16 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {desks.map((desk) => (
            <div
              key={desk.id}
              className={`bg-white border rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition duration-200 ${
                desk.enabled ? "border-slate-200/90" : "border-slate-200/50 bg-slate-50/60 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base font-heading">{desk.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{desk.slug}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        desk.enabled
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {desk.enabled ? "ACTIVE" : "DISABLED"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">Priority: {desk.priority}</span>
                  </div>
                </div>

                {desk.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{desk.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleToggle(desk)}
                  className={`text-xs font-bold flex items-center gap-1 transition ${
                    desk.enabled ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  <span>{desk.enabled ? "Disable" : "Enable"}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(desk)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                    title="Edit Desk"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(desk)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                    title="Delete Desk"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
