"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { authService, UserSession } from "@/services/authService";
import { UserPlus, AlertCircle, CheckCircle2, User, LogOut } from "lucide-react";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
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

  const handleLogout = () => {
    authService.logout();
    setSession(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password meets production backend requirements:
    // min 8 chars, uppercase, lowercase, and digit or special character
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

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, "");
    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters long (letters, numbers, underscores).");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        username: cleanUsername,
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/account";
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  if (mounted && session) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mb-1">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold">Already Registered</h2>
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
            Sign out to create a new account
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
          Account created successfully! Redirecting to your account...
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Username</label>
        <input
          type="text"
          name="edition_reg_username"
          id="edition_reg_username"
          autoComplete="off"
          required
          minLength={3}
          maxLength={50}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. janedoe"
          className="w-full px-3 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
        />
        <p className="text-[10px] text-muted-foreground font-mono">Min 3 characters (letters, numbers, underscore)</p>
      </div>

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
        <p className="text-[10px] text-muted-foreground font-mono">
          Min 8 characters with uppercase, lowercase, and a number or symbol
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground text-sm font-bold py-3 rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider shadow-sm"
      >
        <UserPlus className="h-4 w-4" />
        {isLoading ? "Creating Account..." : "Create Free Account"}
      </button>
    </form>
  );
}
