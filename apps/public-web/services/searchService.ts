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
  const text = (hit.summary || "") + " " + (hit.title || "");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const computedMins = Math.max(1, Math.ceil(wordCount / 200));

  return {
    id: hit.articleId || `art-${Date.now()}`,
    slug: slugText,
    headline: hit.title || "",
    title: hit.title || "",
    subtitle: hit.summary || "",
    summary: hit.summary || "",
    bodyHtml: hit.summary ? `<p>${hit.summary}</p>` : "",
    category: hit.category || "News",
    topic: hit.category || "News",
    authorId: "1",
    authorName: hit.author || "Edition Staff",
    authorTitle: "Correspondent",
    publishedAt: "",
    readingTime: `${computedMins} min read`,
    readingTimeMinutes: computedMins,
    featuredImageUrl: "",
    viewsCount: 0,
    commentsCount: 0,
    likesCount: 0,
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
