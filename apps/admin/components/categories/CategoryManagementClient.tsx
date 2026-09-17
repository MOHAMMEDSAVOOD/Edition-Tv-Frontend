"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Eye, EyeOff, Layers, Lock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  showInNav?: boolean;
  parentId?: string | null;
}

import { apiClient } from "@/lib/api-client";
import { useAuth } from "@edition/auth";
export function CategoryManagementClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formSlug, setFormSlug] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  const [formShowInNav, setFormShowInNav] = useState<boolean>(true);
  const [formParentId, setFormParentId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Auth State (Firebase session via AuthProvider)
  const { user } = useAuth();
  const isSignedIn = !!user;
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Category[]>(`/cms/categories`);
      const list = Array.isArray(data) ? data : [];
      setCategories(list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Arrange categories hierarchically: Top-level categories followed immediately by their subcategories
  const hierarchicalCategories = React.useMemo(() => {
    const topLevel = categories.filter((c) => !c.parentId);
    const subCats = categories.filter((c) => !!c.parentId);
    const result: Category[] = [];

    topLevel.forEach((parent) => {
      result.push(parent);
      const children = subCats
        .filter((child) => child.parentId === parent.id)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      result.push(...children);
    });

    // Append any orphaned subcategories
    const addedIds = new Set(result.map((c) => c.id));
    categories.forEach((cat) => {
      if (!addedIds.has(cat.id)) {
        result.push(cat);
      }
    });

    return result;
  }, [categories]);

  // Duplicate slug check for the modal form
  const isDuplicateSlug = React.useMemo(() => {
    const trimmed = formSlug.trim().toLowerCase();
    if (!trimmed) return false;
    return categories.some((c) => c.slug.toLowerCase() === trimmed && c.id !== editingId);
  }, [formSlug, categories, editingId]);

  const openCreateModal = (preselectedParentId?: string) => {
    if (!isSignedIn) {
      setShowLoginModal(true);
      return;
    }
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormDisplayOrder(categories.length + 1);
    setFormShowInNav(true);
    setFormParentId(preselectedParentId || "");
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    if (!isSignedIn) {
      setShowLoginModal(true);
      return;
    }
    setEditingId(category.id);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || "");
    setFormDisplayOrder(category.displayOrder || 0);
    setFormShowInNav(category.showInNav !== false);
    setFormParentId(category.parentId || "");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicateSlug) {
      setModalError(`A category with slug "${formSlug.trim()}" already exists. Please choose a different slug.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setModalError(null);

    const cleanParentId = formParentId && formParentId.trim() !== "" ? formParentId.trim() : null;

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      description: formDescription.trim() || undefined,
      displayOrder: Number(formDisplayOrder),
      showInNav: formShowInNav,
      parentId: cleanParentId,
    };

    try {
      const url = editingId ? `/cms/categories/${editingId}` : `/cms/categories`;

      try {
        if (editingId) {
          await apiClient.put<Category>(url, payload);
        } else {
          await apiClient.post<Category>(url, payload);
        }
      } catch (err: unknown) {
        const errorObj = err as { status?: number; message?: string; detail?: string };
        if (errorObj.status === 401 || errorObj.status === 403) {
          setShowLoginModal(true);
          throw new Error("Admin authentication required. Please log in.");
        }
        const msg = errorObj.detail || errorObj.message || "Failed to save category";
        throw new Error(msg);
      }

      setIsModalOpen(false);
      setModalError(null);
      await fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while saving";
      setModalError(msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isSignedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      try {
        await apiClient.delete<unknown>(`/cms/categories/${id}`);
      } catch (err: unknown) {
        const errorObj = err as { status?: number; message?: string };
        if (errorObj.status === 401 || errorObj.status === 403) {
          setShowLoginModal(true);
          throw new Error("Admin authentication required. Please log in.");
        }
        throw new Error("Failed to delete category");
      }
      await fetchCategories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto font-sans pb-10">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading flex items-center gap-2">
            <Layers className="h-6 w-6 text-red-600" /> Category &amp; Navigation Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            API-backed taxonomy control. Configure category ordering, position numbers, and Public Web header display.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Key className="h-3 w-3" /> Admin Authenticated
            </span>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowLoginModal(true)} className="border-slate-200 text-slate-700 rounded-xl text-xs font-bold">
              <Lock className="h-4 w-4 mr-1.5 text-amber-600" /> Admin Auth Login
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={fetchCategories} disabled={loading} className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold">
            <RefreshCw className={`h-3.5 w-3.5 mr-1 text-slate-500 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => openCreateModal()} className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs">
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50/60 border-b border-slate-100 text-[10px] uppercase font-mono font-semibold text-slate-400">
            <tr>
              <th className="px-4 py-3.5 w-20 text-center">Position</th>
              <th className="px-4 py-3.5">Category Name</th>
              <th className="px-4 py-3.5">Slug</th>
              <th className="px-4 py-3.5">Description</th>
              <th className="px-4 py-3.5 text-center">Header Nav</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-mono">
                  Loading categories from backend API...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-mono">
                  No categories found in database. Click &quot;Add Category&quot; to create one.
                </td>
              </tr>
            ) : (
              hierarchicalCategories.map((cat) => {
                const isSub = !!cat.parentId;
                const parentCat = isSub ? categories.find((p) => p.id === cat.parentId) : null;
                return (
                  <tr
                    key={cat.id}
                    className={`transition-colors ${
                      isSub
                        ? "bg-slate-50/50 hover:bg-slate-100/70 border-l-2 border-red-500"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-center">
                      {isSub ? (
                        <span className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                          ↳ #{cat.displayOrder}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-50 text-red-600 text-[11px]">
                          #{cat.displayOrder}
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3 ${isSub ? "pl-8" : ""}`}>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          {isSub && <span className="text-red-600 font-mono text-xs">↳</span>}
                          {cat.name}
                          {isSub && (
                            <span className="text-[9px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                              Sub
                            </span>
                          )}
                        </span>
                        {isSub && (
                          <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Sub-category of: <span className="font-bold text-slate-700">{parentCat?.name || cat.parentId}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">/categories/{cat.slug}</td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-xs">{cat.description || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {cat.showInNav !== false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Eye className="h-3 w-3" /> Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          <EyeOff className="h-3 w-3" /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isSub && (
                          <button
                            onClick={() => openCreateModal(cat.id)}
                            className="px-2 py-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                            title="Add Sub-category under this category"
                          >
                            + Sub
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                          title="Edit Category"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 font-sans">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <span className="shrink-0 text-sm">⚠️</span>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingId) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-red-500"
                  placeholder="e.g. Technology"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-mono border rounded-xl bg-slate-50 focus:outline-none ${
                    isDuplicateSlug ? "border-rose-400 focus:border-rose-500 bg-rose-50/20" : "border-slate-200 focus:border-red-500"
                  }`}
                  placeholder="technology"
                />
                {isDuplicateSlug && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    ⚠️ Slug &ldquo;{formSlug.trim()}&rdquo; already exists. Please choose a different slug.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-red-500 resize-none"
                  placeholder="Optional brief category description"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Category (Optional Sub-Category)</label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-red-500"
                >
                  <option value="">None (Top-Level Main Category)</option>
                  {categories
                    .filter((c) => c.id !== editingId && !c.parentId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({`/categories/${c.slug}`})
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input
                    type="checkbox"
                    id="showInNav"
                    checked={formShowInNav}
                    onChange={(e) => setFormShowInNav(e.target.checked)}
                    className="h-4 w-4 rounded accent-red-600"
                  />
                  <label htmlFor="showInNav" className="text-xs font-semibold text-slate-700">Show in Header</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="text-slate-500 text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || isDuplicateSlug || !formName.trim() || !formSlug.trim()}
                  size="sm"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : editingId ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 font-sans">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock className="h-5 w-5 text-red-600" />
              <h2 className="text-base font-bold text-slate-900 font-heading">Admin Authentication Login</h2>
            </div>
            <p className="text-xs text-slate-500">
              Your session has ended. Please sign in again to create, edit, or reorder categories.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowLoginModal(false)} className="text-slate-500 text-xs">
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={() => { window.location.href = "/login"; }} className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs">
                Go to Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
