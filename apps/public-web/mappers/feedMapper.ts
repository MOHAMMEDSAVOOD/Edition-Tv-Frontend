import { FeedItemResponseDto, BreakingNewsTickerResponseDto } from "@/dtos/feed.dto";
import { ArticleFeedItem } from "@/services/feedService";

function getHighResImageUrl(url?: string): string | undefined {
  if (!url || url.trim() === "") return undefined;
  if (url.includes("ichef.bbci.co.uk")) {
    return url.replace(/\/standard\/\d+\//, "/standard/800/");
  }
  if (url.includes("w=") || url.includes("width=")) {
    return url.replace(/([?&]w=)\d+/gi, "$11200").replace(/([?&]width=)\d+/gi, "$11200");
  }
  return url;
}


export const feedMapper = {
  toArticleFeedItem(dto: any): ArticleFeedItem {
    if (!dto) {
      return {
        id: "",
        slug: "",
        headline: "",
        title: "",
        subtitle: "",
        summary: "",
        bodyHtml: "",
        category: "",
        topic: "",
        authorId: "",
        authorName: "",
        authorTitle: "",
        publishedAt: "",
        readingTime: "",
        readingTimeMinutes: 0,
        featuredImageUrl: "",
        viewsCount: 0,
        likesCount: 0,
        commentsCount: 0,
        tags: [],
        summaryPoints: [],
      };
    }

    const rawDate = dto.publishedAt || dto.createdAt || dto.webPublishedAt || dto.updatedAt;
    let publishedAt = "";
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        publishedAt = parsed.toISOString();
      }
    }

    const headlineText = dto.headline || dto.title || dto.name || "";
    const summaryText = dto.summary || dto.content || dto.description || dto.leadParagraph || "";
    const categoryName = typeof dto.category === "string" ? dto.category : (dto.category?.name || "");

    // Compute real reading time from actual text
    const fullText = (summaryText || "") + " " + (headlineText || "");
    const cleanWords = fullText.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
    const wordCount = cleanWords.split(/\s+/).filter(Boolean).length;
    const computedMinutes = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;

    return {
      id: String(dto.articleId || dto.id || dto.slug || ""),
      slug: dto.slug || String(dto.id || ""),
      headline: headlineText,
      title: headlineText,
      subtitle: summaryText,
      summary: summaryText,
      bodyHtml: summaryText ? `<p>${summaryText}</p>` : "",
      category: categoryName,
      topic: dto.topic || categoryName,
      authorId: String(dto.authorId || dto.author?.id || ""),
      authorName: dto.authorName || dto.author?.name || dto.author?.username || "",
      authorTitle: dto.authorTitle || "",
      publishedAt,
      readingTime: computedMinutes > 0 ? `${computedMinutes} min read` : "",
      readingTimeMinutes: computedMinutes,
      featuredImageUrl: getHighResImageUrl(
        dto.featuredImageUrl ||
        dto.coverImageUrl ||
        dto.mediaThumbnailUrl ||
        dto.imageUrl ||
        dto.url ||
        ""
      ) || "",
      viewsCount: Number(dto.viewCount || dto.viewsCount || 0),
      likesCount: Number(dto.likeCount || dto.likesCount || 0),
      commentsCount: Number(dto.commentsCount || dto.commentCount || 0),
      tags: dto.tags || (categoryName ? [categoryName.toLowerCase()] : []),
      summaryPoints: dto.summaryPoints || [],
    };
  },

  toBreakingNewsItem(dto: BreakingNewsTickerResponseDto) {
    return {
      id: dto.id,
      headline: dto.headline,
      slug: dto.slug,
      tickerText: dto.tickerText || dto.headline,
      urgencyLevel: dto.urgencyLevel || "HIGH",
    };
  },
};
