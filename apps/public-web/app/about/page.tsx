import { SectionDivider } from "@/components/news/SectionDivider";
import { ShieldCheck, Cpu, Eye, Globe2, Scale, Users, Mail } from "lucide-react";

export const metadata = {
  title: "About Edition TV | Editorial Standards & Mission",
  description: "Edition TV is an independent digital journalism platform delivering breaking news, live event coverage, investigative reporting, and expert analysis.",
};

const VALUES = [
  {
    icon: ShieldCheck,
    color: "text-emerald-600 ",
    bg: "bg-emerald-50 ",
    title: "Editorial Integrity",
    description:
      "Every story passes through a multi-tier editorial workflow (DRAFT → REVIEW → APPROVE → PUBLISH) with mandatory fact-verification checkpoints. No story publishes without sign-off from a senior editor.",
  },
  {
    icon: Eye,
    color: "text-blue-600 ",
    bg: "bg-blue-50 ",
    title: "Radical Transparency",
    description:
      "When AI tools assist in summarization or metadata generation, we disclose it. Sources are always attributed. Corrections are prominently published with the original error preserved for context.",
  },
  {
    icon: Globe2,
    color: "text-amber-600 ",
    bg: "bg-amber-50 ",
    title: "Global Independence",
    description:
      "Edition TV is independently owned and accepts no government funding. Our editorial decisions are made by journalists, not advertisers, investors, or political sponsors.",
  },
  {
    icon: Scale,
    color: "text-purple-600 ",
    bg: "bg-purple-50 ",
    title: "Proportionate Coverage",
    description:
      "We calibrate coverage volume to the significance of events, not to the virality of outrage. No single political perspective is amplified for engagement metrics.",
  },
  {
    icon: Cpu,
    color: "text-rose-600 ",
    bg: "bg-rose-50 ",
    title: "AI-Assisted, Human-Led",
    description:
      "Our AI tools assist with summarization, moderation, and tagging. Every published article is written, edited, and approved by licensed human journalists. AI does not publish independently.",
  },
  {
    icon: Users,
    color: "text-indigo-600 ",
    bg: "bg-indigo-50 ",
    title: "Reader Accountability",
    description:
      "Reader comments are moderated against a public toxicity policy. We publish our moderation criteria openly and maintain an independent complaints process with 48-hour response guarantees.",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-8 mb-16">
        <span className="section-label block mb-2">About Edition TV</span>
        <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Independent Journalism.<br />Verified. Accountable. Global.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Edition TV delivers rigorous, independent digital journalism that serves the public interest without compromise.
        </p>
      </div>

      {/* Mission Statement */}
      <section className="mb-16">
        <SectionDivider label="Our Mission" />
        <div className="mt-6">
          <div className="space-y-4 max-w-3xl">
            <p className="text-base text-foreground/90 leading-relaxed">
              The media landscape is fragmenting at an unprecedented rate. Trust in journalism is at historic lows in many democracies. Algorithmic amplification rewards outrage over accuracy. Edition TV was built to stand in direct opposition to these trends.
            </p>
            <p className="text-base text-foreground/90 leading-relaxed">
              We believe that high-quality journalism — factual, proportionate, sourced, and correctable — is essential public infrastructure. Like roads and courts, it serves a democratic function that cannot be left entirely to market incentives.
            </p>
            <p className="text-base text-foreground/90 leading-relaxed">
              Our editorial model is simple: every claim must be verifiable, every source must be willing to be quoted, and every correction must be made immediately and prominently. We do not publish to provoke. We publish to inform.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Values */}
      <section className="mb-16">
        <SectionDivider label="Editorial Standards" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map((value) => (
            <div key={value.title} className="bg-card border border-border rounded-sm p-6 space-y-3">
              <div className={`h-10 w-10 rounded flex items-center justify-center ${value.bg}`}>
                <value.icon className={`h-5 w-5 ${value.color}`} />
              </div>
              <h3 className="font-bold text-foreground text-base">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-muted/40 border border-border rounded-sm p-8">
        <SectionDivider label="Contact Edition TV" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Mail, label: "Editorial Desk", address: "editorial@edition.tv" },
            { icon: Mail, label: "Press & Media Relations", address: "press@edition.tv" },
            { icon: Mail, label: "Reader Complaints", address: "standards@edition.tv" },
          ].map((contact) => (
            <div key={contact.label} className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{contact.label}</div>
              <div className="text-sm font-semibold text-primary hover:underline cursor-pointer flex items-center gap-2">
                <contact.icon className="h-3.5 w-3.5" />
                {contact.address}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
