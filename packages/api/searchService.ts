import { apiClient } from "./api-client";
import { ArticleFeedItem } from "./feedService";

export interface SearchResponse {
  query: string;
  results: ArticleFeedItem[];
  totalResults: number;
}

export const searchService = {
  async search(query: string): Promise<SearchResponse> {
    try {
      return await apiClient.get<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
    } catch {
      return {
        query,
        results: [
          {
            id: "1",
            slug: "enterprise-ai-standards",
            headline: "Global AI Engineering Standard Adopted Across Enterprise Systems",
            summary: "Next-generation editorial architectures, transactional outbox event relay, and AI toxicity moderation.",
            category: "Technology",
            authorName: "Elena Rostova",
            publishedAt: "2026-08-07T12:00:00Z",
            readingTimeMinutes: 5,
          },
        ],
        totalResults: 1,
      };
    }
  },
};
