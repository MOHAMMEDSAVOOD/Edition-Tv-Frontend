import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In | Edition TV Reader Account",
  description: "Sign in to your Edition TV account to access saved stories and personalized newsletters.",
};

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="bg-card border border-border p-8 rounded-sm shadow-xs space-y-6">
        <div className="text-center space-y-1 border-b border-border pb-6">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Edition TV Logo" width={180} height={60} className="h-12 w-auto object-contain " />
        </Link>
          <h1 className="headline-lg text-2xl font-bold">Sign In to Your Account</h1>
          <p className="text-xs text-muted-foreground">Access your saved reading list, subscriber preferences, and newsletters.</p>
        </div>

        <LoginForm />

        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          Don&apos;t have an account yet?{" "}
          <Link href="/auth/register" className="font-semibold text-primary hover:underline">
            Create a Free Reader Account
          </Link>
        </div>
      </div>
    </div>
  );
}
