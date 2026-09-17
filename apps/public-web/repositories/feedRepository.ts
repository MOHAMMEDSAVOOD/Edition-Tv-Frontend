/**
 * Feed Repository — Server Component safe
 *
 * All methods use `serverFetch` (not apiClient) because:
 * - Feed endpoints are public (no auth required)
 * - These are called from Next.js Server Components during SSR/ISR
 * - serverFetch never throws — returns null on failure
 */
import { serverFetch } from "@/lib/api-client";
import { FeedItemResponseDto, BreakingNewsTickerResponseDto, FeedItemResponseSchema, BreakingNewsTickerResponseSchema } from "@/dtos/feed.dto";

const REVALIDATE = 0;

/** Pull the array out of whichever envelope shape the feed API used. */
function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (Array.isArray(val.content)) return val.content;
  if (Array.isArray(val.data)) return val.data;
  if (Array.isArray(val.articles)) return val.articles;
  if (Array.isArray(val.items)) return val.items;
  return [];
}

function unwrapArray(val: any): any[] {
  return toArray(val).map((item) => {
    const parsed = FeedItemResponseSchema.safeParse(item);
    if (parsed.success) return parsed.data;
    console.warn("Feed item schema validation failed", parsed.error);
    return null;
  }).filter(Boolean);
}

export const feedRepository = {
  async getPublicFeed(
    page = 0,
    size = 10
  ): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<any>(`/api/v1/news/feed?page=${page}&size=${size}`, { revalidate: REVALIDATE, tags: ["feed"] });
    const items = unwrapArray(res);

    const publishedOnly = items.filter((item: any) => {
      if (item.wireItemId || item.wireSource || item.isWireItem) return false;
      return true;
    });

    const seen = new Set<string>();
    const uniqueItems: any[] = [];
    for (const item of publishedOnly) {
      const key = (item.headline || item.title || item.name || "").trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
    }

    return uniqueItems;
  },

  async getCurationSlotPlacements(slotType: string): Promise<any[]> {
    const res = await serverFetch<any>(
      `/public/curation/slots/${encodeURIComponent(slotType)}`,
      { revalidate: REVALIDATE, tags: ["curation", slotType] }
    );
    return unwrapArray(res);
  },

  async getTrendingFeed(limit = 10): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<any>(
      `/api/v1/news/feed/trending?limit=${limit}`,
      { revalidate: REVALIDATE, tags: ["feed", "trending"] }
    );
    return unwrapArray(res);
  },

  async getEditorsPicks(limit = 4): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<any>(
      `/news/feed/editors-picks?limit=${limit}`,
      { revalidate: REVALIDATE, tags: ["feed", "editors-picks"] }
    );
    const items = unwrapArray(res);
    if (items.length > 0) return items;
    return (await this.getPublicFeed(0, limit)).slice(0, limit);
  },

  async getRecommendations(limit = 4): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<any>(
      `/news/feed/recommendations?limit=${limit}`,
      { revalidate: REVALIDATE, tags: ["feed"] }
    );
    return unwrapArray(res);
  },

  async getOpinions(limit = 4): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<any>(
      `/news/feed/opinions?limit=${limit}`,
      { revalidate: REVALIDATE, tags: ["feed", "opinions"] }
    );
    return unwrapArray(res);
  },

  async getInvestigations(limit = 3): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<any>(
      `/news/feed/investigations?limit=${limit}`,
      { revalidate: REVALIDATE, tags: ["feed", "investigations"] }
    );
    return unwrapArray(res);
  },

  async getVideos(limit = 3): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<any>(
      `/news/feed/videos?limit=${limit}`,
      { revalidate: REVALIDATE, tags: ["feed", "videos"] }
    );
    return unwrapArray(res);
  },

  async getPodcasts(limit = 3): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<any>(
      `/news/feed/podcasts?limit=${limit}`,
      { revalidate: REVALIDATE, tags: ["feed", "podcasts"] }
    );
    return unwrapArray(res);
  },

  async getTopics(): Promise<string[]> {
    const res = await serverFetch<any>("/news/feed/topics", {
      revalidate: 300,
      tags: ["feed", "topics"],
    });
    // Topics come back as plain strings (e.g. ["General"]), not feed items, so
    // they must not go through FeedItemResponseSchema — it rejects every one of
    // them and getTopics silently returns an empty list.
    return toArray(res).filter((topic): topic is string => typeof topic === "string");
  },

  async getTopicFeed(topic: string, limit = 10): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<any>(
      `/news/feed/topics/${encodeURIComponent(topic)}?limit=${limit}`,
      { revalidate: REVALIDATE, tags: ["feed", `topic-${topic}`] }
    );
    return unwrapArray(res);
  },

  async getCategoryFeed(
    category: string,
    limit = 10
  ): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<any>(
      `/news/feed/category/${encodeURIComponent(category)}?limit=${limit}`,
      { revalidate: REVALIDATE, tags: ["feed", `category-${category}`] }
    );
    return unwrapArray(res);
  },

  async getActiveBreakingNews(): Promise<BreakingNewsTickerResponseDto[]> {
    const res = await serverFetch<any>("/api/v1/news/feed/breaking", {
      revalidate: REVALIDATE,
      tags: ["feed", "breaking"],
    });

    let items: any[] = [];
    if (Array.isArray(res)) items = res;
    else if (res && Array.isArray(res.content)) items = res.content;
    else if (res && Array.isArray(res.data)) items = res.data;
    else if (res && Array.isArray(res.items)) items = res.items;

    return items.map((item) => {
      const parsed = BreakingNewsTickerResponseSchema.safeParse(item);
      if (parsed.success) return parsed.data;
      console.warn("Breaking news schema validation failed", parsed.error);
      return null;
    }).filter(Boolean) as BreakingNewsTickerResponseDto[];
  },
};
