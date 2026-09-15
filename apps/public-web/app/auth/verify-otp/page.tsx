"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

function VerifyOtpNotice() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  return (
    <div className="bg-white dark:bg-[#12141a] py-8 px-5 shadow-lg sm:rounded-xl border border-border sm:px-10 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-foreground">
        Password Reset Link Dispatched
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {email ? (
          <>
            A secure password reset link has been sent to{" "}
            <span className="font-semibold text-foreground font-mono">{email}</span>.
          </>
        ) : (
          "A secure password reset link has been sent to your registered email address."
        )}
        <br />
        Please check your inbox to create a new password.
      </p>

      <div className="pt-4 space-y-2 border-t border-border mt-4">
        <Link
          href="/auth/login"
          className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 hover:opacity-90 transition"
        >
          Return to Sign In
        </Link>
        <Link
          href="/auth/forgot-password"
          className="block py-2 text-xs text-muted-foreground hover:text-foreground transition font-medium"
        >
          Didn&apos;t receive it? Request another link
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0b0d] flex flex-col justify-center py-16 sm:px-6 lg:px-8 font-sans select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Edition TV Logo" width={180} height={60} className="h-10 w-auto object-contain dark:invert" priority />
        </Link>
        <h2 className="text-center text-2xl md:text-3xl font-serif font-bold text-foreground">
          Check Your Email
        </h2>
        <p className="mt-2 text-center text-xs md:text-sm text-muted-foreground">
          We have sent password reset instructions directly to your email address.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="h-48 bg-card rounded-xl animate-pulse" />}>
          <VerifyOtpNotice />
        </Suspense>
      </div>
    </div>
  );
}
