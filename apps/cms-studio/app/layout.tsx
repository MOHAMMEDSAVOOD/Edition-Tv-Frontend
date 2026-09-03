import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { CmsAuthGuard } from "@/components/auth/CmsAuthGuard";

export const metadata: Metadata = {
  title: "Content Studio | Edition TV CMS",
  description: "Enterprise Editorial Content Management & Publishing Studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-background text-foreground flex overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <CmsAuthGuard>{children}</CmsAuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
