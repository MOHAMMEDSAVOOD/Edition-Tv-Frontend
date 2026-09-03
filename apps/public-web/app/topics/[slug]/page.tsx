import Link from "next/link";
import { feedService } from "@/services/feedService";
import { CompactStoryRow } from "@/components/news/ArticleCards";
import { SectionDivider } from "@/components/news/SectionDivider";
import { ArrowLeft, Layers, Sparkles, Bell, Clock, Calendar } from "lucide-react";

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TopicPageProps) {
  const { slug } = await params;
  const topicTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return {
    title: `${topicTitle} Coverage | Edition TV`,
    description: `Curated news stream, investigative reports, and timeline on ${topicTitle}.`,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topicTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const feed = await feedService.getFeedByTopic(slug, 1, 15);
  const articles = feed.items || [];

  // Get recommended stories as a sidebar for topics
  const recommended = await feedService.getRecommendedStories(4);

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6 font-mono uppercase tracking-wider"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Top Stories
      </Link>

      {/* Topic Header Card */}
      <div className="bg-card border border-border p-6 md:p-10 rounded-sm mb-12 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-1.5 border border-primary/20">
              <Layers className="h-3.5 w-3.5" /> Topic Hub
            </span>
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Live Stream
            </span>
          </div>

          <button className="flex items-center gap-2 bg-primary text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <Bell className="h-4 w-4" /> Follow #{topicTitle}
          </button>
        </div>

        <div className="relative z-10">
          <h1 className="headline-xl text-4xl sm:text-6xl font-extrabold text-foreground mb-4">
            #{topicTitle}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl font-sans">
            Curated investigative coverage, breaking developments, and expert analysis on <strong className="text-foreground">#{topicTitle}</strong> from Edition TV reporters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        {/* Left Column: Timeline */}
        <div>
          <SectionDivider label={`Timeline: Latest Developments (${articles.length})`} />

          {articles.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-xs mt-6">
              <h2 className="headline-lg text-lg font-bold text-foreground mb-1">No Stories Tagged #{topicTitle}</h2>
              <p className="text-xs text-muted-foreground">There are currently no published stories for this topic.</p>
            </div>
          ) : (
            <div className="mt-8 relative border-l-2 border-border/50 ml-4 space-y-10 pb-8">
              {articles.map((article) => (
                <div key={article.id} className="relative pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-background border-2 border-primary group-hover:bg-primary transition-colors" />

                  {/* Article Content */}
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    {/* Meta Sidebar for Timeline */}
                    <div className="w-full md:w-32 flex-shrink-0 pt-1 hidden md:block">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {article.publishedAt?.split(' ')[0] || 'Today'}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {article.publishedAt?.split(' ')[1] || 'Just now'}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="flex-1 bg-card border border-border p-5 rounded-xs hover:border-primary/50 transition-colors">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wider mb-2 block font-mono">
                        {article.category}
                      </span>
                      <h3 className="headline-md text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        <Link href={`/articles/${article.slug}`}>
                          {article.headline}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-sans">{article.summary}</p>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-3 border-t border-border/50">
                        <span className="font-semibold text-foreground/80">{article.authorName}</span>
                        <span className="md:hidden flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {article.publishedAt}
                        </span>
                        <Link href={`/articles/${article.slug}`} className="text-primary hover:underline flex items-center gap-1">
                          Read Full Story <ArrowLeft className="h-3 w-3 rotate-180" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Rail */}
        <div className="space-y-8">
          {/* Related Experts / Topics Panel */}
          <div className="bg-muted/20 border border-border p-5 rounded-xs">
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider font-mono border-b border-border pb-2">Topic Experts</h3>
            <p className="text-xs text-muted-foreground font-sans mb-4">Edition TV journalists covering this topic.</p>
            {Array.from(new Set(articles.map(a => a.authorName))).slice(0, 3).map(author => (
              <div key={author} className="flex items-center gap-3 mb-3 last:mb-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs font-serif">
                  {author.charAt(0)}
                </div>
                <div className="text-sm font-semibold">{author}</div>
              </div>
            ))}
          </div>

          {/* Recommended Reading */}
          {recommended.length > 0 && (
            <div>
              <SectionDivider label="Recommended For You" />
              <div className="space-y-1 mt-4">
                {recommended.map((article, i) => (
                  <CompactStoryRow key={article.id} article={article} rank={i + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
