"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { userRepository } from "@/repositories/userRepository";
import { Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const cleanEmail = email.trim();
      await userRepository.forgotPassword(cleanEmail);
      setSubmittedEmail(cleanEmail);
      setIsSubmitted(true);
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
        <p className="mt-2 text-center text-xs md:text-sm text-muted-foreground">
          Enter your registered email address and we will send you a password reset link.
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

          {isSubmitted ? (
            <div className="text-center space-y-4 py-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Password Reset Link Sent
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A password reset link has been dispatched to{" "}
                <span className="font-semibold text-foreground font-mono">{submittedEmail}</span>.
                Please check your inbox (and spam folder) to reset your password.
              </p>

              <div className="pt-4 space-y-2.5 border-t border-border mt-4">
                <Link
                  href="/auth/login"
                  className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 hover:opacity-90 transition"
                >
                  <span>Return to Login</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition font-medium"
                >
                  Didn&apos;t receive the email? Try another address
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-xs uppercase font-bold text-foreground tracking-wider">
                  Registered Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@editiontv.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-border bg-background rounded-md text-sm text-foreground focus:outline-none focus:border-primary font-sans"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">
                  We will email you a secure link to create a new password
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-md hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? "Sending Reset Link..." : "Send Password Reset Link"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-1">
                <Link
                  href="/auth/login"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
