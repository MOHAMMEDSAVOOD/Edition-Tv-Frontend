"use client";
import { useState } from "react";
import { GoogleIcon } from "@edition/auth";
import { authService } from "@/services/authService";
import { LogIn, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSignedIn = () => {
    setSuccess(true);
    window.location.href = "/";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      onSignedIn();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      await authService.loginWithGoogle();
      onSignedIn();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const busy = isLoading || isGoogleLoading;

  return (
    <div className="space-y-4 font-sans">
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
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
          <label htmlFor="edition_public_email" className="text-xs font-bold uppercase tracking-wider text-foreground">Email Address</label>
          <input
            type="email"
            name="email"
            id="edition_public_email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="edition_public_password" className="text-xs font-bold uppercase tracking-wider text-foreground">Password</label>
            <a href="/auth/forgot-password" className="text-xs text-primary hover:underline font-medium">
              Forgot password?
            </a>
          </div>
          <input
            type="password"
            name="password"
            id="edition_public_password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-primary text-primary-foreground text-sm font-bold py-3 rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider shadow-sm"
        >
          <LogIn className="h-4 w-4" />
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[10px] font-mono uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="w-full bg-background text-foreground text-sm font-bold py-3 rounded-sm border border-border hover:bg-muted transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
      >
        <GoogleIcon className="h-4 w-4" />
        {isGoogleLoading ? "Waiting for Google..." : "Continue with Google"}
      </button>
    </div>
  );
}
