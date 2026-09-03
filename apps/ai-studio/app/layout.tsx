import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AiAuthGuard } from "@/components/auth/AiAuthGuard";

export const metadata: Metadata = {
  title: "AI Studio & Workbench | Edition TV",
  description: "Enterprise Multi-Model AI Studio, Headline Generator, Image Gen & Toxicity Moderation Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning style={{ colorScheme: "dark" }}>
      <body className="h-full bg-background text-foreground flex overflow-hidden font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AiAuthGuard>{children}</AiAuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
