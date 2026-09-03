"use client";
import { useState } from "react";
import { authService } from "@/services/authService";
import { UserPlus, AlertCircle } from "lucide-react";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
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
      await authService.register({ fullName, email, passwordHash: password });
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1200);
    } catch {
      setError("Registration failed. Please check your credentials.");
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
          Account created! Redirecting to sign in...
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Full Name</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full px-3 py-2 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

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
        <label className="text-xs font-semibold text-foreground">Password</label>
        <input
          type="password"
          required
          minLength={6}
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
        <UserPlus className="h-4 w-4" />
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
