// User & Auth DTOs
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  email: string;
  roles: string[];
}

// Article DTOs
export interface ArticleFeedItem {
  id: string;
  slug: string;
  headline: string;
  summary: string;
  category: string;
  authorName: string;
  publishedAt: string;
  readingTimeMinutes: number;
  featuredImageUrl?: string;
  isBreaking?: boolean;
}

export interface ArticleDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  category: string;
  authorId: string;
  authorName: string;
  authorTitle: string;
  publishedAt: string;
  readingTime: string;
  summaryPoints: string[];
  toxicityScore: number;
}

// Comment DTOs
export interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
  likesCount: number;
  status: "APPROVED" | "PENDING_MODERATION" | "REJECTED";
  toxicityScore: number;
  replies?: CommentItem[];
}

// Live Blog DTOs
export interface LiveBlogUpdate {
  id: string;
  timestamp: string;
  headline: string;
  content: string;
  isPinned: boolean;
}

export interface LiveBlogDetail {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: "ACTIVE" | "PAUSED" | "CLOSED";
  updates: LiveBlogUpdate[];
}

// Search DTOs
export interface SearchResponse {
  query: string;
  results: ArticleFeedItem[];
  totalResults: number;
}

// Feed DTOs
export interface FeedResponse {
  items: ArticleFeedItem[];
  page: number;
  pageSize: number;
  totalItems: number;
}
