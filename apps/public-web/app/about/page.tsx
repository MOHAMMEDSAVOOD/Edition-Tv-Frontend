import { SectionDivider } from "@/components/news/SectionDivider";
import { ShieldCheck, Cpu, Eye, Globe2, Scale, Users, Award, Mail } from "lucide-react";

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

const LEADERSHIP = [
  { name: "Catherine Blake", role: "Editor-in-Chief", since: "2021" },
  { name: "Thomas Ndlovu", role: "Managing Director, News Operations", since: "2022" },
  { name: "Dr. Yuki Tanaka", role: "Head of Editorial Standards", since: "2023" },
  { name: "Fatima Al-Rashid", role: "Director of Technology & AI Ethics", since: "2024" },
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
          Edition TV was founded in 2018 with a singular mandate: deliver rigorous, independent digital journalism that serves the public interest without compromise. Today our correspondents report from 42 countries across every major beat.
        </p>
      </div>

      {/* Mission Statement */}
      <section className="mb-16">
        <SectionDivider label="Our Mission" />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
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
          <div className="lg:col-span-2 bg-muted/40 border border-border rounded-sm p-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">At a Glance</div>
            {[
              { label: "Countries with Correspondents", value: "42" },
              { label: "Full-Time Editorial Staff", value: "340" },
              { label: "Years of Operation", value: "8" },
              { label: "Monthly Unique Readers", value: "94M" },
              { label: "Languages Published", value: "12" },
              { label: "Press Freedom Awards", value: "7" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-sm font-extrabold text-primary font-mono">{stat.value}</span>
              </div>
            ))}
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

      {/* Leadership */}
      <section className="mb-16">
        <SectionDivider label="Editorial Leadership" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {LEADERSHIP.map((leader) => (
            <div key={leader.name} className="bg-card border border-border rounded-sm p-5 space-y-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary font-black text-xl flex items-center justify-center font-serif mb-3">
                {leader.name.charAt(0)}
              </div>
              <div className="font-bold text-foreground text-sm">{leader.name}</div>
              <div className="text-xs text-muted-foreground">{leader.role}</div>
              <div className="text-xs text-muted-foreground/60 font-mono flex items-center gap-1">
                <Award className="h-3 w-3" /> Since {leader.since}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Awards */}
      <section className="mb-16">
        <SectionDivider label="Recognition" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { award: "Reuters Institute Excellence in Digital Journalism", year: "2025" },
            { award: "International Press Freedom Award (CPJ)", year: "2024" },
            { award: "Webby Award — Best News & Politics Website", year: "2024" },
            { award: "World Media Award — Breaking News Coverage", year: "2023" },
            { award: "Online Journalism Awards — Investigative Reporting", year: "2023" },
            { award: "European Press Prize — Digital Innovation", year: "2022" },
          ].map((item) => (
            <div key={item.award} className="flex items-start gap-3 bg-card border border-border rounded-sm p-4">
              <Award className="h-4 w-4 text-amber-500 flex-none mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-foreground leading-tight">{item.award}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1">{item.year}</div>
              </div>
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
