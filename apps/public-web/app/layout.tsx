import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BottomNav } from "@/components/layout/BottomNav";
import { BreakingTicker } from "@/components/news/BreakingTicker";
import { KeyboardShortcutsModal } from "@/components/common/KeyboardShortcutsModal";
export const metadata: Metadata = {
  title: { default: "Edition TV — Global Digital Journalism", template: "%s | Edition TV" },
  description: "Independent breaking news, live event coverage, investigative reporting, and expert analysis.",
  metadataBase: new URL("https://editiontv.com"),
  openGraph: { type: "website", locale: "en_US", siteName: "Edition TV" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground pb-16 md:pb-0 overflow-x-hidden" suppressHydrationWarning>
          <BreakingTicker />
          <SiteHeader />
          <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
          <SiteFooter />
          <BottomNav />
          <KeyboardShortcutsModal />
      </body>
    </html>
  );
}
