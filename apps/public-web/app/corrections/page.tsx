import { SectionDivider } from "@/components/news/SectionDivider";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { serverFetch } from "@/lib/api-client";

export const metadata = {
  title: "Corrections & Clarifications | Edition TV",
  description: "Edition TV policy on transparency, error corrections, and editorial updates.",
};

interface CorrectionItem {
  id: string;
  articleTitle: string;
  articleSlug: string;
  date: string;
  originalText: string;
  correctedText: string;
  explanation: string;
}

export default async function CorrectionsPage() {
  // Fetch real corrections from API if available
  const corrections = await serverFetch<CorrectionItem[]>("/public/corrections", { revalidate: 60 }) || [];

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8 font-sans">
      <div className="border-b border-border pb-8 mb-12">
        <span className="section-label block mb-2">Editorial Accountability</span>
        <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Corrections & Clarifications
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Edition TV is committed to accuracy and immediate transparency. When an error is identified in our reporting, we correct it promptly and document the change below.
        </p>
      </div>

      <section className="mb-12">
        <SectionDivider label="Correction Policy" />
        <div className="mt-6 bg-muted/40 border border-border rounded-sm p-6 space-y-3">
          <h2 className="font-bold text-foreground text-lg">Our Transparency Guarantee</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We do not unpublish or silently edit articles to remove factual errors. Any material change to a story after publication is acknowledged with an editor&apos;s note and logged in our public record.
          </p>
          <div className="pt-2">
            <Link
              href="/contact?subject=Correction%20Request"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Report a factual error or request a correction →
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <SectionDivider label="Recent Corrections" />
        {corrections.length === 0 ? (
          <div className="mt-6 bg-card border border-border rounded-sm p-8 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-bold text-foreground text-base">No active correction notices</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              All recent reporting has been verified against our multi-tier editorial standards. Any future corrections will be published here in real time.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {corrections.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-sm p-6 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href={`/articles/${item.articleSlug}`}
                    className="font-bold text-foreground hover:text-primary transition-colors text-base"
                  >
                    {item.articleTitle}
                  </Link>
                  <span className="text-xs text-muted-foreground font-mono">{item.date}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
