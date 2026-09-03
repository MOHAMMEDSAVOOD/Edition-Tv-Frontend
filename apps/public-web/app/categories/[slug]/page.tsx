import Link from "next/link";
import { feedService } from "@/services/feedService";
import { LeadStoryCard, GridStoryCard, SecondaryStoryCard, CompactStoryRow } from "@/components/news/ArticleCards";
import { SectionDivider } from "@/components/news/SectionDivider";
import { ChevronRight } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${categoryName} News | Edition TV`,
    description: `Latest ${categoryName} headlines, analysis, and breaking news from Edition TV.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
  const feed = await feedService.getFeedByCategory(slug, 1, 15);
  const trending = await feedService.getTrendingFeed(5);
  const articles = feed.items || [];

  const leadStory = articles[0];
  const gridStories = articles.slice(1, 5);
  const secondaryStories = articles.slice(5);

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8">
      {/* Category Section Header */}
      <div className="border-b-4 border-primary pb-4 mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-primary">{categoryName}</span>
          </div>
          <h1 className="headline-xl text-4xl sm:text-5xl capitalize font-extrabold">{categoryName}</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl font-sans">
            Comprehensive reporting, live analysis, and expert coverage on {categoryName.toLowerCase()} from Edition TV correspondents.
          </p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border rounded-xs mb-16">
          <h2 className="headline-lg text-xl font-bold text-foreground mb-2">No Published Stories in {categoryName}</h2>
          <p className="text-sm text-muted-foreground font-sans">Articles published under this category will appear here automatically.</p>
        </div>
      ) : (
        <>
          {/* Top Layout: Left Column (Lead + Grid) | Right Rail (Trending) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mb-16">

            {/* Left Column: Lead + Grid */}
            <div className="lg:border-r lg:border-border lg:pr-8">
              {leadStory && (
                <div className="mb-8">
                  <LeadStoryCard article={leadStory} />
                </div>
              )}

              {gridStories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border">
                  {gridStories.map((article) => (
                    <GridStoryCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>

            {/* Right Rail: Trending */}
            <div className="space-y-8">
              {trending.length > 0 && (
                <div>
                  <SectionDivider label="Trending Now" />
                  <div className="space-y-1 mt-4">
                    {trending.map((article, i) => (
                      <CompactStoryRow key={article.id} article={article} rank={i + 1} />
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-card border border-border p-5 rounded-xs text-center mt-8">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block font-mono">Newsletter</span>
                <h3 className="font-bold text-base mb-2">The {categoryName} Briefing</h3>
                <p className="text-xs text-muted-foreground mb-4 font-sans">Get the latest {categoryName.toLowerCase()} news delivered to your inbox daily.</p>
                <Link href="/newsletters" className="inline-block bg-primary text-black text-xs font-bold px-4 py-2 rounded-xs w-full">
                  Subscribe Free
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Feed Below */}
          {secondaryStories.length > 0 && (
            <section className="mb-16">
              <SectionDivider label={`More in ${categoryName}`} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {secondaryStories.map((article) => (
                  <SecondaryStoryCard key={article.id} article={article} showImage />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
