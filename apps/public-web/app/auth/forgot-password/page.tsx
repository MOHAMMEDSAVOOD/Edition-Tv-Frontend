"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/services/authService";
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0b0d] flex flex-col justify-center py-16 sm:px-6 lg:px-8 font-sans select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Edition TV Logo" width={180} height={60} className="h-10 w-auto object-contain dark:invert" priority />
        </Link>
        <h2 className="text-center text-2xl md:text-3xl font-serif font-bold text-foreground">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter your account email address and we will send you a secure link to choose a new password.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#12141a] py-8 px-5 shadow-lg sm:rounded-xl border border-border sm:px-10">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg flex items-start gap-2.5 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {sent ? (
            <div className="space-y-6">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start gap-2 font-mono">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  If an account exists for <strong>{email.trim()}</strong>, a password reset email is on its way.
                  Open the link in that email to set a new password, then sign in again.
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Didn&apos;t get it? Check your spam folder, or{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="font-semibold text-sky-600 hover:text-sky-500"
                >
                  try another email address
                </button>
                .
              </p>
              <div className="text-center pt-2">
                <Link href="/auth/login" className="text-xs font-semibold text-sky-600 hover:text-sky-500">
                  &larr; Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="edition_forgot_email" className="block text-xs uppercase font-bold text-slate-700 tracking-wider mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="edition_forgot_email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 bg-white rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? "Sending Reset Link..." : "Send Reset Link"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-500"
                >
                  &larr; Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
