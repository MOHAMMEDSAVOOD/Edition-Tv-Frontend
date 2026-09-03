export interface ArticleResponseDto {
  id?: string;
  articleId?: string;
  headline?: string;
  title?: string;
  slug: string;
  summary?: string;
  subtitle?: string;
  contentBody?: string;
  bodyHtml?: string;
  status?: string;
  primaryAuthorId?: string;
  authorId?: string;
  authorName?: string;
  authorTitle?: string;
  publishedAt?: string;
  category?: string;
  topic?: string;
  readingTime?: string;
  featuredImageUrl?: string;
  summaryPoints?: string[];
  toxicityScore?: number;
  viewCount?: number;
}
