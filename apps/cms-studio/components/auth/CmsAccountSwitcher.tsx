"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  ChevronDown, 
  UserPlus, 
  X, 
  User,
  Feather
} from "lucide-react";
import { authService } from "@/services/authService";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.editiontv.com/api/v1";

interface UserSummary {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export function CmsAccountSwitcher() {
  const [currentUser, setCurrentUser] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userList, setUserList] = useState<UserSummary[]>([]);

  // Form State for Adding CMS Account
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("ROLE_EDITOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("edition_username") || "";
      setCurrentUser(u);
    }
    fetchCmsUsers();
  }, []);

  const fetchCmsUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) {
        const data: UserSummary[] = await res.json();
        const cmsOnly = data.filter((u) => u.role !== "ROLE_ADMIN");
        setUserList(cmsOnly);
      }
    } catch {
      // Keep empty if unreachable
    }
  };

  const handleSwitchAccount = async (targetUsername: string) => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("edition_username", targetUsername);
    }
    setCurrentUser(targetUsername);
    window.location.reload();
  };

  const handleAddCmsAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    if (newRole === "ROLE_ADMIN") {
      setErrorMsg("CMS Studio account creation is restricted to Editorial roles ONLY (Editor or Journalist).");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail || `${newUsername}@editiontv.com`,
          password: newPassword,
          role: newRole,
          firstName: newUsername,
          lastName: "Journalist",
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed to create user ${res.status}`);
      }

      await fetchCmsUsers();
      setIsAddModalOpen(false);
      await handleSwitchAccount(newUsername.trim().toLowerCase());
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative font-sans select-none">
      {/* Account Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1.5 rounded-full transition text-xs font-semibold text-slate-800 shadow-2xs"
      >
        <div className="h-5 w-5 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-bold text-[10px]">
          <Feather className="h-3 w-3" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="font-extrabold block leading-none text-slate-900 text-xs font-heading">{currentUser}</span>
          <span className="text-[8px] font-mono text-blue-600 font-extrabold uppercase">EDITORIAL STAFF</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500 ml-0.5" />
      </button>

      {/* Switcher Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
          <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Switch Editorial Account</span>
            <span className="text-blue-600 font-bold">CMS STAFF ONLY</span>
          </div>

          <div className="py-1 space-y-1 max-h-60 overflow-y-auto no-scrollbar">
            {userList.map((u) => {
              const active = u.username.toLowerCase() === currentUser.toLowerCase();
              return (
                <button
                  key={u.id}
                  onClick={() => handleSwitchAccount(u.username)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-left transition ${
                    active ? "bg-blue-50 text-slate-900 border border-blue-200 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <User className="h-4 w-4 text-slate-400 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">{u.username}</span>
                      <span className="text-[9px] text-slate-400 block truncate">{u.email}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-600 uppercase shrink-0">
                    {u.role?.replace("ROLE_", "")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-slate-100">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsAddModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Editorial Staff Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Add CMS Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm font-heading">
                <UserPlus className="h-4 w-4" />
                <span>Add Editorial Staff Account</span>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddCmsAccount} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-600 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. senior_editor"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-600 block mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@editiontv.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-600 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-600 block mb-1 font-bold text-blue-600">
                  Assigned Editorial Role (CMS-Level Only)
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-blue-500"
                >
                  <option value="ROLE_EDITOR">ROLE_EDITOR (Lead Editorial Director)</option>
                  <option value="ROLE_REPORTER">ROLE_REPORTER (Senior Journalist)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-2xs"
                >
                  {isSubmitting ? "Creating..." : "Create & Switch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
