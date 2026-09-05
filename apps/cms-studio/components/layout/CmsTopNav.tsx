"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, LogOut, Plus } from "lucide-react";
import { authService } from "@/services/authService";
import { CmsAccountSwitcher } from "@/components/auth/CmsAccountSwitcher";

export function CmsTopNav() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edition_username");
      if (stored) setUsername(stored);
    }
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 font-sans shadow-2xs">
      {/* Left: Greeting & Search Bar */}
      <div className="flex items-center gap-3 sm:gap-6 pl-10 lg:pl-0 min-w-0">
        <div className="truncate">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block leading-tight">Welcome 👋</span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight block capitalize truncate font-heading">
            {username === "editor" ? "Lead Editor" : username}
          </span>
        </div>

        {/* Global Keyword Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Enter keywords..."
            className="w-full bg-slate-100/80 border border-slate-200 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 text-slate-800 rounded-full pl-9 pr-4 py-1.5 text-xs transition outline-none"
          />
        </div>
      </div>

      {/* Right: Actions, New Story Button, Account Switcher & Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* New Story Action Button */}
        <Link
          href="/workspace"
          className="hidden sm:flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-full transition shadow-sm shadow-red-600/30"
        >
          <Plus className="h-4 w-4" />
          <span>New Story</span>
        </Link>

        {/* Notification Bell */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
          title="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-600 rounded-full ring-2 ring-white animate-pulse" />
        </button>

        {/* CMS Account Switcher */}
        <CmsAccountSwitcher />

        {/* Logout Button */}
        <button
          onClick={() => authService.logout()}
          title="Logout of CMS Studio"
          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 font-bold text-xs p-2 sm:px-3 sm:py-1.5 rounded-full transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
