import Link from "next/link";
import { feedService } from "@/services/feedService";
import { GridStoryCard, CompactStoryRow } from "@/components/news/ArticleCards";
import { SectionDivider } from "@/components/news/SectionDivider";
import { ArrowLeft, BookOpen } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const feed = await feedService.getFeedByAuthor(id, 1, 1);
  const authorName = feed.items.length > 0 && feed.items[0].authorName ? feed.items[0].authorName : id;
  return {
    title: `${authorName} | Edition TV`,
    description: `Articles by ${authorName} on Edition TV.`,
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { id } = await params;
  const feed = await feedService.getFeedByAuthor(id, 1, 20);
  const articles = feed.items || [];
  const trending = await feedService.getTrendingFeed(3);

  const authorName = articles.length > 0 && articles[0].authorName ? articles[0].authorName : id;
  const authorTitle = articles.length > 0 && articles[0].authorTitle ? articles[0].authorTitle : "";

  return (
    <div className="container mx-auto max-w-[1200px] px-3 sm:px-4 md:px-6 py-4 sm:py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6 sm:mb-8 font-mono uppercase tracking-wider"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Top Stories
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-12">
        {/* Left Column: Author Card */}
        <div>
          <div className="bg-card border border-border p-5 sm:p-6 rounded-xs lg:sticky lg:top-24">
            <div className="w-24 h-24 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-3xl font-serif mb-4 mx-auto border border-primary/20">
              {authorName.charAt(0).toUpperCase()}
            </div>

            <div className="text-center mb-6">
              {authorTitle && (
                <div className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-xs text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
                  {authorTitle}
                </div>
              )}
              <h1 className="text-xl font-serif font-bold text-foreground">
                {authorName}
              </h1>
            </div>

            <div className="border-t border-border pt-4 text-xs text-muted-foreground font-mono">
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{articles.length} Published Articles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Author's Feed */}
        <div>
          <SectionDivider label={`Articles by ${authorName}`} />

          {articles.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border rounded-xs mt-6">
              <h2 className="headline-lg text-lg font-bold text-foreground mb-1">No Articles Found</h2>
              <p className="text-xs text-muted-foreground">This author has not published any articles yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {articles.map((article) => (
                <GridStoryCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Trending Coverage */}
          {trending.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
              <SectionDivider label="Trending Coverage" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {trending.map((article, i) => (
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
