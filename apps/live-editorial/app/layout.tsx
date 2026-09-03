import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LiveAuthGuard } from "@/components/auth/LiveAuthGuard";

export const metadata: Metadata = {
  title: "Live Editorial Control Room | Edition TV",
  description: "Bloomberg Terminal Style Breaking Control Room & Wire Feed Stream",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning style={{ colorScheme: "dark" }}>
      <body className="h-full bg-background text-foreground flex overflow-hidden font-mono">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LiveAuthGuard>{children}</LiveAuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
