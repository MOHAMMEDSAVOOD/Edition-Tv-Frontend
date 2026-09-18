"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { STAFF_ROLES, useRoleGate } from "@edition/auth";
import { PartnerSidebar } from "@/components/layout/PartnerSidebar";
import { PartnerTopNav } from "@/components/layout/PartnerTopNav";

export function PartnerAuthGuard({ children }: { children: React.ReactNode }) {
  const gate = useRoleGate({ allowedRoles: STAFF_ROLES, loginPath: "/login" });

  if (gate.isPublicPath) {
    return <>{children}</>;
  }

  if (gate.status === "loading") {
    return (
      <div className="h-screen w-screen bg-slate-50 text-slate-900 flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          <span>Verifying Newsroom Credentials...</span>
        </div>
      </div>
    );
  }

  if (gate.status === "anonymous") {
    return null;
  }

  if (gate.status === "denied" || gate.status === "error") {
    const denied = gate.status === "denied";
    return (
      <div className="h-screen w-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-5 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold font-serif tracking-tight">
              {denied ? "This account has no access to Partner Portal" : "Could not verify your account"}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              {denied
                ? `Signed in as ${gate.profile?.email || "unknown"} (${(gate.profile?.roles || []).join(", ") || "no roles"}). An editorial role is required.`
                : gate.error || "The profile service is unavailable."}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            {!denied && (
              <button
                onClick={() => void gate.retry()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Retry
              </button>
            )}
            <button
              onClick={async () => {
                await gate.signOut();
                window.location.href = "/login";
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-slate-100/70 text-slate-900 flex overflow-hidden font-sans">
      <PartnerSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-100/70">
        <PartnerTopNav />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100/70 text-slate-900 w-full">{children}</main>
      </div>
    </div>
  );
}
