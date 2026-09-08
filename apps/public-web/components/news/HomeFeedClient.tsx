"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Radio, Video, Headphones, Sparkles, Newspaper } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { feedMapper } from "@/mappers/feedMapper";
import { ArticleFeedItem } from "@/services/feedService";
import { LeadStoryCard, SecondaryStoryCard, GridStoryCard, CompactStoryRow, OpinionStoryCard, MediaStoryCard } from "./ArticleCards";
import { SectionDivider } from "./SectionDivider";
import { LiveBlogRail } from "./LiveBlogRail";
import { MarketSnapshotTicker } from "../widgets/MarketSnapshotTicker";
import { TopicExplorerWidget } from "../widgets/TopicExplorerWidget";
import { ContinueReadingWidget } from "../widgets/ContinueReadingWidget";
import { RecentlyViewedWidget } from "../widgets/RecentlyViewedWidget";
import { InvestigationsSection } from "../widgets/InvestigationsSection";
import { SafeImage } from "../common/SafeImage";

interface HomeFeedClientProps {
  initialArticles?: ArticleFeedItem[];
  initialTrending?: ArticleFeedItem[];
  initialEditorsPicks?: ArticleFeedItem[];
  initialOpinions?: ArticleFeedItem[];
  initialInvestigations?: ArticleFeedItem[];
  initialVideos?: ArticleFeedItem[];
  initialPodcasts?: ArticleFeedItem[];
  initialRecommended?: ArticleFeedItem[];
}

export function HomeFeedClient({
  initialArticles = [],
  initialTrending = [],
  initialEditorsPicks = [],
  initialOpinions = [],
  initialInvestigations = [],
  initialVideos = [],
  initialPodcasts = [],
  initialRecommended = [],
}: HomeFeedClientProps) {
  const [articles, setArticles] = useState<ArticleFeedItem[]>(initialArticles);
  const [trending, setTrending] = useState<ArticleFeedItem[]>(initialTrending);
  const [editorsPicks, setEditorsPicks] = useState<ArticleFeedItem[]>(initialEditorsPicks);
  const [opinions, setOpinions] = useState<ArticleFeedItem[]>(initialOpinions);
  const [investigations, setInvestigations] = useState<ArticleFeedItem[]>(initialInvestigations);
  const [videos, setVideos] = useState<ArticleFeedItem[]>(initialVideos);
  const [podcasts, setPodcasts] = useState<ArticleFeedItem[]>(initialPodcasts);
  const [recommended, setRecommended] = useState<ArticleFeedItem[]>(initialRecommended);
  const [isLoading, setIsLoading] = useState<boolean>(articles.length === 0);

  const unwrapArray = (val: unknown): Record<string, unknown>[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val as Record<string, unknown>[];
    const obj = val as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as Record<string, unknown>[];
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
    if (Array.isArray(obj.articles)) return obj.articles as Record<string, unknown>[];
    if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[];
    return [];
  };

  const fetchLiveHomeFeed = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Main Public Feed (collects published articles AND ingested wire items)
      const combinedRawItems: Record<string, unknown>[] = [];

      const mainEndpoints = [
        "/articles?page=0&size=50",
        "/news/feed?page=0&size=50",
        "/newsroom/wire-items/reader?page=0&size=50",
        "/public/articles",
      ];

      const fetchedResults = await Promise.allSettled(
        mainEndpoints.map((ep) => apiClient.get<unknown>(ep))
      );

      for (const res of fetchedResults) {
        if (res.status === "fulfilled" && res.value) {
          const items = unwrapArray(res.value);
          if (items.length > 0) {
            combinedRawItems.push(...items);
          }
        }
      }

      // Deduplicate items by title/headline
      const seenTitles = new Set<string>();
      const uniqueRawItems: Record<string, unknown>[] = [];
      for (const item of combinedRawItems) {
        const titleKey = String(item.headline || item.title || item.name || "").trim().toLowerCase();
        if (titleKey && !seenTitles.has(titleKey)) {
          seenTitles.add(titleKey);
          uniqueRawItems.push(item);
        }
      }

      let mappedArticles: ArticleFeedItem[] = [];

      if (uniqueRawItems.length > 0) {
        mappedArticles = uniqueRawItems.map((i) => feedMapper.toArticleFeedItem(i as Parameters<typeof feedMapper.toArticleFeedItem>[0]));
        setArticles(mappedArticles);

        // Populate default fallbacks for sub-sections if their dedicated endpoints are empty
        setTrending(mappedArticles.slice(0, 4));
        setEditorsPicks(mappedArticles.slice(4, 7));
        setOpinions(mappedArticles.slice(7, 10)); // 3 opinion items for a complete 3-column row
        setInvestigations(mappedArticles.slice(10, 13));
        setRecommended(mappedArticles.slice(13, 17));
      }

      // 2. Fetch Dedicated Trending / Most Read (4 items for perfect sidebar height symmetry)
      try {
        const resTrending = await apiClient.get<unknown>("/news/feed/trending?limit=4");
        const itemsTrending = unwrapArray(resTrending);
        if (itemsTrending.length > 0) {
          const list = itemsTrending.map((i) => feedMapper.toArticleFeedItem(i as Parameters<typeof feedMapper.toArticleFeedItem>[0]));
          if (list.length < 4) {
            const extra = mappedArticles.filter((a) => !list.some((x) => x.id === a.id)).slice(0, 4 - list.length);
            setTrending([...list, ...extra]);
          } else {
            setTrending(list.slice(0, 4));
          }
        }
      } catch {
        // Fallback already set above
      }

      // 3. Fetch Editors' Picks (3 items for perfect sidebar height symmetry)
      try {
        const resPicks = await apiClient.get<unknown>("/news/feed/editors-picks?limit=3");
        const itemsPicks = unwrapArray(resPicks);
        if (itemsPicks.length > 0) {
          const list = itemsPicks.map((i) => feedMapper.toArticleFeedItem(i as Parameters<typeof feedMapper.toArticleFeedItem>[0]));
          if (list.length < 3) {
            const extra = mappedArticles.filter((a) => !list.some((x) => x.id === a.id)).slice(0, 3 - list.length);
            setEditorsPicks([...list, ...extra]);
          } else {
            setEditorsPicks(list.slice(0, 3));
          }
        }
      } catch {
        // Fallback already set above
      }

      // 4. Fetch Opinions (Limit to 3 items for a 100% filled 3-column row)
      try {
        const resOps = await apiClient.get<unknown>("/news/feed/opinions?limit=3");
        const itemsOps = unwrapArray(resOps);
        if (itemsOps.length > 0) {
          let list = itemsOps.map((i) => feedMapper.toArticleFeedItem(i as Parameters<typeof feedMapper.toArticleFeedItem>[0]));
          if (list.length < 3) {
            const extra = mappedArticles.filter((a) => !list.some((x) => x.id === a.id)).slice(0, 3 - list.length);
            list = [...list, ...extra];
          } else {
            list = list.slice(0, 3);
          }
          setOpinions(list);
        }
      } catch {
        // Fallback already set above
      }

      // 5. Fetch Investigations
      try {
        const resInv = await apiClient.get<unknown>("/news/feed/investigations?limit=3");
        const itemsInv = unwrapArray(resInv);
        if (itemsInv.length > 0) {
          const list = itemsInv.map((i) => feedMapper.toArticleFeedItem(i as Parameters<typeof feedMapper.toArticleFeedItem>[0]));
          if (list.length < 3) {
            const extra = mappedArticles.filter((a) => !list.some((x) => x.id === a.id)).slice(0, 3 - list.length);
            setInvestigations([...list, ...extra]);
          } else {
            setInvestigations(list.slice(0, 3));
          }
        }
      } catch {
        // Fallback already set above
      }

      // 6. Fetch Videos & Podcasts
      try {
        const resVid = await apiClient.get<unknown>("/news/feed/videos?limit=3");
        const itemsVid = unwrapArray(resVid);
        if (itemsVid.length > 0) setVideos(itemsVid.map((i) => feedMapper.toArticleFeedItem(i as Parameters<typeof feedMapper.toArticleFeedItem>[0])));
      } catch {
        // Fallback
      }

      try {
        const resPod = await apiClient.get<unknown>("/news/feed/podcasts?limit=3");
        const itemsPod = unwrapArray(resPod);
        if (itemsPod.length > 0) setPodcasts(itemsPod.map((i) => feedMapper.toArticleFeedItem(i as Parameters<typeof feedMapper.toArticleFeedItem>[0])));
      } catch {
        // Fallback
      }

      // 7. Fetch Recommendations
      try {
        const resRec = await apiClient.get<unknown>("/news/feed/recommendations?limit=4");
        const itemsRec = unwrapArray(resRec);
        if (itemsRec.length > 0) setRecommended(itemsRec.map((i) => feedMapper.toArticleFeedItem(i as Parameters<typeof feedMapper.toArticleFeedItem>[0])));
      } catch {
        // Fallback already set above
      }

    } catch (error) {
      console.error("Error loading live home feed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveHomeFeed();
  }, [fetchLiveHomeFeed]);

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
        {/* ── CONTINUE READING WIDGET ── */}
        <ContinueReadingWidget />

        {articles.length === 0 && !isLoading ? (
          <div className="py-20 text-center border border-dashed border-border rounded-xs my-8 space-y-3">
            <Newspaper className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <h2 className="headline-lg text-xl font-bold text-foreground">No Published News Articles Available</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto font-sans">
              There are currently no published articles in the news feed. News updates published via the API will appear here live.
            </p>
          </div>
        ) : (
          <>
            {/* ── TOP HERO ZONE ── */}
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
                          <Link href={`/articles/${article.slug}`} className="mb-2.5 block">
                            <div className="aspect-[16/9] w-full bg-muted overflow-hidden relative rounded-xs border border-border/50">
                              <SafeImage
                                src={article.featuredImageUrl}
                                alt={article.headline}
                                category={article.category}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                              />
                            </div>
                          </Link>
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
                <div
                  className={`grid ${
                    latestNews.length === 1
                      ? "grid-cols-1"
                      : latestNews.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                  } gap-6 mt-4`}
                >
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
                <div
                  className={`grid ${
                    videos.length + podcasts.length === 1
                      ? "grid-cols-1"
                      : videos.length + podcasts.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : videos.length + podcasts.length === 3
                      ? "grid-cols-1 sm:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
                  } gap-6`}
                >
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
              const displayArticles = sectionArticles.slice(0, 4);
              const gridColsClass =
                displayArticles.length === 1
                  ? "grid-cols-1"
                  : displayArticles.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : displayArticles.length === 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4";

              return (
                <section key={section} className="mb-16">
                  <SectionDivider label={section} href={`/categories/${section.toLowerCase()}`} />
                  <div className={`grid ${gridColsClass} gap-6 mt-4`}>
                    {displayArticles.map((article) => (
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
                <div
                  className={`grid ${
                    recommended.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                  } gap-6 mt-4`}
                >
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
