import { searchRepository, SearchHitDto } from "@/repositories/searchRepository";
import { Article } from "@/types/models";

export interface SearchResultItem extends Article {
  headline: string;
}

export interface SearchResponse {
  hits: SearchResultItem[];
  totalHits: number;
}

function mapHitToResult(hit: SearchHitDto): SearchResultItem {
  const slugText = (hit.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "article";
  return {
    id: hit.articleId || `art-${Date.now()}`,
    slug: slugText,
    headline: hit.title || "Headline",
    title: hit.title || "Headline",
    subtitle: hit.summary || "",
    summary: hit.summary || "",
    bodyHtml: `<p>${hit.summary || ""}</p>`,
    category: hit.category || "General",
    topic: hit.category || "Global",
    authorId: "1",
    authorName: hit.author || "Edition News Desk",
    authorTitle: "Correspondent",
    publishedAt: "Recently",
    readingTime: "5 min read",
    readingTimeMinutes: 5,
    featuredImageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80",
    viewsCount: 1200,
    commentsCount: 15,
    summaryPoints: [],
    tags: [hit.category ? hit.category.toLowerCase() : "news"],
  };
}

export const searchService = {
  async search(query: string, page = 1, pageSize = 10): Promise<SearchResponse> {
    if (!query.trim()) {
      return { hits: [], totalHits: 0 };
    }
    const result = await searchRepository.search(query, page - 1, pageSize);
    const hits = (result?.items || []).map(mapHitToResult);
    return {
      hits,
      totalHits: result?.totalHits || hits.length,
    };
  },
};
