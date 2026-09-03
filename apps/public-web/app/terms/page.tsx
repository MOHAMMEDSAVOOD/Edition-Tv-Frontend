import { Scale } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Edition TV",
  description: "Edition TV Terms of Service — the rules and obligations governing use of our digital news platform.",
};

const SECTIONS = [
  {
    number: "1",
    title: "Acceptance of Terms",
    content: `By accessing Edition TV through any platform (web, mobile, API, or RSS), you agree to these Terms of Service and our Privacy Policy. If you do not agree, you must discontinue use of the service immediately.

These Terms constitute a legally binding agreement between you and Edition TV Limited, a company incorporated in England and Wales (Company No. 11847632), with registered offices at 120 Fleet Street, London EC4A 2BE.`,
  },
  {
    number: "2",
    title: "Intellectual Property",
    content: `All journalism, investigative reports, live blog updates, photography, video, audio, data visualizations, and digital editions published on Edition TV are protected by copyright. Reproduction of more than 150 words of any article, or any photograph or video, requires explicit written permission from the Edition TV Rights Desk (rights@edition.tv).

Limited quotation for journalistic commentary, academic citation, or nonprofit news analysis is permitted under fair use/fair dealing doctrines, provided the source is clearly attributed as "Edition TV" with a link to the original article.`,
  },
  {
    number: "3",
    title: "Reader Accounts",
    content: `Reader accounts are provided for personal, non-commercial use only. You are responsible for maintaining the security of your account credentials. Edition TV is not liable for losses arising from unauthorized account access due to your failure to secure your login credentials.

You must not create accounts using false identity information, create multiple accounts to evade moderation bans, or use automated means to create accounts.`,
  },
  {
    number: "4",
    title: "Community Discussion Guidelines",
    content: `Reader comments on Edition TV must comply with our Community Discussion Standards:

— Comments must be relevant to the article under discussion
— No personal attacks, harassment, or abuse of other readers or journalists
— No disinformation, deliberately false factual claims, or conspiracy theories
— No content that is hateful on the basis of race, gender, religion, sexual orientation, or disability
— No spam, promotional content, or repetitive posting

Comments are evaluated by real-time AI moderation with human editorial review. The 3-Strike Policy applies: three upheld violations result in a permanent ban without appeal.`,
  },
  {
    number: "5",
    title: "AI-Assisted Features",
    content: `Edition TV uses artificial intelligence in the following disclosed ways:

— **AI Executive Summaries**: Key takeaway bullets on articles are AI-generated and clearly labeled.
— **Comment Moderation**: First-pass toxicity screening is automated; final decisions on appeals are made by human moderators.
— **Content Tags and SEO Metadata**: AI assists with tagging and metadata generation. All tags are reviewed by editors.

AI tools do not write, edit, or make editorial decisions about news stories. All published journalism is written by licensed human correspondents and edited by senior editors.`,
  },
  {
    number: "6",
    title: "Subscription and Payments",
    content: `Edition TV offers both free access (with advertising) and paid subscriber tiers (ad-free, with extended archive access and priority correspondence alerts). Subscription billing is processed through Stripe. Cancellations take effect at the end of the current billing period. Refunds are not provided for partial subscription periods except where required by applicable consumer protection law.`,
  },
  {
    number: "7",
    title: "Limitation of Liability",
    content: `Edition TV publishes journalism in good faith. Our journalists endeavour to ensure all content is accurate. However, we accept no liability for any direct, indirect, incidental, or consequential damages arising from reliance on our editorial content for financial, medical, legal, or investment decisions.

News reporting, analysis, and opinion commentary should not be construed as professional advice in any regulated domain.`,
  },
  {
    number: "8",
    title: "Governing Law",
    content: `These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the Courts of England and Wales, except where mandatory consumer protection laws in your jurisdiction require otherwise.

For readers in the European Union, your statutory consumer rights under applicable EU law are not affected by these Terms.`,
  },
  {
    number: "9",
    title: "Changes to These Terms",
    content: `We will provide 14 days' advance notice of material changes to these Terms via email to registered readers. Continued use of Edition TV following the effective date of updated Terms constitutes acceptance of the revised agreement.`,
  },
];

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-screen-md px-4 py-8 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-10">
        <span className="section-label block mb-2 flex items-center gap-1.5">
          <Scale className="h-3.5 w-3.5" /> Reader Agreement
        </span>
        <h1 className="headline-xl text-3xl sm:text-4xl font-extrabold text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Last updated: August 7, 2026 · Effective: August 7, 2026
        </p>
      </div>

      {/* Intro */}
      <div className="bg-primary/5 border-l-4 border-primary p-5 rounded-r-sm mb-10">
        <p className="text-sm text-foreground/90 leading-relaxed">
          Please read these terms carefully before using Edition TV. They explain your rights and responsibilities as a reader, the rules governing our community discussions, and how Edition TV uses AI tools transparently in our editorial process.
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
        <div className="text-sm font-bold text-foreground mb-1">Legal Enquiries</div>
        <p className="text-sm text-muted-foreground mb-3">
          For legal, licensing, and rights questions, contact our Legal Affairs department.
        </p>
        <div className="text-sm font-semibold text-primary">legal@edition.tv</div>
        <div className="text-xs text-muted-foreground font-mono mt-1">
          Edition TV Limited · 120 Fleet Street, London EC4A 2BE · Company No. 11847632
        </div>
      </div>
    </div>
  );
}
