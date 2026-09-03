export interface FeedItemResponseDto {
  articleId?: string;
  id?: string;
  headline: string;
  slug: string;
  summary: string;
  authorId?: string;
  authorName?: string;
  category?: string;
  publishedAt?: string;
  viewCount?: number;
  trendingScore?: number;
  featuredImageUrl?: string;
}

export interface BreakingNewsTickerResponseDto {
  id: string;
  headline: string;
  slug: string;
  tickerText: string;
  urgencyLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  expiresAt?: string;
  active?: boolean;
  createdAt?: string;
}
