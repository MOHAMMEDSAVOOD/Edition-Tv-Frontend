import { z } from "zod";

export const ArticleResponseSchema = z.object({
  id: z.string().optional(),
  articleId: z.string().optional(),
  headline: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().default(""), // Provide a fallback if slug is undefined or malformed
  summary: z.string().optional(),
  subtitle: z.string().optional(),
  contentBody: z.string().optional(),
  bodyHtml: z.string().optional(),
  status: z.string().optional(),
  primaryAuthorId: z.string().optional(),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  authorTitle: z.string().optional(),
  publishedAt: z.string().optional(),
  category: z.string().optional(),
  topic: z.string().optional(),
  readingTime: z.string().optional(),
  featuredImageUrl: z.string().optional(),
  summaryPoints: z.array(z.string()).optional(),
  toxicityScore: z.number().optional(),
  viewCount: z.number().optional(),
}).passthrough();

export type ArticleResponseDto = z.infer<typeof ArticleResponseSchema>;

