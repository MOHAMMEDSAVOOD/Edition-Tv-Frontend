"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Search, Bell, Sparkles, User } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Live Status */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Edition TV Logo" width={180} height={40} className="h-8 md:h-9 max-h-9 w-auto object-contain dark:invert" priority />
          </Link>
          <Badge variant="live" className="gap-1 px-2.5 py-0.5">
            <Radio className="h-3 w-3 animate-pulse" /> LIVE STREAM
          </Badge>
        </div>

        {/* Global Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className={pathname === "/" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground transition-colors"}
          >
            Reader Feed
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Live Coverage
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            CMS Studio
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Intelligence
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Search articles">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
            <Sparkles className="h-3.5 w-3.5" /> AI Assistant
          </Button>
          <Button size="sm" className="gap-1.5">
            <User className="h-3.5 w-3.5" /> Reporter Studio
          </Button>
        </div>
      </div>
    </header>
  );
}
