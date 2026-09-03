"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TerminalSidebar } from "@/components/layout/TerminalSidebar";
import { TerminalTopNav } from "@/components/layout/TerminalTopNav";

export function LiveAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === "/login") {
      setAuthenticated(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null;
    if (!token) {
      setAuthenticated(false);
      router.replace("/login");
    } else {
      setAuthenticated(true);
    }
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (authenticated === null) {
    return (
      <div className="h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <span>Verifying Control Room Credentials...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-background text-foreground flex overflow-hidden font-mono">
      <TerminalSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TerminalTopNav />
        <main className="flex-1 overflow-y-auto p-4 bg-background">{children}</main>
      </div>
    </div>
  );
}
