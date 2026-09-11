"use client";

import { useEffect, useState } from "react";
import { Search, UserPlus, RefreshCw, AlertCircle, CheckCircle2, Trash2, Shield, UserCheck, UserX, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  lastLogin: string;
}

const ROLES = [
  "ADMIN",
  "EDITOR_IN_CHIEF",
  "MANAGING_EDITOR",
  "SENIOR_EDITOR",
  "EDITOR",
  "REPORTER",
  "SUBSCRIBER",
] as const;

export function UserManagementClient() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "EDITOR",
    status: "ACTIVE",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<any>("/admin/users");
      if (data) {
        setUsers(data);
      } else {
        setError(`Failed to fetch users`);
      }
    } catch {
      setError("Failed to connect to backend user API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) return;

    setIsSubmitting(true);
    try {
      const created = await apiClient.post<any>("/admin/users", formData);

      if (created) {
        setUsers((prev) => [created, ...prev]);
        setIsModalOpen(false);
        setFormData({
          name: "",
          username: "",
          email: "",
          password: "",
          role: "EDITOR",
          status: "ACTIVE",
        });
        showToast(`Successfully created user ${created.name} (${created.role})`);
      } else {
        setError("Failed to create user. Ensure email is unique.");
      }
    } catch {
      setError("Error creating user account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRole = async (id: string, newRole: string) => {
    try {
      const updated = await apiClient.put<any>(`/admin/users/${id}/role`, { role: newRole });
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
        showToast(`Updated role for ${updated.name} to ${newRole}`);
      }
    } catch (e) {
      console.error("Failed to update role", e);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await apiClient.put<any>(`/admin/users/${id}/status`, { status: newStatus });
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
        showToast(`Account ${updated.name} is now ${newStatus}`);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user account "${name}"?`)) return;

    try {
      await apiClient.delete<any>(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast(`Deleted user account "${name}"`);
    } catch (e) {
      console.error("Failed to delete user", e);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const suspendedCount = users.filter((u) => u.status === "SUSPENDED").length;
  const inactiveCount = users.filter((u) => u.status === "INACTIVE").length;
  const adminCount = users.filter((u) => u.role.includes("ADMIN") || u.role.includes("EDITOR")).length;

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md flex items-center gap-2 shadow-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 flex-none" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total Accounts</div>
            <div className="text-xl font-extrabold text-slate-900 font-serif">{users.length}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Active Users</div>
            <div className="text-xl font-extrabold text-slate-900 font-serif">{activeCount}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <UserX className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Suspended / Inactive</div>
            <div className="text-xl font-extrabold text-slate-900 font-serif">{suspendedCount + inactiveCount}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">Admins & Editors</div>
            <div className="text-xl font-extrabold text-slate-900 font-serif">{adminCount}</div>
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="ALL">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-2xs font-sans text-xs"
          >
            <UserPlus className="h-4 w-4" /> Add User / Admin
          </button>

          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition text-xs font-sans"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin text-red-600")} /> Refresh
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-mono">
          <AlertCircle className="h-4 w-4 flex-none text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              <th className="py-3.5 px-4">User & Email</th>
              <th className="py-3.5 px-4">Role Designation</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4">Registered Date</th>
              <th className="py-3.5 px-4 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && users.length === 0 ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-3.5 w-32 bg-slate-200 rounded-full mb-1.5" />
                    <div className="h-3 w-44 bg-slate-200 rounded-full" />
                  </td>
                  <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded-full" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 rounded-full" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 w-24 bg-slate-200 rounded-full" /></td>
                  <td className="py-4 px-4 text-right"><div className="h-4 w-20 bg-slate-200 rounded-lg ml-auto" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-mono">
                  No matching user accounts found.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                    <div className="text-slate-500 text-[11px] font-mono">{u.email}</div>
                  </td>

                  {/* Inline Role Selector */}
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role.replace("ROLE_", "")}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold border focus:outline-none focus:border-red-500 cursor-pointer font-mono",
                        u.role.includes("ADMIN")
                          ? "border-purple-200 text-purple-700 bg-purple-50"
                          : u.role.includes("EDITOR")
                          ? "border-red-200 text-red-700 bg-red-50"
                          : u.role.includes("REPORTER")
                          ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                          : "border-slate-200 text-slate-700 bg-slate-100"
                      )}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Inline Status Selector */}
                  <td className="py-3.5 px-4">
                    <select
                      value={u.status}
                      onChange={(e) => updateStatus(u.id, e.target.value)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold border focus:outline-none focus:border-red-500 cursor-pointer font-mono",
                        u.status === "ACTIVE"
                          ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                          : u.status === "SUSPENDED"
                          ? "border-rose-200 text-rose-700 bg-rose-50"
                          : "border-amber-200 text-amber-700 bg-amber-50"
                      )}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Active Now"}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      title="Delete User Account"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-extrabold text-slate-900 font-heading">Create User / Admin Account</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 font-mono">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mohammed Savood"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 font-mono">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. msavood"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 font-mono">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. savood@edition.tv"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 font-mono">
                  Initial Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 font-mono">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 font-mono">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs font-sans text-xs"
                >
                  {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
