import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AnalyticsAuthGuard } from "@/components/analytics/AnalyticsAuthGuard";

export const metadata: Metadata = {
  title: "Analytics & Telemetry | Edition TV",
  description: "Grafana & GA4 Style Real-time Reader Analytics, Content Performance, and Demographics Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning style={{ colorScheme: "dark" }}>
      <body className="h-full bg-background text-foreground flex overflow-hidden font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AnalyticsAuthGuard>{children}</AnalyticsAuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
