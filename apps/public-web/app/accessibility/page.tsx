import { SectionDivider } from "@/components/news/SectionDivider";
import { Eye, Keyboard, Type, MousePointerClick, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Accessibility Statement | Edition TV",
  description: "Edition TV is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone.",
};

export default function AccessibilityPage() {
  const features = [
    {
      icon: Eye,
      title: "Visual Clarity & Contrast",
      description: "Our typography and color systems are designed to exceed WCAG AA contrast ratios, ensuring readability for users with low vision or color blindness."
    },
    {
      icon: Keyboard,
      title: "Keyboard Navigation",
      description: "All interactive elements, menus, and forms can be navigated and operated using only a keyboard, without requiring a mouse."
    },
    {
      icon: Type,
      title: "Screen Reader Support",
      description: "We use semantic HTML and ARIA landmarks to ensure our content is logically structured and understandable when read by screen reading software."
    },
    {
      icon: MousePointerClick,
      title: "Reduced Motion",
      description: "We respect operating system preferences for reduced motion, disabling non-essential animations for users with vestibular disorders."
    }
  ];

  return (
    <div className="container mx-auto max-w-[900px] px-4 md:px-6 py-12 font-sans">
      <div className="border-b border-border pb-8 mb-12">
        <span className="section-label block mb-2">Legal & Compliance</span>
        <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Accessibility Statement
        </h1>
        <p className="text-base text-muted-foreground">
          Last updated: August 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none mb-16">
        <p className="text-lg leading-relaxed text-foreground/90">
          Edition TV is committed to making our journalism accessible to everyone, including individuals with visual, auditory, motor, or cognitive disabilities. We believe that independent, high-quality information is a fundamental right, and our digital platforms must reflect that commitment.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Our Standard</h2>
        <p className="text-base leading-relaxed text-foreground/80 mb-6">
          We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level. These guidelines, set by the World Wide Web Consortium (W3C), define how to make web content more accessible to people with disabilities.
        </p>

        <SectionDivider label="Key Features" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-12">
          {features.map((feature) => (
            <div key={feature.title} className="bg-card border border-border p-5 rounded-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary/10 p-2 rounded text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-foreground m-0">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed m-0">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Ongoing Efforts</h2>
        <p className="text-base leading-relaxed text-foreground/80 mb-6">
          Accessibility is not a one-time project, but a continuous effort. We regularly evaluate our platforms using automated testing tools and manual audits by accessibility experts. When we integrate third-party tools (such as video players or interactive data visualizations), we hold our vendors to these same strict standards.
        </p>

        <div className="bg-muted/40 border border-border rounded-sm p-6 flex flex-col md:flex-row gap-6 items-start mt-10">
          <div className="bg-primary/10 p-3 rounded-full shrink-0">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2 m-0">Feedback & Support</h3>
            <p className="text-sm text-foreground/80 leading-relaxed mb-4 m-0">
              If you experience any difficulty accessing our content, or if you have suggestions on how we can improve the accessibility of Edition TV, we want to hear from you. We aim to respond to all accessibility feedback within 48 hours.
            </p>
            <div className="font-mono text-sm">
              <a href="mailto:accessibility@edition.tv" className="text-primary hover:underline font-bold">accessibility@edition.tv</a>
              <span className="mx-3 text-muted-foreground">|</span>
              <span className="text-foreground">+44 20 7946 0960 (UK)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
