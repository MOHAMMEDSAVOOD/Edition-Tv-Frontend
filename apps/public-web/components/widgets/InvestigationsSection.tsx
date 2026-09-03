import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, ArrowRight, FileText } from "lucide-react";
import type { ArticleFeedItem } from "@/services/feedService";
import { SafeImage } from "@/components/common/SafeImage";

export function InvestigationsSection({ articles }: { articles: ArticleFeedItem[] }) {
  if (!articles || articles.length === 0) return null;

  const lead = articles[0];
  const secondary = articles.slice(1, 3);

  return (
    <section className="my-16 bg-white text-foreground p-6 md:p-8 rounded-xs border border-border font-sans shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <h2 className="headline-lg text-lg uppercase tracking-wider font-extrabold text-primary font-mono">
            Edition TV Investigations
          </h2>
        </div>
        <Link href="/categories/investigation" className="text-xs font-mono font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
          All Investigations <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Lead Investigation Spotlight */}
        <div>
          {lead.featuredImageUrl && (
            <div className="aspect-[16/9] w-full bg-muted overflow-hidden relative mb-4 rounded-xs border border-border">
              <SafeImage
                src={lead.featuredImageUrl}
                alt={lead.headline}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-mono font-extrabold px-2.5 py-1 uppercase tracking-widest rounded-xs flex items-center gap-1 shadow-md z-10">
                <FileText className="h-3 w-3" /> Special Report
              </div>
            </div>
          )}
          <h3 className="headline-xl text-xl md:text-2xl font-bold text-foreground mb-3 hover:text-primary transition-colors">
            <Link href={`/articles/${lead.slug}`}>{lead.title}</Link>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-sans line-clamp-3">
            {lead.summary}
          </p>
          {lead.summaryPoints && lead.summaryPoints.length > 0 && (
            <div className="bg-secondary border-l-2 border-primary p-3 mb-4 rounded-r-xs space-y-1.5 text-xs text-muted-foreground">
              {lead.summaryPoints.slice(0, 3).map((pt, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="text-primary font-semibold">{lead.authorName}</span>
            <span>·</span>
            <span>{lead.readingTime}</span>
          </div>
        </div>

        {/* Secondary Investigations Rail */}
        <div className="space-y-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6">
          <div>
            <span className="text-xs uppercase font-mono font-bold text-primary block mb-4">
              More In-Depth Reports
            </span>
            <div className="space-y-6">
              {secondary.map((item) => (
                <div key={item.id} className="border-b border-border pb-4 last:border-0">
                  <span className="text-[10px] font-mono text-primary uppercase tracking-wider block mb-1">
                    {item.topic}
                  </span>
                  <h4 className="text-sm font-bold text-foreground leading-snug mb-2 hover:text-primary transition-colors line-clamp-2">
                    <Link href={`/articles/${item.slug}`}>{item.title}</Link>
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.summary}</p>
                  <div className="text-[10px] font-mono text-muted-foreground">{item.authorName}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary border border-border p-4 rounded-xs text-xs text-muted-foreground">
            <span className="font-bold text-primary block mb-1">Secure Whistleblower Tip Line</span>
            Have confidential documents or evidence? Contact our investigative team via encrypted channels.
          </div>
        </div>
      </div>
    </section>
  );
}
