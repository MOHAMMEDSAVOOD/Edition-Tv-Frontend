"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ArrowRight, Radio, AlertCircle, CheckCircle2 } from "lucide-react";
import { authService } from "@edition/auth";

export default function LiveLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("editor");
  const [password, setPassword] = useState("EditionPass2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.login({ username, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">LIVE EDITORIAL</h1>
            <span className="text-xs text-red-500 font-mono">Control Room Portal &bull; Port 5003</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Authenticated! Accessing Control Room...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">User Handle</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 text-white rounded-xl pl-10 pr-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Secret Key</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 text-white rounded-xl pl-10 pr-10 py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wider text-xs shadow-lg shadow-red-600/30"
          >
            {loading ? "Authenticating..." : "Enter Control Room"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
