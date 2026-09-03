import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Edition TV",
  description: "How Edition TV collects, uses, and protects your personal information. Our commitment to reader privacy.",
};

const SECTIONS = [
  {
    number: "1",
    title: "Information We Collect",
    content: `We collect the minimum information necessary to provide our services. This includes:
    
    **Account Registration**: Name, email address, and encrypted password hash when you create a reader account.
    
    **Reading Preferences**: Content preferences, followed topics, followed correspondents, and saved articles — all stored locally in your browser by default.
    
    **Usage Analytics**: Aggregated, anonymized page view metrics to understand content performance. We do not store personally identifiable telemetry linked to individual browsing sessions.
    
    **Comments**: Content you submit in reader discussions, which is subject to our Community Guidelines.`,
  },
  {
    number: "2",
    title: "How We Use Your Information",
    content: `Your information is used exclusively to deliver and improve the Edition TV service:
    
    — To authenticate your account and maintain session security
    — To personalize your content feed based on your stated preferences
    — To send editorial alerts you have explicitly subscribed to
    — To enforce our Community Discussion Guidelines
    — To generate anonymized aggregate analytics on content performance
    
    We do not sell, rent, or trade your personal information to any third party under any circumstances.`,
  },
  {
    number: "3",
    title: "Cookies and Local Storage",
    content: `We use cookies and browser local storage for the following purposes:
    
    **Strictly Necessary**: Session tokens, CSRF protection tokens, and theme preferences. Cannot be disabled.
    
    **Functional**: Saved article lists, reading progress, and notification preferences. Stored locally in your browser.
    
    **Analytics**: Anonymized content performance metrics using a first-party analytics system. No third-party tracking pixels or advertising cookies are used on Edition TV.`,
  },
  {
    number: "4",
    title: "Data Retention",
    content: `Account data is retained for as long as your account is active. If you close your account, your personal data is deleted within 30 days. Comment history is anonymized within 90 days of account deletion. Aggregated analytics data contains no personal identifiers and is retained indefinitely for editorial planning purposes.`,
  },
  {
    number: "5",
    title: "Your Rights (GDPR / CCPA)",
    content: `Depending on your jurisdiction, you have the right to:
    
    — Access all personal data we hold about you
    — Correct inaccurate data
    — Request deletion of your account and personal data
    — Object to data processing
    — Receive your data in a portable format
    — Withdraw consent at any time for non-essential processing
    
    To exercise these rights, contact privacy@edition.tv with the subject line "Data Rights Request".`,
  },
  {
    number: "6",
    title: "Security",
    content: `Edition TV uses industry-standard security practices including TLS 1.3 encryption for all data in transit, bcrypt password hashing, rate limiting on authentication endpoints, and regular third-party security audits. We disclose all significant security incidents to affected users within 72 hours of detection.`,
  },
  {
    number: "7",
    title: "Children's Privacy",
    content: `Edition TV is not directed at children under the age of 16. We do not knowingly collect personal information from users under 16. If we become aware that a user is under 16, we will promptly delete their account data. If you believe a child has provided us with their personal information, contact privacy@edition.tv immediately.`,
  },
  {
    number: "8",
    title: "Changes to This Policy",
    content: `We will notify registered readers by email at least 14 days before implementing material changes to this Privacy Policy. The date of the most recent update is always displayed at the top of this page. Continued use of Edition TV after the effective date constitutes acceptance of the updated terms.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-screen-md px-4 py-8 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-10">
        <span className="section-label block mb-2 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> Legal & Compliance
        </span>
        <h1 className="headline-xl text-3xl sm:text-4xl font-extrabold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Last updated: August 7, 2026 · Effective: August 7, 2026
        </p>
      </div>

      {/* Intro */}
      <div className="bg-primary/5 border-l-4 border-primary p-5 rounded-r-sm mb-10">
        <p className="text-sm text-foreground/90 leading-relaxed">
          Edition TV is committed to protecting your privacy. This policy explains exactly what data we collect, why we collect it, and how we use it. We will never sell your data to third parties. Our business model is based on reader subscriptions and editorial quality — not surveillance advertising.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.number} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex-none h-7 w-7 rounded-full bg-primary text-black font-black text-xs flex items-center justify-center font-mono">
                {section.number}
              </span>
              <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
            </div>
            <div className="border-l-2 border-border pl-6 ml-3.5">
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-12 pt-8 border-t border-border bg-muted/40 -mx-4 px-4 py-6">
        <div className="text-sm font-bold text-foreground mb-1">Questions about your privacy?</div>
        <p className="text-sm text-muted-foreground mb-3">
          Our Data Protection Officer is available to answer questions about how Edition TV handles your personal information.
        </p>
        <div className="text-sm font-semibold text-primary">privacy@edition.tv</div>
        <div className="text-xs text-muted-foreground font-mono mt-1">Response guaranteed within 48 hours on business days.</div>
      </div>
    </div>
  );
}
