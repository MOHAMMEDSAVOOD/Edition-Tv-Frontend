"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { userRepository } from "@/repositories/userRepository";
import { KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialToken = searchParams?.get("token") || "";
  const initialEmail = searchParams?.get("email") || "";
  const initialOtp = searchParams?.get("otp") || "";

  const [step, setStep] = useState<"VERIFY_OTP" | "ENTER_PASSWORD">(
    initialToken ? "ENTER_PASSWORD" : "VERIFY_OTP"
  );

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(initialOtp);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasSpecialOrDigit = /[0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pass);
    if (!hasUpper || !hasLower || !hasSpecialOrDigit) {
      return "Password must contain uppercase, lowercase, and a number or special character.";
    }
    return null;
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim() || !otp.trim()) {
      setErrorMsg("Email address and 6-digit OTP code are required.");
      return;
    }

    setLoading(true);
    const res = await userRepository.verifyOtp(email.trim(), otp.trim());
    if (res && res.valid) {
      if (res.token) {
        setToken(res.token);
      }
      setStep("ENTER_PASSWORD");
    } else {
      setErrorMsg("Invalid or expired OTP code. Please check your email.");
    }
    setLoading(false);
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
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await userRepository.resetPassword({
      token: token.trim() || undefined,
      email: email.trim() || undefined,
      otp: otp.trim() || undefined,
      newPassword,
    });

    if (res && res.message) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);
    } else {
      setErrorMsg("Failed to reset password. Token or OTP code may be invalid, expired, or used.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-white  py-8 px-4 shadow sm:rounded-xl border border-slate-200  sm:px-10 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100  text-emerald-600 ">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-900 ">
          Password Reset Complete!
        </h3>
        <p className="text-sm text-slate-600 ">
          Your password has been successfully updated. Redirecting to login page...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white  py-8 px-4 shadow sm:rounded-xl border border-slate-200  sm:px-10">
      {/* Stepper Header */}
      <div className="flex items-center justify-between border-b border-slate-100  pb-4 mb-6">
        <div className={`flex items-center gap-2 text-xs font-semibold ${step === "VERIFY_OTP" ? "text-sky-600 " : "text-slate-400"}`}>
          <span className="w-5 h-5 rounded-full bg-slate-100  flex items-center justify-center text-[10px]">1</span>
          Verify OTP Code
        </div>
        <div className="h-px bg-slate-200  flex-1 mx-4" />
        <div className={`flex items-center gap-2 text-xs font-semibold ${step === "ENTER_PASSWORD" ? "text-sky-600 " : "text-slate-400"}`}>
          <span className="w-5 h-5 rounded-full bg-slate-100  flex items-center justify-center text-[10px]">2</span>
          Set New Password
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-rose-50  border border-rose-200  text-rose-800  text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      {step === "VERIFY_OTP" ? (
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-600  mb-1">
              Account Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@editiontv.com"
              className="w-full px-3 py-2 border border-slate-300  bg-white  rounded-lg text-sm text-slate-900  focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-slate-600  mb-1">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full px-3 py-2 border border-slate-300  bg-white  rounded-lg text-lg tracking-widest text-center font-mono font-bold text-slate-900  focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            {loading ? "Verifying OTP Code..." : "Verify OTP Code →"}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 :text-slate-300"
            >
              Request New OTP Code
            </Link>
          </div>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleResetPassword}>
          <div className="p-3 bg-emerald-50  border border-emerald-200  text-emerald-800  rounded-lg text-xs flex items-center justify-between">
            <span>OTP Verified for <strong>{email}</strong></span>
            <button
              type="button"
              onClick={() => setStep("VERIFY_OTP")}
              className="underline text-[11px] font-semibold text-emerald-700 "
            >
              Change OTP
            </button>
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-slate-600  mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300  bg-white  rounded-lg text-sm text-slate-900  focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Must be at least 8 characters with uppercase, lowercase, and number/special char.
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-slate-600  mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300  bg-white  rounded-lg text-sm text-slate-900  focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900  text-white  font-semibold text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <KeyRound className="h-4 w-4" />
            {loading ? "Updating Password..." : "Update Password & Sign In"}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-sky-600 hover:text-sky-500"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50  flex flex-col justify-center py-16 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Edition TV Logo" width={180} height={60} className="h-12 w-auto object-contain " />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-slate-900 ">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600  mb-6">
          Verify your OTP code and set your new Edition TV account password.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
