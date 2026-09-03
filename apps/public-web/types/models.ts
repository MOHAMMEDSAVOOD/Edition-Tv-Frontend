export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  bodyHtml: string;
  category: string;
  topic: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorTitle: string;
  authorAvatar?: string;
  publishedAt: string;
  readingTime: string;
  readingTimeMinutes: number;
  featuredImageUrl: string;
  imageCaption?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isEditorsPick?: boolean;
  isTrending?: boolean;
  isInvestigation?: boolean;
  isOpinion?: boolean;
  isFactCheck?: boolean;
  isPodcast?: boolean;
  isVideo?: boolean;
  viewsCount: number;
  commentsCount: number;
  summaryPoints: string[];
  audioUrl?: string;
  relatedSlugs?: string[];
}

export interface Author {
  id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  avatarUrl: string;
  socialX?: string;
  socialLinkedIn?: string;
  articlesCount: number;
  specializations: string[];
  joinedYear: number;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likesCount: number;
  status: "APPROVED" | "PENDING_MODERATION" | "REJECTED";
  toxicityScore: number;
  parentId?: string | null;
  replies?: Comment[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link: string;
  type: "BREAKING" | "AUTHOR" | "TOPIC" | "SYSTEM";
}

export interface BreakingNewsItem {
  id: string;
  headline: string;
  slug: string;
  tickerText: string;
  urgencyLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  publishedAt: string;
}

export interface LiveBlogEvent {
  id: string;
  slug: string;
  title: string;
  isLive: boolean;
  category: string;
  startedAt: string;
  updateCount: number;
  latestUpdateText: string;
}

export interface NewsletterItem {
  id: string;
  name: string;
  description: string;
  frequency: string;
  subscriberCount: number;
  previewUrl: string;
}
