"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { userRepository } from "@/repositories/userRepository";
import { ShieldCheck, ArrowRight, AlertCircle, Mail } from "lucide-react";

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialEmail = searchParams?.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }

    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMsg("Please enter a valid OTP verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await userRepository.verifyOtp(email.trim(), otpCode.trim());
      if (res && res.valid) {
        const tokenVal = res.resetToken || res.token || "";
        router.push(
          `/auth/reset-password?email=${encodeURIComponent(email.trim())}&otpCode=${encodeURIComponent(otpCode.trim())}&resetToken=${encodeURIComponent(tokenVal)}`
        );
      } else {
        setErrorMsg(res.message || "Invalid or expired OTP code. Please try again.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-4 shadow-md sm:rounded-xl border border-slate-200 sm:px-10">
      {/* Stepper Indicator */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">1</span>
          Request OTP
        </div>
        <div className="h-px bg-slate-200 flex-1 mx-3" />
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-600">
          <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-[10px] font-bold">2</span>
          Verify OTP
        </div>
        <div className="h-px bg-slate-200 flex-1 mx-3" />
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">3</span>
          New Password
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2 font-mono">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs uppercase font-bold text-slate-700 tracking-wider mb-1.5">
            Email Address
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

        <div>
          <label className="block text-xs uppercase font-bold text-slate-700 tracking-wider mb-1.5">
            6-Digit Verification Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full px-3 py-3 border border-slate-300 bg-slate-50 focus:bg-white rounded-lg text-xl tracking-widest text-center font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <p className="mt-1.5 text-[11px] text-slate-500 text-center font-mono">
            Check your inbox for the 6-digit code sent to your email.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          <ShieldCheck className="h-4 w-4" />
          {loading ? "Verifying Code..." : "Verify Code & Proceed"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="text-center pt-2 flex items-center justify-between text-xs">
          <Link href="/auth/forgot-password" className="font-semibold text-slate-500 hover:text-slate-700">
            Resend OTP Code
          </Link>
          <Link href="/auth/login" className="font-semibold text-sky-600 hover:text-sky-500">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-16 sm:px-6 lg:px-8 font-sans select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Edition TV Logo" width={180} height={60} className="h-12 w-auto object-contain" />
        </Link>
        <h2 className="text-center text-3xl font-serif font-bold text-slate-900">
          Verify Email OTP
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Step 2: Enter the verification code sent to your email address.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading form...</div>}>
          <VerifyOtpForm />
        </Suspense>
      </div>
    </div>
  );
}
