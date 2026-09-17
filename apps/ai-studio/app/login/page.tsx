"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { GoogleIcon, STAFF_ROLES, authService, ensureAppAccess } from "@edition/auth";

const APP_NAME = "AI Studio";
const ALLOWED_ROLES = STAFF_ROLES;

export default function AiLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSignedIn = () => {
    setSuccess(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authService.login(email, password);
      await ensureAppAccess(result.profile, ALLOWED_ROLES, APP_NAME);
      onSignedIn();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await authService.loginWithGoogle();
      await ensureAppAccess(result.profile, ALLOWED_ROLES, APP_NAME);
      onSignedIn();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const busy = loading || googleLoading;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">AI STUDIO WORKBENCH</h1>
            <span className="text-xs text-purple-400 font-mono">Generative Intelligence Portal &bull; Port 5004</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 p-3.5 rounded-xl text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Authenticated! Accessing AI Studio...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label htmlFor="edition_ai_email" className="text-xs font-semibold text-slate-400 block mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                name="email"
                id="edition_ai_email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-xl pl-10 pr-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edition_ai_pass" className="text-xs font-semibold text-slate-400 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="edition_ai_pass"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-xl pl-10 pr-10 py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wider text-xs shadow-lg shadow-purple-600/30 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Enter AI Workbench"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center gap-3 text-[10px] font-mono uppercase text-slate-500">
          <span className="h-px flex-1 bg-slate-800" />
          <span>or</span>
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full bg-slate-950 hover:bg-slate-800 text-slate-100 font-bold py-3 rounded-xl border border-slate-800 transition flex items-center justify-center gap-2.5 text-xs disabled:opacity-50"
        >
          <GoogleIcon className="h-4 w-4" />
          <span>{googleLoading ? "Waiting for Google..." : "Continue with Google"}</span>
        </button>
      </div>
    </div>
  );
}
