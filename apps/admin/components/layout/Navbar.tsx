"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Search, Bell, Sparkles, User, LogOut, LogIn, ShieldCheck } from "lucide-react";
import { authService } from "@/services/authService";

export function Navbar() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("edition_username");
      const token = localStorage.getItem("edition_access_token");
      if (token) {
        setUsername(storedUser || "admin");
      } else {
        setUsername(null);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Live Status */}
        <div className="flex items-center gap-6">
          <Link href="/stories" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-serif">
              EDITION TV
            </span>
            <span className="text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase">ADMIN</span>
          </Link>
          <Badge variant="live" className="gap-1 px-2.5 py-0.5">
            <Radio className="h-3 w-3 animate-pulse" /> LIVE STREAM
          </Badge>
        </div>

        {/* Global Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/stories"
            className={pathname === "/stories" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground transition-colors"}
          >
            Stories
          </Link>
          <Link
            href="/categories"
            className={pathname === "/categories" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground transition-colors"}
          >
            Categories
          </Link>
          <Link
            href="/news-sources"
            className={pathname === "/news-sources" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground transition-colors"}
          >
            News Sources
          </Link>
          <Link
            href="/news-reader"
            className={pathname === "/news-reader" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground transition-colors"}
          >
            News Reader
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {username ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs text-slate-200">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-bold">{username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                <LogIn className="h-3.5 w-3.5" /> Admin Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
