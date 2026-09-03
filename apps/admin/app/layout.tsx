import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthGuard } from "@/components/auth/AdminAuthGuard";

export const metadata: Metadata = {
  title: "Admin Console & System Operations | Edition TV",
  description: "Platform Administration, RBAC, Feature Flags, and Audit Logging Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-background text-foreground flex overflow-hidden font-sans">
        <AdminAuthGuard>{children}</AdminAuthGuard>
      </body>
    </html>
  );
}
