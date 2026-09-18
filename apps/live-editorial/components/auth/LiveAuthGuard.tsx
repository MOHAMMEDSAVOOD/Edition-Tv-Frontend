"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { STAFF_ROLES, useRoleGate } from "@edition/auth";
import { TerminalSidebar } from "@/components/layout/TerminalSidebar";
import { TerminalTopNav } from "@/components/layout/TerminalTopNav";

const APP_NAME = "Live Editorial";

export function LiveAuthGuard({ children }: { children: React.ReactNode }) {
  const gate = useRoleGate({ allowedRoles: STAFF_ROLES, loginPath: "/login" });

  if (gate.isPublicPath) {
    return <>{children}</>;
  }

  if (gate.status === "loading") {
    return (
      <div className="h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <span>Verifying Control Room Credentials...</span>
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
      <div className="h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-5 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-bold tracking-tight text-white">
              {denied ? `This account has no access to ${APP_NAME}` : "Could not verify your account"}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {denied
                ? `Signed in as ${gate.profile?.email || "unknown"} (${(gate.profile?.roles || []).join(", ") || "no roles"}). An editorial role is required.`
                : gate.error || "The profile service is unavailable."}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            {!denied && (
              <button
                onClick={() => void gate.retry()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold"
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
    <div className="min-h-screen h-screen w-screen bg-background text-foreground flex overflow-hidden font-mono">
      <TerminalSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TerminalTopNav />
        <main className="flex-1 overflow-y-auto p-4 bg-background">{children}</main>
      </div>
    </div>
  );
}
