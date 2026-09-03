import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ReporterAuthGuard } from "@/components/auth/ReporterAuthGuard";

export const metadata: Metadata = {
  title: "Reporter Studio | Edition TV",
  description: "Journalist Workspace — Story Pipeline, Drafts, Research Notes & Field Uploads",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-background text-foreground flex overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ReporterAuthGuard>{children}</ReporterAuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
