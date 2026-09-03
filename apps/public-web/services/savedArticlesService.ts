import { savedArticlesRepository } from "@/repositories/savedArticlesRepository";
import { feedRepository } from "@/repositories/feedRepository";
import { feedMapper } from "@/mappers/feedMapper";
import { Article } from "@/types/models";

export const savedArticlesService = {
  async getSavedArticles(): Promise<Article[]> {
    try {
      const dtos = await savedArticlesRepository.getSavedArticles();
      if (!dtos || dtos.length === 0) return [];

      const feed = await feedRepository.getPublicFeed(0, 50);
      const feedItems = (feed || []).map(feedMapper.toArticleFeedItem);

      const savedArticleIds = new Set(dtos.map((d) => d.articleId));
      return feedItems.filter((item) => savedArticleIds.has(item.id) || savedArticleIds.has(item.slug));
    } catch {
      return [];
    }
  },

  async saveArticle(articleId: string): Promise<void> {
    await savedArticlesRepository.saveArticle(articleId);
  },

  async unsaveArticle(articleId: string): Promise<void> {
    await savedArticlesRepository.unsaveArticle(articleId);
  },

  async checkIsSaved(articleId: string): Promise<boolean> {
    try {
      return await savedArticlesRepository.checkIsSaved(articleId);
    } catch {
      return false;
    }
  },
};
