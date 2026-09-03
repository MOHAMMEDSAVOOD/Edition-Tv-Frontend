/**
 * Feed Repository — Server Component safe
 *
 * All methods use `serverFetch` (not apiClient) because:
 * - Feed endpoints are public (no auth required)
 * - These are called from Next.js Server Components during SSR/ISR
 * - serverFetch never throws — returns null on failure
 *
 * ISR revalidation: 60s (matches `export const revalidate = 60` in page.tsx)
 */
import { serverFetch } from "@/lib/api-client";
import { FeedItemResponseDto, BreakingNewsTickerResponseDto } from "@/dtos/feed.dto";

const REVALIDATE = 0;

export const feedRepository = {
  async getPublicFeed(
    page = 0,
    size = 10
  ): Promise<FeedItemResponseDto[]> {
    const res = await serverFetch<FeedItemResponseDto[]>(
      `/public/articles`,
      { revalidate: REVALIDATE, tags: ["feed"] }
    );
    if (res && Array.isArray(res)) {
      return res;
    }
    return (
      (await serverFetch<FeedItemResponseDto[]>(
        `/news/feed?page=${page}&size=${size}`,
        { revalidate: REVALIDATE, tags: ["feed"] }
      )) ?? []
    );
  },

  async getCurationSlotPlacements(slotType: string): Promise<any[]> {
    return (
      (await serverFetch<any[]>(
        `/public/curation/slots/${encodeURIComponent(slotType)}`,
        { revalidate: REVALIDATE, tags: ["curation", slotType] }
      )) ?? []
    );
  },

  async getTrendingFeed(limit = 10): Promise<FeedItemResponseDto[]> {
    return (
      (await serverFetch<FeedItemResponseDto[]>(
        `/news/feed/trending?limit=${limit}`,
        { revalidate: REVALIDATE, tags: ["feed", "trending"] }
      )) ?? []
    );
  },

  async getEditorsPicks(limit = 4): Promise<FeedItemResponseDto[]> {
    return (
      (await serverFetch<FeedItemResponseDto[]>(
        `/news/feed/editors-picks?limit=${limit}`,
        { revalidate: REVALIDATE, tags: ["feed", "editors-picks"] }
      )) ?? []
    );
  },

  async getRecommendations(limit = 4): Promise<FeedItemResponseDto[]> {
    return (
      (await serverFetch<FeedItemResponseDto[]>(
        `/news/feed/recommendations?limit=${limit}`,
        { revalidate: REVALIDATE, tags: ["feed"] }
      )) ?? []
    );
  },

  async getOpinions(limit = 4): Promise<FeedItemResponseDto[]> {
    return (
      (await serverFetch<FeedItemResponseDto[]>(
        `/news/feed/opinions?limit=${limit}`,
        { revalidate: REVALIDATE, tags: ["feed", "opinions"] }
      )) ?? []
    );
  },

  async getInvestigations(limit = 3): Promise<FeedItemResponseDto[]> {
    return (
      (await serverFetch<FeedItemResponseDto[]>(
        `/news/feed/investigations?limit=${limit}`,
        { revalidate: REVALIDATE, tags: ["feed", "investigations"] }
      )) ?? []
    );
  },

  async getVideos(limit = 3): Promise<FeedItemResponseDto[]> {
    return (
      (await serverFetch<FeedItemResponseDto[]>(
        `/news/feed/videos?limit=${limit}`,
        { revalidate: REVALIDATE, tags: ["feed", "videos"] }
      )) ?? []
    );
  },

  async getPodcasts(limit = 3): Promise<FeedItemResponseDto[]> {
    return (
      (await serverFetch<FeedItemResponseDto[]>(
        `/news/feed/podcasts?limit=${limit}`,
        { revalidate: REVALIDATE, tags: ["feed", "podcasts"] }
      )) ?? []
    );
  },

  async getTopics(): Promise<string[]> {
    return (
      (await serverFetch<string[]>("/news/feed/topics", {
        revalidate: 300, // topics change less frequently
        tags: ["feed", "topics"],
      })) ?? []
    );
  },

  async getTopicFeed(topic: string, limit = 10): Promise<FeedItemResponseDto[]> {
    return (
      (await serverFetch<FeedItemResponseDto[]>(
        `/news/feed/topics/${encodeURIComponent(topic)}?limit=${limit}`,
        { revalidate: REVALIDATE, tags: ["feed", `topic-${topic}`] }
      )) ?? []
    );
  },

  async getCategoryFeed(
    category: string,
    limit = 10
  ): Promise<FeedItemResponseDto[]> {
    return (
      (await serverFetch<FeedItemResponseDto[]>(
        `/news/feed/category/${encodeURIComponent(category)}?limit=${limit}`,
        { revalidate: REVALIDATE, tags: ["feed", `category-${category}`] }
      )) ?? []
    );
  },

  async getActiveBreakingNews(): Promise<BreakingNewsTickerResponseDto[]> {
    return (
      (await serverFetch<BreakingNewsTickerResponseDto[]>(
        "/news/feed/breaking",
        {
          revalidate: 30, // breaking news revalidates more aggressively
          tags: ["feed", "breaking"],
        }
      )) ?? []
    );
  },
};
