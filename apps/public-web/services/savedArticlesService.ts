import { savedArticlesRepository } from "@/repositories/savedArticlesRepository";
import { feedRepository } from "@/repositories/feedRepository";
import { feedMapper } from "@/mappers/feedMapper";
import { apiClient } from "@/lib/api-client";
import { Article } from "@/types/models";

function notifyBookmarkChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("edition_bookmark_changed"));
  }
}

export const savedArticlesService = {
  async getSavedArticles(): Promise<Article[]> {
    try {
      const dtos = await savedArticlesRepository.getSavedArticles();
      if (!dtos || dtos.length === 0) return [];

      // Fetch public feed for fast lookup
      let feedItems: Article[] = [];
      try {
        const feed = await feedRepository.getPublicFeed(0, 50);
        feedItems = (feed || []).map(feedMapper.toArticleFeedItem);
      } catch {
        // Fallback to direct resolution
      }

      // Resolve each bookmarked article directly from production API
      const articlePromises = dtos.map(async (dto) => {
        const targetId = dto.articleId || dto.id;
        if (!targetId) return null;

        // 1. Check in feedItems
        const fromFeed = feedItems.find(
          (item) => item.id === targetId || item.slug === targetId
        );
        if (fromFeed) return fromFeed;

        // 2. Fetch directly from production API by ID / slug
        try {
          const res = await apiClient.get<any>(`/articles/${encodeURIComponent(targetId)}`);
          if (res && (res.id || res.slug || res.headline || res.title)) {
            return feedMapper.toArticleFeedItem(res);
          }
        } catch {
          // If article is deleted or unreachable (404), clean up orphan bookmark
          savedArticlesRepository.unsaveArticle(targetId).catch(() => {});
        }

        return null;
      });

      const resolved = await Promise.all(articlePromises);
      return resolved.filter((a): a is Article => a !== null);
    } catch {
      return [];
    }
  },

  async getSavedCount(): Promise<number> {
    try {
      const dtos = await savedArticlesRepository.getSavedArticles();
      return Array.isArray(dtos) ? dtos.length : 0;
    } catch {
      return 0;
    }
  },

  async saveArticle(articleId: string, _article?: Article): Promise<void> {
    await savedArticlesRepository.saveArticle(articleId);
    notifyBookmarkChange();
  },

  async unsaveArticle(articleId: string): Promise<void> {
    await savedArticlesRepository.unsaveArticle(articleId);
    notifyBookmarkChange();
  },

  async checkIsSaved(articleId: string): Promise<boolean> {
    return await savedArticlesRepository.checkIsSaved(articleId);
  },
};
