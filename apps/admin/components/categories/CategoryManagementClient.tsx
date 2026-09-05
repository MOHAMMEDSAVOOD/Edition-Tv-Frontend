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
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.editiontv.com/api/v1";

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
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Auth State
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginUser, setLoginUser] = useState<string>("");
  const [loginPass, setLoginPass] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null;
    setAuthToken(token);
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/cms/categories`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch categories`);
      const data = await res.json();
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: loginUser, password: loginPass }),
      });

      if (!res.ok) throw new Error("Invalid username or password");

      const data = await res.json();
      const token = data.accessToken || data.token;

      if (token) {
        localStorage.setItem("edition_access_token", token);
        setAuthToken(token);
        setShowLoginModal(false);
      } else {
        throw new Error("No token returned from login server");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const getAuthHeaders = () => {
    const token = authToken || (typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const openCreateModal = () => {
    const token = authToken || (typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null);
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormDisplayOrder(categories.length + 1);
    setFormShowInNav(true);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    const token = authToken || (typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null);
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    setEditingId(category.id);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || "");
    setFormDisplayOrder(category.displayOrder || 0);
    setFormShowInNav(category.showInNav !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name: formName,
      slug: formSlug,
      description: formDescription,
      displayOrder: Number(formDisplayOrder),
      showInNav: formShowInNav,
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/cms/categories/${editingId}`
        : `${API_BASE_URL}/cms/categories`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        setShowLoginModal(true);
        throw new Error("Admin authentication required. Please log in.");
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || errJson.message || "Failed to save category");
      }

      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while saving");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const token = authToken || (typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null);
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/cms/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        setShowLoginModal(true);
        throw new Error("Admin authentication required. Please log in.");
      }

      if (!res.ok) throw new Error("Failed to delete category");
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
          {authToken ? (
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
          <Button size="sm" onClick={openCreateModal} className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs">
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
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-50 text-red-600 text-[11px]">
                      #{cat.displayOrder}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{cat.name}</td>
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
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(cat)} className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition" title="Edit Category">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition" title="Delete Category">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-red-500"
                  placeholder="technology"
                />
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
                <Button type="submit" disabled={submitting} size="sm" className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs">
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
              Please authenticate to create, edit, or reorder categories. Default editor account: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">editor</code>
            </p>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Username / Email</label>
                <input
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowLoginModal(false)} disabled={loginLoading} className="text-slate-500 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={loginLoading} size="sm" className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs">
                  {loginLoading ? "Authenticating..." : "Sign In & Proceed"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
