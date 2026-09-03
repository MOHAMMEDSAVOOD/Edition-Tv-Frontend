"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopNav } from "@/components/layout/AdminTopNav";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === "/login") {
      setAuthenticated(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null;
    const user = typeof window !== "undefined" ? localStorage.getItem("edition_username") : null;

    if (!token || (user && user.toLowerCase() !== "admin")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("edition_access_token");
        localStorage.removeItem("edition_username");
        document.cookie = "edition_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
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
      <div className="h-screen w-screen bg-slate-50 text-slate-900 flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          <span>Verifying Admin Permissions...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-slate-100/70 text-slate-900 flex overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-100/70">
        <AdminTopNav />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100/70 text-slate-900 w-full">{children}</main>
      </div>
    </div>
  );
}
