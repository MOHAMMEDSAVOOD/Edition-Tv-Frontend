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
      window.location.href = "/auth/login";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please check your details.");
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
          Account created! Redirecting to sign in...
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Full Name</label>
        <input
          type="text"
          name="edition_reg_name"
          id="edition_reg_name"
          autoComplete="off"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full px-3 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Email Address</label>
        <input
          type="email"
          name="edition_reg_email"
          id="edition_reg_email"
          autoComplete="off"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-3 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Password</label>
        <input
          type="password"
          name="edition_reg_pass"
          id="edition_reg_pass"
          autoComplete="new-password"
          required
          minLength={8}
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
        <UserPlus className="h-4 w-4" />
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
