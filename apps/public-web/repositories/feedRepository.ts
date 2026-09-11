/**
 * Feed Repository — Server Component safe
 *
 * All methods use `serverFetch` (not apiClient) because:
 * - Feed endpoints are public (no auth required)
 * - These are called from Next.js Server Components during SSR/ISR
 * - serverFetch never throws — returns null on failure
 */
import { serverFetch } from "@/lib/api-client";
import { FeedItemResponseDto, BreakingNewsTickerResponseDto } from "@/dtos/feed.dto";

const REVALIDATE = 0;

function unwrapArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (Array.isArray(val.content)) return val.content;
  if (Array.isArray(val.data)) return val.data;
  if (Array.isArray(val.articles)) return val.articles;
  if (Array.isArray(val.items)) return val.items;
  return [];
}

export const feedRepository = {
  async getPublicFeed(
    page = 0,
    size = 10
  ): Promise<FeedItemResponseDto[]> {
    const candidateEndpoints = [
      `/articles?status=PUBLISHED&page=${page}&size=${size}`,
      `/news/feed?page=${page}&size=${size}`,
      `/public/articles?status=PUBLISHED`,
    ];

    const results = await Promise.allSettled(
      candidateEndpoints.map((ep) => serverFetch<any>(ep, { revalidate: REVALIDATE, tags: ["feed"] }))
    );

    let allItems: any[] = [];
    for (const res of results) {
      if (res.status === "fulfilled" && res.value) {
        const items = unwrapArray(res.value);
        if (items.length > 0) {
          allItems.push(...items);
        }
      }
    }

    const publishedOnly = allItems.filter((item: any) => {
      if (item.wireItemId || item.wireSource || item.isWireItem) return false;
      if (item.status && String(item.status).toUpperCase() !== "PUBLISHED") return false;
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
      `/news/feed/trending?limit=${limit}`,
      { revalidate: REVALIDATE, tags: ["feed", "trending"] }
    );
    const items = unwrapArray(res);
    if (items.length > 0) return items;
    return (await this.getPublicFeed(0, limit)).slice(0, limit);
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
    return unwrapArray(res);
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
    const res = await serverFetch<any>(
      "/news/feed/breaking",
      {
        revalidate: 30,
        tags: ["feed", "breaking"],
      }
    );
    return unwrapArray(res);
  },
};
