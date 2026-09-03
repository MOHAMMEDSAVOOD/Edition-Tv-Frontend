import { Suspense } from "react";
import { feedService } from "@/services/feedService";
import { LeadStoryCard, SecondaryStoryCard, GridStoryCard, CompactStoryRow, OpinionStoryCard, MediaStoryCard } from "@/components/news/ArticleCards";
import { SectionDivider } from "@/components/news/SectionDivider";
import { LiveBlogRail } from "@/components/news/LiveBlogRail";
import { MarketSnapshotTicker } from "@/components/widgets/MarketSnapshotTicker";
import { TopicExplorerWidget } from "@/components/widgets/TopicExplorerWidget";
import { ContinueReadingWidget } from "@/components/widgets/ContinueReadingWidget";
import { RecentlyViewedWidget } from "@/components/widgets/RecentlyViewedWidget";
import { InvestigationsSection } from "@/components/widgets/InvestigationsSection";
import { SafeImage } from "@/components/common/SafeImage";
import Link from "next/link";
import { Radio, Video, Headphones, Sparkles, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Edition TV — Global Digital Journalism",
  description: "Breaking news, live event coverage, investigative reporting, and expert analysis from Edition TV correspondents worldwide.",
};

async function HomepageContent() {
  // Fetch data cleanly via feedService (no direct mock imports)
  const feed = await feedService.getPublicFeed(1, 20);
  const trending = await feedService.getTrendingFeed(5);
  const editorsPicks = await feedService.getEditorsPicks(4);
  const opinions = await feedService.getOpinions(3);
  const investigations = await feedService.getInvestigations(3);
  const videos = await feedService.getVideos(2);
  const podcasts = await feedService.getPodcasts(2);
  const recommended = await feedService.getRecommendedStories(4);

  const articles = feed.items || [];

  const leadStory = articles.find((a) => a.isFeatured) || articles[0];
  const secondary = articles.filter((a) => a.id !== leadStory?.id).slice(0, 3);
  const latestNews = articles.filter((a) => a.id !== leadStory?.id).slice(3, 9);

  const SECTIONS = [
    "Business",
    "Technology",
    "World",
    "Politics",
    "Science",
    "Health",
    "Energy",
  ] as const;

  return (
    <div>
      <h1 className="sr-only">Edition TV — Global Digital Journalism & Live Newsroom</h1>
      {/* ── FINANCIAL MARKET SNAPSHOT TICKER ── */}
      <MarketSnapshotTicker />

      <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-6 font-sans">
        {/* ── CONTINUE READING WIDGET (Client history) ── */}
        <ContinueReadingWidget />

        {articles.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-xs my-8 space-y-3">
            <Newspaper className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <h2 className="headline-lg text-xl font-bold text-foreground">No Published News Articles Available</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto font-sans">
              There are currently no published articles in the news feed. News updates published via the API will appear here live.
            </p>
          </div>
        ) : (
          <>
            {/* ── TOP HERO ZONE: Lead + Secondary + Right Rail ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mb-16">
              {/* Left Column: Lead + Secondary Grid */}
              <div className="lg:border-r lg:border-border lg:pr-8">
                {leadStory && <LeadStoryCard article={leadStory} />}

                {/* Secondary Featured Stories Grid */}
                {secondary.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {secondary.map((article) => (
                        <div key={article.id} className="flex flex-col group">
                          {article.featuredImageUrl && (
                            <Link href={`/articles/${article.slug}`} className="mb-2.5 block">
                              <div className="aspect-[16/9] w-full bg-muted overflow-hidden relative rounded-xs border border-border/50">
                                <SafeImage
                                  src={article.featuredImageUrl}
                                  alt={article.headline}
                                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                />
                              </div>
                            </Link>
                          )}
                          <span className="section-label mb-1.5 text-[9px]">{article.category}</span>
                          <h3 className="headline-sm text-base font-bold mb-2 line-clamp-3 leading-snug group-hover:text-primary transition-colors">
                            <Link href={`/articles/${article.slug}`}>
                              {article.headline}
                            </Link>
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.summary}</p>
                          <div className="byline text-[10px] text-muted-foreground mt-auto font-mono">{article.authorName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Rail: Most Read / Trending + Live Blog + Editors' Picks */}
              <div className="space-y-8">
                {/* Most Read Stories */}
                {trending.length > 0 && (
                  <div>
                    <SectionDivider label="Most Read" />
                    <div className="space-y-1">
                      {trending.map((article, i) => (
                        <CompactStoryRow key={article.id} article={article} rank={i + 1} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Coverage Widget */}
                <LiveBlogRail />

                {/* Editors' Picks */}
                {editorsPicks.length > 0 && (
                  <div>
                    <SectionDivider label="Editors' Picks" />
                    <div className="space-y-4 mt-3">
                      {editorsPicks.map((article) => (
                        <div key={article.id} className="border-b border-border pb-3.5 last:border-0 last:pb-0 group">
                          <span className="section-label text-[9px] mb-1 block">{article.category}</span>
                          <h4 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            <Link href={`/articles/${article.slug}`}>{article.headline}</Link>
                          </h4>
                          <div className="byline text-[10px] text-muted-foreground mt-1.5 font-mono">{article.authorName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── OPINION & COLUMNISTS SECTION ── */}
            {opinions.length > 0 && (
              <section className="mb-16">
                <SectionDivider label="Opinion & Analysis" href="/categories/opinion" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {opinions.map((article) => (
                    <OpinionStoryCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}

            {/* ── INVESTIGATIONS SPOTLIGHT ── */}
            {investigations.length > 0 && (
              <InvestigationsSection articles={investigations} />
            )}

            {/* ── LATEST NEWS GRID ── */}
            {latestNews.length > 0 && (
              <section className="mb-16">
                <SectionDivider label="Latest News Coverage" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
                  {latestNews.map((article) => (
                    <GridStoryCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}

            {/* ── MULTIMEDIA: VIDEO & PODCASTS ── */}
            {(videos.length > 0 || podcasts.length > 0) && (
              <section className="mb-16 p-6 bg-muted/20 border border-border rounded-xs">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-primary animate-pulse" />
                    <h2 className="headline-lg text-lg uppercase tracking-wider font-extrabold text-foreground">
                      Multimedia: Video & Audio Podcasts
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono font-semibold">
                    <Link href="/categories/video" className="text-primary hover:underline flex items-center gap-1">
                      <Video className="h-3.5 w-3.5" /> Video Reports
                    </Link>
                    <span>·</span>
                    <Link href="/categories/podcast" className="text-primary hover:underline flex items-center gap-1">
                      <Headphones className="h-3.5 w-3.5" /> Audio Podcasts
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {videos.map((art) => (
                    <MediaStoryCard key={art.id} article={art} type="video" />
                  ))}
                  {podcasts.map((art) => (
                    <MediaStoryCard key={art.id} article={art} type="podcast" />
                  ))}
                </div>
              </section>
            )}

            {/* ── SECTION BY SECTION CATEGORY GRIDS ── */}
            {SECTIONS.map((section) => {
              const sectionArticles = articles.filter(
                (a) => a.category.toLowerCase() === section.toLowerCase()
              );
              if (sectionArticles.length === 0) return null;
              return (
                <section key={section} className="mb-16">
                  <SectionDivider label={section} href={`/categories/${section.toLowerCase()}`} />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                    {sectionArticles.slice(0, 4).map((article) => (
                      <GridStoryCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* ── RECOMMENDED FOR YOU ── */}
            {recommended.length > 0 && (
              <section className="mb-16">
                <SectionDivider label="Recommended For You" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {recommended.map((article) => (
                    <SecondaryStoryCard key={article.id} article={article} showImage />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── TOPIC EXPLORER & FOLLOW ── */}
        <TopicExplorerWidget />

        {/* ── RECENTLY VIEWED (Client History) ── */}
        <RecentlyViewedWidget />

        {/* ── NEWSLETTER SUBSCRIPTION BOX ── */}
        <section className="bg-card border border-border rounded-xs p-8 text-center my-16">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="section-label mb-2 block text-xs">Stay Informed</span>
          <h2 className="headline-lg text-2xl font-extrabold mb-2">Get Edition TV&apos;s Morning Briefing</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto font-sans">
            The day&apos;s most important stories, curated by our senior editors and delivered by 7 AM worldwide.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 text-sm border border-border bg-background rounded-xs focus:outline-none focus:ring-1 focus:ring-primary font-sans"
            />
            <button
              type="submit"
              className="bg-primary text-black font-extrabold text-sm px-6 py-2.5 rounded-xs hover:opacity-90 transition-opacity"
            >
              Subscribe
            </button>
          </form>
          <p className="text-[10px] text-muted-foreground/60 mt-3 font-mono">
            No spam. Unsubscribe any time. Read by 4.2 million decision-makers worldwide.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              <div>
                <div className="aspect-[16/9] bg-muted rounded-xs mb-4" />
                <div className="h-8 bg-muted rounded-xs mb-2 w-3/4" />
                <div className="h-4 bg-muted rounded-xs mb-1 w-full" />
                <div className="h-4 bg-muted rounded-xs w-2/3" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded-xs" />
                ))}
              </div>
            </div>
            <div className="h-6 bg-muted rounded-xs w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/3] bg-muted rounded-xs" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <HomepageContent />
    </Suspense>
  );
}
