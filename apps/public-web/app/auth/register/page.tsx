import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Reader Account | Edition TV",
  description: "Create a free Edition TV account to save articles and customize your news stream.",
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="bg-card border border-border p-8 rounded-sm shadow-xs space-y-6">
        <div className="text-center space-y-1 border-b border-border pb-6">
          <Link href="/" className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Edition TV Logo" width={180} height={60} className="h-12 w-auto object-contain " />
          </Link>
          <h1 className="headline-lg text-2xl font-bold">Create Free Account</h1>
          <p className="text-xs text-muted-foreground">Join thousands of readers staying informed with Edition TV.</p>
        </div>

        <RegisterForm />

        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
