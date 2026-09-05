"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { userRepository } from "@/repositories/userRepository";
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await userRepository.forgotPassword(email.trim());
      setSuccessMsg(res.message || "OTP code has been sent to your email address.");
      // Transition to Step 2: Verify OTP
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-16 sm:px-6 lg:px-8 font-sans select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Edition TV Logo" width={180} height={60} className="h-12 w-auto object-contain" />
        </Link>
        <h2 className="text-center text-3xl font-serif font-bold text-slate-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Step 1: Enter your account email address to receive a 6-digit verification code.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-xl border border-slate-200 sm:px-10">
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2 font-mono">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start gap-2 font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs uppercase font-bold text-slate-700 tracking-wider mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
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
              {loading ? "Requesting OTP Code..." : "Send OTP Code"}
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
        </div>
      </div>
    </div>
  );
}
