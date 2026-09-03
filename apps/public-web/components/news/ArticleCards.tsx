import Link from "next/link";
import { Clock, Play, Headphones, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleFeedItem } from "@/services/feedService";
import { SafeImage } from "@/components/common/SafeImage";

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Lead Story Card (full-width hero) ─── */
export function LeadStoryCard({ article, className }: { article: ArticleFeedItem; className?: string }) {
  return (
    <article className={cn("group", className)}>
      <Link href={`/articles/${article.slug}`}>
        {article.featuredImageUrl && (
          <div className="aspect-[16/9] w-full bg-muted overflow-hidden mb-4 relative rounded-xs border border-border/50">
            <SafeImage
              src={article.featuredImageUrl}
              alt={article.headline}
              category={article.category}
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
            />
            {article.isBreaking && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-widest rounded-xs flex items-center gap-1 shadow-sm font-mono z-10">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                Breaking Lead
              </span>
            )}
          </div>
        )}
      </Link>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="section-label">{article.category}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-primary font-mono font-medium">{article.topic}</span>
        </div>
        <h2 className="headline-xl text-2xl md:text-3xl font-extrabold mb-3 leading-tight">
          <Link href={`/articles/${article.slug}`} className="hover:text-primary transition-colors">
            {article.headline}
          </Link>
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed mb-4 line-clamp-3 font-sans">
          {article.summary}
        </p>
        <div className="byline flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span className="font-semibold text-foreground">{article.authorName}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readingTimeMinutes} min read
          </span>
          <span>·</span>
          <span>{formatTimeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}

/* ─── Secondary Story Card ─── */
export function SecondaryStoryCard({ article, showImage = false }: { article: ArticleFeedItem; showImage?: boolean }) {
  return (
    <article className="article-card pb-4 mb-4 group border-b border-border last:border-0">
      <div className="flex gap-4">
        {showImage && article.featuredImageUrl && (
          <div className="flex-none w-28 h-20 bg-muted overflow-hidden relative rounded-xs border border-border/50">
            <SafeImage
              src={article.featuredImageUrl}
              alt={article.headline}
              category={article.category}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="section-label mb-1 block text-[10px]">{article.category}</span>
          <h3 className="headline-md mb-1.5 text-base font-bold leading-snug line-clamp-2">
            <Link href={`/articles/${article.slug}`} className="hover:text-primary transition-colors">
              {article.headline}
            </Link>
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 font-sans">{article.summary}</p>
          <div className="byline flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span>{article.authorName}</span>
            <span>·</span>
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── Grid Story Card ─── */
export function GridStoryCard({ article }: { article: ArticleFeedItem }) {
  return (
    <article className="group flex flex-col h-full border border-border/40 p-3 rounded-xs bg-card/40 hover:border-primary/40 transition-colors">
      {article.featuredImageUrl ? (
        <div className="aspect-[4/3] w-full bg-muted overflow-hidden mb-3 relative rounded-xs border border-border/50">
          <SafeImage
            src={article.featuredImageUrl}
            alt={article.headline}
            category={article.category}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      ) : null}
      <span className="section-label mb-1 block text-[10px]">{article.category}</span>
      <h3 className="headline-sm text-sm font-bold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        <Link href={`/articles/${article.slug}`}>
          {article.headline}
        </Link>
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3 font-sans">{article.summary}</p>
      <div className="byline text-[10px] text-muted-foreground flex items-center gap-1.5 font-mono pt-2 border-t border-border/50">
        <span>{article.authorName}</span>
        <span>·</span>
        <span>{formatTimeAgo(article.publishedAt)}</span>
      </div>
    </article>
  );
}

/* ─── Compact Story Row (for right-rail lists) ─── */
export function CompactStoryRow({ article, rank }: { article: ArticleFeedItem; rank?: number }) {
  return (
    <article className="flex items-start gap-3 py-3 border-b border-border last:border-0 group">
      {rank !== undefined && (
        <span className="flex-none text-2xl font-black text-muted-foreground/30 leading-none w-6 text-center font-mono">
          {rank}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <span className="section-label text-[9px] mb-1 block">{article.category}</span>
        <h4 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/articles/${article.slug}`}>{article.headline}</Link>
        </h4>
        <div className="text-[10px] text-muted-foreground font-mono mt-1 flex items-center gap-2">
          <span>{article.authorName}</span>
          <span>·</span>
          <span>{article.viewsCount.toLocaleString()} views</span>
        </div>
      </div>
    </article>
  );
}

/* ─── Opinion Story Card ─── */
export function OpinionStoryCard({ article }: { article: ArticleFeedItem }) {
  return (
    <article className="p-4 border-l-2 border-primary bg-muted/20 hover:bg-muted/40 transition-colors rounded-r-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-3">
          {article.authorAvatar && (
            <div className="h-9 w-9 rounded-full overflow-hidden relative border border-border">
              <SafeImage src={article.authorAvatar} alt={article.authorName} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <span className="font-bold text-xs block text-foreground">{article.authorName}</span>
            <span className="text-[10px] text-muted-foreground block">{article.authorTitle}</span>
          </div>
        </div>
        <h3 className="font-headline italic text-base md:text-lg font-bold leading-tight mb-2 hover:text-primary transition-colors">
          <Link href={`/articles/${article.slug}`}>&ldquo;{article.title}&rdquo;</Link>
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-3 font-sans mb-3">{article.summary}</p>
      </div>
      <div className="text-[10px] font-mono text-primary uppercase font-bold flex items-center gap-1">
        Read Opinion Column <ArrowRight className="h-3 w-3" />
      </div>
    </article>
  );
}

/* ─── Media Story Card (Video or Podcast) ─── */
export function MediaStoryCard({ article, type }: { article: ArticleFeedItem; type: "video" | "podcast" }) {
  return (
    <article className="group border border-border bg-card rounded-xs overflow-hidden flex flex-col">
      <div className="aspect-video w-full bg-black relative overflow-hidden">
        {article.featuredImageUrl && (
          <SafeImage
            src={article.featuredImageUrl}
            alt={article.title}
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center pointer-events-none">
          <div className="h-12 w-12 rounded-full bg-primary text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            {type === "video" ? <Play className="h-5 w-5 fill-current ml-0.5" /> : <Headphones className="h-5 w-5" />}
          </div>
        </div>
        <span className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded-xs flex items-center gap-1">
          {type === "video" ? <Play className="h-3 w-3" /> : <Headphones className="h-3 w-3" />}
          {article.readingTime}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="section-label text-[9px] mb-1.5 block">{article.topic || type.toUpperCase()}</span>
          <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
          </h3>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono mt-2 pt-2 border-t border-border">
          {article.authorName}
        </div>
      </div>
    </article>
  );
}
