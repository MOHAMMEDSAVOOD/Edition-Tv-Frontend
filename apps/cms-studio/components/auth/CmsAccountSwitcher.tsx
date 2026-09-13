"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  UserPlus,
  X,
  Feather,
  LogOut,
  Mail
} from "lucide-react";
import { displayNameOf, useAuth } from "@edition/auth";
import { authService } from "@/services/authService";
import { apiClient } from "@/lib/api-client";

/**
 * Account menu for CMS Studio. Shows the signed-in Firebase identity and
 * `/auth/me` roles and offers a real "Sign out". Provisioning editorial users
 * via `POST /users` is only offered when the current user is ROLE_ADMIN.
 */
export function CmsAccountSwitcher() {
  const { user, profile, roles, hasRole } = useAuth();
  const isAdmin = hasRole("ROLE_ADMIN");

  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Form State for Adding CMS Account (ROLE_ADMIN only)
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("ROLE_EDITOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const name = displayNameOf(profile, user?.displayName || user?.email || "");
  const email = profile?.email || user?.email || "";

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authService.logout();
    } finally {
      setSigningOut(false);
    }
  };

  const handleAddCmsAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !newUsername.trim() || !newEmail.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newRole === "ROLE_ADMIN") {
      setErrorMsg("CMS Studio account creation is restricted to Editorial roles ONLY (Editor or Journalist).");
      setIsSubmitting(false);
      return;
    }

    try {
      await apiClient.post<unknown>(`/users`, {
        username: newUsername.trim(),
        email: newEmail.trim(),
        role: newRole,
        firstName: newUsername.trim(),
        lastName: "Journalist",
      });
      setSuccessMsg(`User ${newUsername.trim()} created with ${newRole}. They sign in with Firebase using ${newEmail.trim()}.`);
      setNewUsername("");
      setNewEmail("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative font-sans select-none">
      {/* Account Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1.5 rounded-full transition text-xs font-semibold text-slate-800 shadow-2xs"
      >
        <div className="h-5 w-5 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-bold text-[10px]">
          <Feather className="h-3 w-3" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="font-extrabold block leading-none text-slate-900 text-xs font-heading">{name || "Account"}</span>
          <span className="text-[8px] font-mono text-blue-600 font-extrabold uppercase">EDITORIAL STAFF</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500 ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
          <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Signed in</span>
            <span className="text-blue-600 font-bold">FIREBASE</span>
          </div>

          <div className="px-3 py-2.5 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-mono truncate">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{email || "—"}</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {(roles.length ? roles : ["NO ROLES"]).map((r) => (
                <span
                  key={r}
                  className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-600 uppercase"
                >
                  {r.replace("ROLE_", "")}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 space-y-1">
            {isAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAddModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Editorial Staff Account</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition shadow-2xs disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span>{signingOut ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Add CMS Account Modal (ROLE_ADMIN only) */}
      {isAddModalOpen && isAdmin && (
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

            <p className="text-xs text-slate-500 font-mono">
              Creates the platform record and role. Passwords are managed by Firebase — the user signs in with
              their Firebase account (email/password or Google) using this email.
            </p>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-mono">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-mono">
                {successMsg}
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
                <label className="text-xs font-mono text-slate-600 block mb-1">Email (Firebase sign-in email)</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@editiontv.com"
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
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-2xs disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
