"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { userRepository } from "@/repositories/userRepository";
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const email = searchParams?.get("email") || "";
  const oobCode = searchParams?.get("oobCode") || "";
  const resetToken = searchParams?.get("resetToken") || searchParams?.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 6) return "Password must be at least 6 characters long.";
    return null;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const valError = validatePassword(newPassword);
    if (valError) {
      setErrorMsg(valError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      await userRepository.resetPassword({
        email: email.trim(),
        oobCode: oobCode || undefined,
        resetToken: resetToken || undefined,
        newPassword,
      });

      setSuccess(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to reset password. Please try requesting a new link.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-[#12141a] py-8 px-5 shadow-lg sm:rounded-xl border border-border sm:px-10 text-center space-y-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground">
            Password Reset Successful!
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Your Edition TV account password has been updated. You can now sign in with your new credentials.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-full py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-md hover:opacity-90 transition"
          >
            Sign In Now &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#12141a] py-8 px-5 shadow-lg sm:rounded-xl border border-border sm:px-10">
      {errorMsg && (
        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg flex items-start gap-2.5 font-mono">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleResetPassword}>
        {email && (
          <div className="p-3 bg-muted/40 rounded border border-border text-xs text-muted-foreground">
            Resetting password for: <span className="font-mono font-bold text-foreground">{email}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs uppercase font-bold text-foreground tracking-wider">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-border bg-background rounded-md text-sm text-foreground focus:outline-none focus:border-primary font-sans pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">Minimum 6 characters</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs uppercase font-bold text-foreground tracking-wider">
            Confirm New Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 border border-border bg-background rounded-md text-sm text-foreground focus:outline-none focus:border-primary font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-md hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          <KeyRound className="h-4 w-4" />
          {loading ? "Updating Password..." : "Set New Password"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="text-center pt-1">
          <Link
            href="/auth/login"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            &larr; Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0b0d] flex flex-col justify-center py-16 sm:px-6 lg:px-8 font-sans select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Edition TV Logo" width={180} height={60} className="h-10 w-auto object-contain dark:invert" priority />
        </Link>
        <h2 className="text-center text-2xl md:text-3xl font-serif font-bold text-foreground">
          Create New Password
        </h2>
        <p className="mt-2 text-center text-xs md:text-sm text-muted-foreground">
          Please enter and confirm your new account password below.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="h-64 bg-card rounded-xl animate-pulse" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
