"use client";
import { useState } from "react";
import { GoogleIcon } from "@edition/auth";
import { authService } from "@/services/authService";
import { UserPlus, AlertCircle } from "lucide-react";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onRegistered = () => {
    setSuccess(true);
    // The Firebase session is already active and /auth/me has provisioned the reader.
    window.location.href = "/account";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mirror the backend's password policy: min 8 chars, upper, lower, and a digit or symbol.
    // Carried over from the pre-Firebase form so the rules are still enforced client-side.
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigitOrSpecial = /[0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password);
    if (!hasUpper || !hasLower || !hasDigitOrSpecial) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number or symbol.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({ fullName, email, password });
      onRegistered();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      await authService.loginWithGoogle();
      onRegistered();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-up failed. Please try again.");
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
            Account created! Redirecting to your account...
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="edition_reg_name" className="text-xs font-bold uppercase tracking-wider text-foreground">Full Name</label>
          <input
            type="text"
            name="name"
            id="edition_reg_name"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full px-3 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="edition_reg_email" className="text-xs font-bold uppercase tracking-wider text-foreground">Email Address</label>
          <input
            type="email"
            name="email"
            id="edition_reg_email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="edition_reg_pass" className="text-xs font-bold uppercase tracking-wider text-foreground">Password</label>
          <input
            type="password"
            name="new-password"
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
          disabled={busy}
          className="w-full bg-primary text-primary-foreground text-sm font-bold py-3 rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          {isLoading ? "Creating Account..." : "Create Account"}
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
