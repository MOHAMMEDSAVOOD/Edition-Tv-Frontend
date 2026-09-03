/**
 * Search Repository — Client Component only
 *
 * Search is user-triggered from a Client Component search box.
 * Uses apiClient (browser-side). Not called during SSR.
 */
import { apiClient } from "@/lib/api-client";

export interface SearchHitDto {
  articleId: string;
  title: string;
  summary: string;
  category: string;
  author?: string;
  score?: number;
  highlightedTitle?: string;
  highlightedContent?: string;
}

export interface SearchResultPageDto {
  items: SearchHitDto[];
  totalHits: number;
  page: number;
  size: number;
}

export const searchRepository = {
  async search(
    query: string,
    page = 0,
    size = 10
  ): Promise<SearchResultPageDto> {
    return apiClient.get<SearchResultPageDto>(
      `/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
  },

  async suggest(query: string): Promise<string[]> {
    return apiClient.get<string[]>(
      `/search/suggest?prefix=${encodeURIComponent(query)}`
    );
  },
};
