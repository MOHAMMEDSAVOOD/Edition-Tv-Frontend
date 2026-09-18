import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@edition/auth";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { PartnerAuthGuard } from "@/components/auth/PartnerAuthGuard";

export const metadata: Metadata = {
  title: "Content Studio | Edition TV Partner Portal",
  description: "Enterprise Editorial Content Management & Publishing Studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-background text-foreground flex overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <PartnerAuthGuard>{children}</PartnerAuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
