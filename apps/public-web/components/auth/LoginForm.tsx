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
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-sm text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-none" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-3 rounded-sm text-xs font-semibold">
          Signed in successfully! Redirecting...
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="reader@example.com"
          className="w-full px-3 py-2 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-foreground">Password</label>
          <a href="/auth/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <LogIn className="h-4 w-4" />
        {isLoading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
