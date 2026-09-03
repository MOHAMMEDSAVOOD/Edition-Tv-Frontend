import { SectionDivider } from "@/components/news/SectionDivider";
import { Mail, Phone, MapPin, MessageSquare, AlertTriangle, Briefcase } from "lucide-react";

export const metadata = {
  title: "Contact Us | Edition TV",
  description: "Get in touch with Edition TV. Editorial tips, press inquiries, advertising, and technical support.",
};

export default function ContactPage() {
  const contactSections = [
    {
      icon: AlertTriangle,
      title: "News Tips & SecureDrop",
      description: "Have a confidential tip or sensitive information? Contact our investigations team securely.",
      email: "investigations@edition.tv",
      action: "Learn about SecureDrop",
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      icon: MessageSquare,
      title: "Editorial Feedback & Corrections",
      description: "Report factual errors, typos, or submit feedback to the managing editors.",
      email: "corrections@edition.tv",
      action: "View Editorial Standards",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      icon: Briefcase,
      title: "Advertising & Partnerships",
      description: "Inquire about display advertising, sponsored content, or syndication licensing.",
      email: "partnerships@edition.tv",
      action: "Download Media Kit",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      icon: Phone,
      title: "Press & Media Inquiries",
      description: "For interview requests or media relations concerning Edition TV staff.",
      email: "press@edition.tv",
      action: "Press Room",
      color: "text-amber-600",
      bg: "bg-amber-50"
    }
  ];

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8 font-sans">
      <div className="border-b border-border pb-8 mb-12">
        <span className="section-label block mb-2">Contact</span>
        <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Get in Touch
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Whether you have a breaking news tip, feedback on our coverage, or partnership inquiries, here is how you can reach the right team at Edition TV.
        </p>
      </div>

      <section className="mb-16">
        <SectionDivider label="Direct Channels" />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contactSections.map((section) => (
            <div key={section.title} className="bg-card border border-border rounded-sm p-6 flex flex-col h-full">
              <div className={`h-12 w-12 rounded flex items-center justify-center mb-4 ${section.bg}`}>
                <section.icon className={`h-6 w-6 ${section.color}`} />
              </div>
              <h3 className="font-bold text-foreground text-xl mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">
                {section.description}
              </p>
              <div className="space-y-3 pt-4 border-t border-border">
                <a href={`mailto:${section.email}`} className="flex items-center text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  {section.email}
                </a>
                <a href="#" className="inline-block text-xs font-bold uppercase tracking-wider text-primary hover:underline">
                  {section.action} &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 border border-border rounded-sm p-8">
        <SectionDivider label="Global Headquarters" />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-bold text-foreground">London (HQ)</h3>
            </div>
            <address className="not-italic text-sm text-muted-foreground leading-relaxed">
              Edition TV Newsroom<br />
              145 City Road<br />
              London, EC1V 1AW<br />
              United Kingdom<br />
              <br />
              +44 20 7946 0958
            </address>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-bold text-foreground">New York</h3>
            </div>
            <address className="not-italic text-sm text-muted-foreground leading-relaxed">
              Americas Bureau<br />
              1 World Trade Center<br />
              New York, NY 10007<br />
              United States<br />
              <br />
              +1 212 555 0198
            </address>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-bold text-foreground">Singapore</h3>
            </div>
            <address className="not-italic text-sm text-muted-foreground leading-relaxed">
              Asia-Pacific Bureau<br />
              Marina Bay Financial Centre<br />
              8 Marina Blvd<br />
              Singapore 018981<br />
              <br />
              +65 6555 0198
            </address>
          </div>
        </div>
      </section>
    </div>
  );
}
