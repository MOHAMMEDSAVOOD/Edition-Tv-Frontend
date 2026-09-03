export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { articleService } from "@/services/articleService";
import { feedService } from "@/services/feedService";
import { commentsService } from "@/services/commentsService";
import { ArticleReaderClient } from "@/components/article/ArticleReaderClient";
import { CommentsSection } from "@/components/article/CommentsSection";
import { GridStoryCard, CompactStoryRow } from "@/components/news/ArticleCards";
import { SectionDivider } from "@/components/news/SectionDivider";
import { SafeImage } from "@/components/common/SafeImage";
import { Clock, Calendar, Sparkles } from "lucide-react";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await articleService.getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found | Edition TV" };
  return {
    title: `${article.title} | Edition TV`,
    description: article.subtitle,
    openGraph: {
      title: article.title,
      description: article.subtitle,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.authorName],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await articleService.getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const comments = await commentsService.getCommentsByArticle(article.id || "art-1");

  // Fetch trending stories in this specific category for the sidebar
  const categoryFeed = await feedService.getFeedByCategory(article.category, 1, 6);
  const trendingInCategory = categoryFeed.items.filter((a) => a.slug !== slug).slice(0, 5);

  const relatedFeed = await feedService.getPublicFeed(1, 4);
  const relatedArticles = relatedFeed.items.filter((a) => a.slug !== slug).slice(0, 3);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://edition.tv";
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.subtitle,
    "datePublished": article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.authorName
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "Edition TV",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icon.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/articles/${article.slug}`
    }
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": article.category,
        "item": `${baseUrl}/categories/${article.category.toLowerCase().replace(' ', '-')}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `${baseUrl}/articles/${article.slug}`
      }
    ]
  };

  return (
    <article className="py-8 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <div className="container mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Category Header & Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 font-mono">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/categories/${article.category.toLowerCase().replace(' ', '-')}`} className="hover:text-primary transition-colors font-semibold uppercase tracking-wider text-primary">
            {article.category}
          </Link>
        </div>

        {/* Article Headline Header */}
        <header className="max-w-4xl mb-8">
          <h1 className="headline-xl mb-4 text-foreground leading-tight">
            {article.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-sans mb-6">
            {article.subtitle}
          </p>

          {/* Author & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm font-serif">
                {article.authorName.charAt(0)}
              </div>
              <div>
                <Link href={`/authors/${article.authorId || "1"}`} className="font-semibold text-foreground hover:text-primary transition-colors block text-sm">
                  {article.authorName}
                </Link>
                <span>{article.authorTitle || "Senior Correspondent"}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {article.publishedAt}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {article.readingTime}
              </span>
            </div>
          </div>
        </header>

        {/* Hero Cover Image */}
        {article.featuredImageUrl && (
          <figure className="mb-10 max-w-4xl overflow-hidden rounded-xs border border-border bg-muted">
            <SafeImage
              src={article.featuredImageUrl}
              alt={article.title}
              className="w-full max-h-[500px] object-cover"
            />
            {article.imageCaption && (
              <figcaption className="p-3 text-xs text-muted-foreground font-sans border-t border-border/50 bg-muted/20 italic">
                {article.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Main Layout: Grid with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">

          {/* Main Column */}
          <div>
            {/* AI Key Takeaways Box */}
            {article.summaryPoints && article.summaryPoints.length > 0 && (
              <div className="bg-muted/40 border-l-4 border-primary p-5 mb-8 rounded-r-sm">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                  <Sparkles className="h-4 w-4" /> AI Executive Summary
                </div>
                <ul className="space-y-2 text-sm text-foreground/90 font-sans">
                  {article.summaryPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Layout: Article Body + Interactive Reader Tools */}
            <ArticleReaderClient article={article}>
              {/* Related Stories at Bottom */}
              {relatedArticles.length > 0 && (
                <section className="mt-16 pt-8 border-t border-border">
                  <SectionDivider label="Related Coverage" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                    {relatedArticles.map((rel) => (
                      <GridStoryCard key={rel.id} article={rel} />
                    ))}
                  </div>
                </section>
              )}

              {/* Comments Section */}
              <div className="mt-8">
                <CommentsSection articleId={article.id || "art-1"} initialComments={comments} />
              </div>
            </ArticleReaderClient>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block space-y-8">
            <div className="sticky top-24">
              <div className="bg-card border border-border p-5 rounded-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-lg text-foreground">Trending in {article.category}</h3>
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="flex flex-col gap-4">
                  {trendingInCategory.map((item, i) => (
                    <CompactStoryRow key={item.id} article={item} rank={i + 1} />
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-border text-center">
                  <Link href={`/categories/${article.category.toLowerCase().replace(' ', '-')}`} className="text-xs font-bold font-mono text-primary uppercase tracking-wider hover:underline">
                    View more in {article.category} →
                  </Link>
                </div>
              </div>

              {/* Advertisement / Promo Placeholder */}
              <div className="mt-8 bg-muted/20 border border-border h-[250px] flex items-center justify-center rounded-xs p-6 text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-2">Advertisement</div>
                  <div className="text-sm font-serif text-muted-foreground">Premium Brand Placement</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
