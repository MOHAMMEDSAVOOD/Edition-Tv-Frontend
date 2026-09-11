import { SectionDivider } from "@/components/news/SectionDivider";
import { Cookie, ShieldCheck, Settings } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Cookie Policy & Preferences | Edition TV",
  description: "Learn how Edition TV uses cookies and similar technologies, and manage your consent preferences.",
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8 font-sans">
      <div className="border-b border-border pb-8 mb-12">
        <span className="section-label block mb-2">Legal & Privacy</span>
        <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Cookie Policy & Settings
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Edition TV respects your privacy. This policy explains what cookies are, how we use them on our website, and how you can control your preferences.
        </p>
      </div>

      <section className="mb-12 space-y-6">
        <SectionDivider label="What Are Cookies?" />
        <p className="text-base text-foreground/90 leading-relaxed">
          Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you logged in, and analyze site performance.
        </p>
      </section>

      <section className="mb-12 space-y-6">
        <SectionDivider label="Types of Cookies We Use" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-card border border-border rounded-sm p-6 space-y-3">
            <div className="h-10 w-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Essential Cookies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Required for basic site navigation, authentication, and security. These cannot be disabled.
            </p>
          </div>

          <div className="bg-card border border-border rounded-sm p-6 space-y-3">
            <div className="h-10 w-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cookie className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Analytics Cookies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Help us measure reader traffic, popular articles, and improve site performance anonymously.
            </p>
          </div>

          <div className="bg-card border border-border rounded-sm p-6 space-y-3">
            <div className="h-10 w-10 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
              <Settings className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Preference Cookies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Remember your font size choices, dark mode settings, and saved reading lists across sessions.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 border border-border rounded-sm p-8 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Managing Your Preferences</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You can adjust your browser settings to reject non-essential cookies at any time. For more information about how we process user data, please read our{" "}
          <Link href="/privacy" className="text-primary hover:underline font-semibold">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
