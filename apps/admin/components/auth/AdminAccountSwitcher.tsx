"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ShieldCheck, LogOut, Mail, Users } from "lucide-react";
import { displayNameOf, useAuth } from "@edition/auth";
import { authService } from "@/services/authService";

/**
 * Account menu for the Admin Console: shows the signed-in Firebase identity and
 * `/auth/me` roles, links to user/role management and offers a real "Sign out".
 * Accounts are created in Firebase Authentication; roles are assigned under Users.
 */
export function AdminAccountSwitcher() {
  const { user, profile, roles } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

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

  return (
    <div className="relative font-sans select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1.5 rounded-full transition text-xs font-semibold text-slate-800 shadow-2xs"
      >
        <div className="h-5 w-5 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-600 font-bold text-[10px]">
          <ShieldCheck className="h-3 w-3" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="font-extrabold block leading-none text-slate-900 text-xs font-heading">{name || "Account"}</span>
          <span className="text-[8px] font-mono text-red-600 font-extrabold uppercase">ADMIN CONSOLE</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
          <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Signed in</span>
            <span className="text-red-600 font-bold">FIREBASE</span>
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
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                    r.includes("ADMIN") ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {r.replace("ROLE_", "")}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 space-y-1">
            <Link
              href="/users"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition"
            >
              <Users className="h-4 w-4" />
              <span>Users &amp; Roles</span>
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs transition shadow-2xs disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span>{signingOut ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
