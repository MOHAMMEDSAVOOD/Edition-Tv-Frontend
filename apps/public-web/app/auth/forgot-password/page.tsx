"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { userRepository } from "@/repositories/userRepository";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await userRepository.forgotPassword(email);
    if (res && res.message) {
      setSubmitted(true);
    } else {
      setErrorMsg("Unable to process password reset request. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50  flex flex-col justify-center py-16 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Edition TV Logo" width={180} height={60} className="h-12 w-auto object-contain " />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-slate-900 ">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 ">
          Enter your account email address to receive password reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white  py-8 px-4 shadow sm:rounded-xl border border-slate-200  sm:px-10">
          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50  border border-emerald-200  text-emerald-800  rounded-lg text-sm">
                <p className="font-bold mb-1">Request Received</p>
                <p className="text-xs text-emerald-700 ">
                  If an account with that email address exists, password reset instructions have been sent to your inbox.
                </p>
              </div>

              <div className="p-3 bg-amber-50  border border-amber-200  text-amber-800  rounded-lg text-xs space-y-1">
                <p className="font-bold">🛠 Local Development Mail Sink:</p>
                <p>
                  Check your terminal backend log or <code className="font-mono text-[11px] bg-amber-100  px-1 py-0.5 rounded">logs/dev-password-resets.log</code> for the generated reset token & link.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/auth/reset-password"
                  className="block w-full text-center px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-lg transition"
                >
                  Enter Reset Token & Set New Password →
                </Link>
                <Link
                  href="/auth/login"
                  className="block w-full text-center px-4 py-2.5 border border-slate-300  text-slate-700  font-semibold text-sm rounded-lg hover:bg-slate-100 :bg-slate-800 transition"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="p-3 bg-rose-50  border border-rose-200  text-rose-800  text-xs rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase font-semibold text-slate-600  mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reader@editiontv.com"
                  className="w-full px-3 py-2 border border-slate-300  bg-white  rounded-lg text-sm text-slate-900  focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900  text-white  font-semibold text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Sending Reset Request..." : "Send Reset Instructions"}
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
      </div>
    </div>
  );
}
