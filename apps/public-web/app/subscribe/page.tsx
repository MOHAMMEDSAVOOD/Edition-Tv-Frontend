import { SectionDivider } from "@/components/news/SectionDivider";
import { Check, X, Shield, Star, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Subscribe | Edition TV",
  description: "Support independent journalism. Get unlimited digital access to breaking news, exclusive investigations, and ad-free reading.",
};

export default function SubscribePage() {
  const tiers = [
    {
      name: "Basic Access",
      price: "Free",
      description: "Essential news and breaking updates for casual readers.",
      icon: Shield,
      features: [
        { name: "5 free articles per month", included: true },
        { name: "Breaking news alerts", included: true },
        { name: "The Daily Briefing newsletter", included: true },
        { name: "Unlimited investigative reports", included: false },
        { name: "Ad-free experience", included: false },
        { name: "Commenting privileges", included: false },
      ],
      cta: "Sign Up Free",
      variant: "outline" as const,
    },
    {
      name: "Digital Premium",
      price: "$12",
      period: "/month",
      description: "Unlimited access to all journalism, features, and subscriber exclusives.",
      icon: Star,
      popular: true,
      features: [
        { name: "Unlimited digital articles", included: true },
        { name: "All premium newsletters", included: true },
        { name: "Unlimited investigative reports", included: true },
        { name: "Ad-free experience", included: true },
        { name: "Commenting privileges", included: true },
        { name: "Exclusive live Q&A with editors", included: true },
      ],
      cta: "Subscribe Now",
      variant: "default" as const,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Corporate access for teams, universities, and organizations.",
      icon: Building2,
      features: [
        { name: "Everything in Digital Premium", included: true },
        { name: "Centralized team billing", included: true },
        { name: "IP-based authentication", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "API access to archives", included: true },
        { name: "Custom newsletter curation", included: true },
      ],
      cta: "Contact Sales",
      variant: "outline" as const,
    }
  ];

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-12 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="section-label inline-block mb-3">Support Our Journalism</span>
        <h1 className="headline-xl text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight">
          Truth isn&apos;t free.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Edition TV is funded by readers, not corporate interests. Your subscription ensures our reporters can continue to uncover the truth without compromise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {tiers.map((tier) => (
          <div 
            key={tier.name} 
            className={`relative flex flex-col bg-card rounded-md border ${tier.popular ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-border'} p-8`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <tier.icon className={`h-8 w-8 mb-4 ${tier.popular ? 'text-primary' : 'text-muted-foreground'}`} />
              <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
              <p className="text-sm text-muted-foreground min-h-[40px]">{tier.description}</p>
            </div>
            
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-extrabold text-foreground">{tier.price}</span>
              {tier.period && <span className="text-muted-foreground ml-1">{tier.period}</span>}
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start text-sm">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/40 mr-3 shrink-0" />
                  )}
                  <span className={feature.included ? 'text-foreground' : 'text-muted-foreground line-through'}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
            
            <Button variant={tier.variant} className="w-full font-bold h-12">
              {tier.cta}
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-muted/30 border border-border rounded-sm p-8 max-w-4xl mx-auto">
        <SectionDivider label="Frequently Asked Questions" />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-foreground mb-2">Can I cancel at any time?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">Yes. You can manage or cancel your subscription at any time from your Account Settings. Your access will remain active until the end of your current billing cycle.</p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Do you offer student discounts?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">Yes, verified students and educators receive a 50% discount on Digital Premium. Contact support with your .edu email to claim.</p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Why do you have a paywall?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">Independent journalism requires resources. Relying on advertising alone incentivizes clickbait. Reader subscriptions allow us to focus on quality and truth.</p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">How does the free tier work?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">Registered users can read up to 5 standard articles per month for free. Highly resourced investigative pieces require a Premium subscription.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
