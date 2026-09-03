import { SectionDivider } from "@/components/news/SectionDivider";
import { Zap, TrendingUp, Cpu, Coffee, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Newsletters | Edition TV",
  description: "Subscribe to Edition TV newsletters. Get daily briefings, investigative reports, and tech news delivered straight to your inbox.",
};

export default function NewslettersPage() {
  const newsletters = [
    {
      icon: Coffee,
      title: "The Daily Briefing",
      schedule: "Daily • 6:00 AM",
      description: "Start your day with the most important global headlines, curated by our morning editorial desk. Five minutes to read, essential for your day.",
      subscribers: "1.2M+",
      bg: "bg-amber-50",
      color: "text-amber-600"
    },
    {
      icon: TrendingUp,
      title: "Markets & Power",
      schedule: "Mon, Wed, Fri",
      description: "Deep dives into global finance, corporate shifts, and economic policy. Actionable insights for professionals and investors.",
      subscribers: "850K+",
      bg: "bg-blue-50",
      color: "text-blue-600"
    },
    {
      icon: Zap,
      title: "The Weekly Dispatch",
      schedule: "Sundays",
      description: "Our flagship investigative newsletter. Go behind the scenes of our biggest scoops with exclusive reporter notes and raw data.",
      subscribers: "2.1M+",
      bg: "bg-rose-50",
      color: "text-rose-600"
    },
    {
      icon: Cpu,
      title: "Tech & AI Frontier",
      schedule: "Thursdays",
      description: "Navigating the collision of technology, ethics, and society. Essential reading on AI regulations, Silicon Valley, and digital privacy.",
      subscribers: "920K+",
      bg: "bg-purple-50",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8 font-sans">
      <div className="border-b border-border pb-12 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <span className="section-label block mb-2">Newsletters</span>
          <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            Inbox Journalism.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Cut through the noise. Get the journalism you need, delivered directly to your inbox by the reporters who wrote it. 
          </p>
        </div>
        <div className="w-full md:w-auto bg-card border border-border p-5 rounded-sm shrink-0 shadow-sm">
          <h3 className="font-bold text-sm mb-2">Quick Subscribe to All</h3>
          <form className="flex gap-2">
            <Input type="email" placeholder="Your email address" className="max-w-[240px]" />
            <Button>Subscribe</Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            You can manage preferences at any time.
          </p>
        </div>
      </div>

      <section className="mb-16">
        <SectionDivider label="Our Portfolios" />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {newsletters.map((newsletter) => (
            <div key={newsletter.title} className="bg-card border border-border rounded-sm overflow-hidden flex flex-col">
              <div className="p-6 md:p-8 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`h-12 w-12 rounded flex items-center justify-center ${newsletter.bg}`}>
                    <newsletter.icon className={`h-6 w-6 ${newsletter.color}`} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-sm">
                    {newsletter.schedule}
                  </span>
                </div>
                <h3 className="font-bold text-2xl mb-3 text-foreground">{newsletter.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {newsletter.description}
                </p>
                
                <form className="flex gap-2">
                  <Input type="email" placeholder="Email address" className="bg-muted/50" />
                  <Button variant="secondary" className="font-bold">Add</Button>
                </form>
              </div>
              <div className="bg-muted/30 border-t border-border p-4 flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Join {newsletter.subscribers} readers</span>
                <a href="#" className="font-bold text-primary flex items-center hover:underline">
                  Read latest issue <ArrowRight className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
