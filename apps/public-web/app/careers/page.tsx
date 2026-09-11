import { SectionDivider } from "@/components/news/SectionDivider";
import { Briefcase, Globe, Award, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Careers at Edition TV | Join Our Global Newsroom",
  description: "Explore career opportunities at Edition TV. We are hiring journalists, editors, engineers, and media professionals worldwide.",
};

const OPEN_POSITIONS = [
  {
    title: "Senior Investigative Journalist",
    department: "Editorial",
    location: "London, UK / Remote",
    type: "Full-Time",
  },
  {
    title: "Middle East Correspondent",
    department: "International Desk",
    location: "Dubai, UAE",
    type: "Full-Time",
  },
  {
    title: "Lead Frontend Engineer (Next.js & React)",
    department: "Product & Technology",
    location: "Remote",
    type: "Full-Time",
  },
  {
    title: "Video Producer & News Anchor",
    department: "Media & Broadcast",
    location: "New York, USA",
    type: "Full-Time",
  },
  {
    title: "Editorial Standards & Compliance Manager",
    department: "Editorial Operations",
    location: "London, UK",
    type: "Full-Time",
  },
];

export default function CareersPage() {
  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8 font-sans">
      <div className="border-b border-border pb-8 mb-12">
        <span className="section-label block mb-2">Join Edition TV</span>
        <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Build the Future of Independent Journalism
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Edition TV is an independent digital news organization. We bring together courageous reporters, world-class editors, and innovative engineers to inform millions of readers daily.
        </p>
      </div>

      <section className="mb-16">
        <SectionDivider label="Why Work With Us" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Globe,
              title: "Global Reach",
              desc: "Collaborate with correspondents in 42 countries serving 94 million readers.",
            },
            {
              icon: Award,
              title: "Editorial Freedom",
              desc: "Uncompromising standards with zero political or advertiser interference.",
            },
            {
              icon: Briefcase,
              title: "Modern Tech Stack",
              desc: "Build next-gen newsroom technology using Next.js 15, TypeScript, and AI tools.",
            },
            {
              icon: Heart,
              title: "Competitive Benefits",
              desc: "Full healthcare, flexible working, mental health stipends, and generous PTO.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-border rounded-sm p-6 space-y-3">
              <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-base">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <SectionDivider label="Open Roles" />
        <div className="mt-6 space-y-4">
          {OPEN_POSITIONS.map((role) => (
            <div
              key={role.title}
              className="bg-card border border-border rounded-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 transition-colors"
            >
              <div>
                <h3 className="font-bold text-lg text-foreground">{role.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="bg-muted px-2.5 py-1 rounded font-medium text-foreground">{role.department}</span>
                  <span>{role.location}</span>
                  <span>•</span>
                  <span>{role.type}</span>
                </div>
              </div>
              <Link
                href={`/contact?subject=Career%20Application:%20${encodeURIComponent(role.title)}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline self-start sm:self-auto"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 border border-border rounded-sm p-8 text-center space-y-3">
        <h2 className="text-xl font-bold text-foreground">Don&apos;t see a matching role?</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          We are always looking for exceptional investigative reporters, editors, and engineers. Send your resume and portfolio to our talent team.
        </p>
        <div className="pt-2">
          <a
            href="mailto:careers@edition.tv"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            Email Talent Team (careers@edition.tv)
          </a>
        </div>
      </section>
    </div>
  );
}
