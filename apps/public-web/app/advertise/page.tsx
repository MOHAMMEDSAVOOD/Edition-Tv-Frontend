import { SectionDivider } from "@/components/news/SectionDivider";
import { Megaphone, Target, BarChart3, ShieldCheck, Mail } from "lucide-react";

export const metadata = {
  title: "Advertise with Edition TV | Media Kit & Partnerships",
  description: "Reach an engaged audience of 94 million monthly readers with Edition TV display, video, newsletter, and event sponsorships.",
};

export default function AdvertisePage() {
  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8 font-sans">
      <div className="border-b border-border pb-8 mb-12">
        <span className="section-label block mb-2">Commercial Partnerships</span>
        <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Advertise with Edition TV
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Connect your brand with high-intent decision makers, business leaders, policy makers, and global citizens across our digital publishing network.
        </p>
      </div>

      <section className="mb-16">
        <SectionDivider label="Audience Insights" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Monthly Unique Readers", value: "94M+" },
            { label: "Executive & C-Suite Readers", value: "38%" },
            { label: "Average Session Duration", value: "4m 12s" },
            { label: "Newsletter Subscribers", value: "1.2M+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-sm p-6 text-center space-y-2">
              <div className="text-3xl font-extrabold text-primary font-mono">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <SectionDivider label="Advertising Formats" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: "High-Impact Display",
              desc: "Brand safety guaranteed display ads, hero banners, and inline interactive units across web and mobile.",
            },
            {
              icon: BarChart3,
              title: "Native & Newsletter Sponsorships",
              desc: "Sponsor our flagship morning briefings, edition roundups, and special industry reports.",
            },
            {
              icon: Megaphone,
              title: "Video & Live Stream Ads",
              desc: "Pre-roll, mid-roll, and branded content integrations on Edition TV Live and video feeds.",
            },
          ].map((format) => (
            <div key={format.title} className="bg-card border border-border rounded-sm p-6 space-y-3">
              <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center">
                <format.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-lg">{format.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{format.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 border border-border rounded-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-foreground">Editorial Independence Guarantee</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Edition TV strictly separates commercial operations from editorial newsrooms. Advertisers have zero influence over news coverage, story selection, or editorial opinion. All sponsored content is clearly labeled in compliance with FTC and ASA standards.
        </p>

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-foreground text-sm">Request Media Kit & Rate Card</div>
            <div className="text-xs text-muted-foreground">Contact our advertising team directly</div>
          </div>
          <a
            href="mailto:ads@edition.tv"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            <Mail className="h-4 w-4" /> Email Advertising Desk (ads@edition.tv)
          </a>
        </div>
      </section>
    </div>
  );
}
