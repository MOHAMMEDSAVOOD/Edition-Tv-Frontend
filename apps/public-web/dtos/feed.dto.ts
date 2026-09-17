import { z } from "zod";

export const FeedItemResponseSchema = z.object({
  articleId: z.string().optional(),
  id: z.string().optional(),
  headline: z.string(),
  slug: z.string(),
  summary: z.string(),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  category: z.string().optional(),
  publishedAt: z.string().optional(),
  viewCount: z.number().optional(),
  trendingScore: z.number().optional(),
  featuredImageUrl: z.string().optional(),
}).passthrough();

export type FeedItemResponseDto = z.infer<typeof FeedItemResponseSchema>;

export const BreakingNewsTickerResponseSchema = z.object({
  id: z.string(),
  headline: z.string(),
  slug: z.string(),
  tickerText: z.string(),
  urgencyLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  expiresAt: z.string().optional(),
  active: z.boolean().optional(),
  createdAt: z.string().optional(),
}).passthrough();

export type BreakingNewsTickerResponseDto = z.infer<typeof BreakingNewsTickerResponseSchema>;
