"use client";
import { useState } from "react";
import { authService } from "@/services/authService";
import { LogIn, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.login({ email, passwordHash: password });
      setSuccess(true);
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Email Address</label>
        <input
          type="email"
          name="edition_public_email"
          id="edition_public_email"
          autoComplete="off"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-3 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
        />
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
