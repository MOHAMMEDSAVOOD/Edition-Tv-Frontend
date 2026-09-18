"use client";

import { LogOut } from "lucide-react";
import { displayNameOf, useAuth } from "@edition/auth";
import { authService } from "@/services/authService";
import { AdminAccountSwitcher } from "@/components/auth/AdminAccountSwitcher";

export function AdminTopNav() {
  const { user, profile } = useAuth();
  const username = displayNameOf(profile, user?.displayName || user?.email || "");

  const handleLogout = () => {
    void authService.logout();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 font-sans shadow-2xs">
      {/* Left: Signed-in user */}
      <div className="flex items-center gap-3 sm:gap-6 pl-10 lg:pl-0 min-w-0">
        <div className="truncate">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block leading-tight">Signed in as</span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight block capitalize truncate font-heading">
            {username || "—"}
          </span>
        </div>
      </div>

      {/* Right: Actions, Account Menu & Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Account Menu */}
        <AdminAccountSwitcher />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout of Admin Portal"
          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 font-bold text-xs p-2 sm:px-3 sm:py-1.5 rounded-full transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
