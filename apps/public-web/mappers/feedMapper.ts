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

function inferCategory(headline?: string, summary?: string): string {
  const text = ((headline || "") + " " + (summary || "")).toLowerCase();
  if (text.includes("f1") || text.includes("norris") || text.includes("piastri") || text.includes("football") || text.includes("man utd") || text.includes("maguire") || text.includes("rashford") || text.includes("serena") || text.includes("us open") || text.includes("djokovic") || text.includes("transfer") || text.includes("sport") || text.includes("match") || text.includes("league") || text.includes("shakur") || text.includes("grand prix")) {
    return "Sports";
  }
  if (text.includes("economic") || text.includes("bank") || text.includes("market") || text.includes("inflation") || text.includes("gdp") || text.includes("shares") || text.includes("trade") || text.includes("chancellor") || text.includes("business") || text.includes("company") || text.includes("profit") || text.includes("stock")) {
    return "Business";
  }
  if (text.includes("ai") || text.includes("cyber") || text.includes("software") || text.includes("code") || text.includes("digital") || text.includes("robot") || text.includes("tech") || text.includes("app") || text.includes("chip") || text.includes("gpu")) {
    return "Technology";
  }
  if (text.includes("stride") || text.includes("parliament") || text.includes("swinney") || text.includes("reform") || text.includes("government") || text.includes("minister") || text.includes("election") || text.includes("policy") || text.includes("tory") || text.includes("labour")) {
    return "Politics";
  }
  if (text.includes("vaccine") || text.includes("flu") || text.includes("nhs") || text.includes("hospital") || text.includes("health") || text.includes("doctor") || text.includes("patient")) {
    return "Health";
  }
  if (text.includes("strike") || text.includes("attack") || text.includes("police") || text.includes("court") || text.includes("ukraine") || text.includes("russia") || text.includes("kyiv") || text.includes("missile") || text.includes("war")) {
    return "World";
  }
  return "World";
}

export const feedMapper = {
  toArticleFeedItem(dto: any): ArticleFeedItem {
    if (!dto) {
      return {
        id: "placeholder",
        slug: "news-update",
        headline: "News Story",
        title: "News Story",
        subtitle: "",
        summary: "",
        bodyHtml: "",
        category: "World",
        topic: "World",
        authorId: "1",
        authorName: "Edition News Desk",
        authorTitle: "Correspondent",
        publishedAt: new Date().toLocaleDateString("en-US"),
        readingTime: "3 min read",
        readingTimeMinutes: 3,
        featuredImageUrl: "",
        viewsCount: 100,
        commentsCount: 0,
        tags: ["world"],
        summaryPoints: [],
      };
    }

    const publishedDate = dto.publishedAt || dto.createdAt ? new Date(dto.publishedAt || dto.createdAt) : new Date();
    const formattedDate = publishedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const headlineText = dto.headline || dto.title || dto.name || "News Update";
    const summaryText = dto.summary || dto.content || dto.description || dto.leadParagraph || "Latest news update from Edition TV.";
    const rawCategory = typeof dto.category === "string" ? dto.category : dto.category?.name;
    const categoryName = (rawCategory && rawCategory !== "General") ? rawCategory : inferCategory(headlineText, summaryText);

    return {
      id: String(dto.articleId || dto.id || dto.slug || Math.random()),
      slug: dto.slug || String(dto.id || "news-article"),
      headline: headlineText,
      title: headlineText,
      subtitle: summaryText,
      summary: summaryText,
      bodyHtml: `<p>${summaryText}</p>`,
      category: categoryName,
      topic: categoryName,
      authorId: String(dto.authorId || dto.author?.id || "1"),
      authorName: dto.authorName || dto.author?.name || dto.author?.username || "Edition News Desk",
      authorTitle: "Correspondent",
      publishedAt: formattedDate,
      readingTime: "4 min read",
      readingTimeMinutes: 4,
      featuredImageUrl: getHighResImageUrl(
        dto.featuredImageUrl ||
        dto.coverImageUrl ||
        dto.mediaThumbnailUrl ||
        dto.imageUrl ||
        dto.url ||
        ""
      ) || "",
      viewsCount: dto.viewCount || dto.viewsCount || 100,
      commentsCount: dto.commentsCount || 0,
      tags: [categoryName.toLowerCase()],
      summaryPoints: [],
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
