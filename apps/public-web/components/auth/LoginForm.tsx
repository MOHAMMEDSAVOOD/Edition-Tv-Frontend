"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { authService, UserSession } from "@/services/authService";
import { LogIn, AlertCircle, CheckCircle2, User, LogOut } from "lucide-react";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(authService.getCurrentSession());

    const handleAuthChange = () => {
      setSession(authService.getCurrentSession());
    };

    window.addEventListener("edition_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("edition_auth_changed", handleAuthChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.login(identifier.trim(), password);
      setSuccess(true);
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email/username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
  };

  if (mounted && session) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mb-1">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold">Already Signed In</h2>
        <p className="text-xs text-muted-foreground">
          You are currently signed in as <span className="font-semibold text-foreground font-mono">@{session.username}</span>.
        </p>

        <div className="flex flex-col gap-2.5 pt-3">
          <Link
            href="/account"
            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-sm tracking-wide text-center flex items-center justify-center gap-2"
          >
            <User className="h-4 w-4" />
            Go to Reader Account
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 border border-border text-sm font-medium rounded-sm hover:bg-muted text-center"
          >
            Return to Front Page
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 text-xs text-red-500 hover:text-red-600 font-medium flex items-center justify-center gap-1.5 transition-colors pt-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out of @{session.username}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans" autoComplete="off">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3.5 rounded-sm text-xs flex items-start gap-2.5 font-mono">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-3.5 rounded-sm text-xs font-semibold font-mono">
          Signed in successfully! Redirecting...
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Email or Username</label>
        <input
          type="text"
          name="edition_public_identifier"
          id="edition_public_identifier"
          autoComplete="off"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter your email or username"
          className="w-full px-3 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
        />
        <p className="text-[10px] text-muted-foreground font-mono">You can sign in with either your username or registered email</p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground">Password</label>
          <a href="/auth/forgot-password" className="text-xs text-primary hover:underline font-medium">
            Forgot password?
          </a>
        </div>
        <input
          type="password"
          name="edition_public_password"
          id="edition_public_password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground text-sm font-bold py-3 rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider shadow-sm"
      >
        <LogIn className="h-4 w-4" />
        {isLoading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
