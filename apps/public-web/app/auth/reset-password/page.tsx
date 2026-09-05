"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { userRepository } from "@/repositories/userRepository";
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialEmail = searchParams?.get("email") || "";
  const initialOtpCode = searchParams?.get("otpCode") || searchParams?.get("otp") || "";
  const initialResetToken = searchParams?.get("resetToken") || searchParams?.get("token") || "";

  const [step, setStep] = useState<"VERIFY_OTP" | "ENTER_PASSWORD">(
    initialResetToken || (initialEmail && initialOtpCode) ? "ENTER_PASSWORD" : "VERIFY_OTP"
  );

  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState(initialOtpCode);
  const [resetToken, setResetToken] = useState(initialResetToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

    if (!email.trim() || !otpCode.trim()) {
      setErrorMsg("Email address and 6-digit verification code are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await userRepository.verifyOtp(email.trim(), otpCode.trim());
      if (res && res.valid) {
        if (res.resetToken || res.token) {
          setResetToken(res.resetToken || res.token || "");
        }
        setStep("ENTER_PASSWORD");
      } else {
        setErrorMsg(res.message || "Invalid or expired OTP code. Please check your email.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
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
    try {
      await userRepository.resetPassword({
        email: email.trim(),
        otpCode: otpCode.trim(),
        resetToken: resetToken.trim() || undefined,
        newPassword,
      });

      setSuccess(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to reset password. Please verify your OTP code.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white py-8 px-4 shadow-md sm:rounded-xl border border-slate-200 sm:px-10 text-center space-y-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900">
            Password Reset Successful!
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Your Edition TV account password has been updated. You can now sign in with your new password.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-full py-3 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition"
          >
            Sign In Now &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 shadow-md sm:rounded-xl border border-slate-200 sm:px-10">
      {/* Stepper Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">1</span>
          Request OTP
        </div>
        <div className="h-px bg-slate-200 flex-1 mx-3" />
        <div className={`flex items-center gap-2 text-xs font-semibold ${step === "VERIFY_OTP" ? "text-sky-600" : "text-slate-400"}`}>
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">2</span>
          Verify OTP
        </div>
        <div className="h-px bg-slate-200 flex-1 mx-3" />
        <div className={`flex items-center gap-2 text-xs font-semibold ${step === "ENTER_PASSWORD" ? "text-sky-600 font-bold" : "text-slate-400"}`}>
          <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-[10px]">3</span>
          New Password
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2 font-mono">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {step === "VERIFY_OTP" ? (
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-700 tracking-wider mb-1.5">
              Account Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2.5 border border-slate-300 bg-white rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
            />
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <ShieldCheck className="h-4 w-4" />
            {loading ? "Verifying Code..." : "Verify Code & Set Password →"}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Request New OTP Code
            </Link>
          </div>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleResetPassword}>
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between font-mono">
            <span>OTP Verified for <strong>{email}</strong></span>
            <button
              type="button"
              onClick={() => setStep("VERIFY_OTP")}
              className="underline text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
            >
              Change
            </button>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-700 tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 border border-slate-300 bg-white rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Must be at least 8 characters with uppercase, lowercase, and a number or special character.
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-700 tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-slate-300 bg-white rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <KeyRound className="h-4 w-4" />
            {loading ? "Updating Password..." : "Update Password & Sign In"}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-sky-600 hover:text-sky-500"
            >
              &larr; Return to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-16 sm:px-6 lg:px-8 font-sans select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Edition TV Logo" width={180} height={60} className="h-12 w-auto object-contain" />
        </Link>
        <h2 className="text-center text-3xl font-serif font-bold text-slate-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 mb-6">
          Step 3: Enter your new password to complete account recovery.
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
