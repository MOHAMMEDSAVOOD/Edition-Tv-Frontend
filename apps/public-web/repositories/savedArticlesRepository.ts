import { apiClient } from "@/lib/api-client";

export interface SavedArticleEntityDto {
  id: string;
  userId: string;
  articleId: string;
  savedAt: string;
}

export interface BookmarkStatusDto {
  saved: boolean;
}

export const savedArticlesRepository = {
  async getSavedArticles(): Promise<SavedArticleEntityDto[]> {
    try {
      if (!apiClient.getAccessToken()) return [];
      return await apiClient.get<SavedArticleEntityDto[]>("/bookmarks");
    } catch {
      return [];
    }
  },

  async saveArticle(articleId: string): Promise<SavedArticleEntityDto> {
    return apiClient.post<SavedArticleEntityDto>("/bookmarks", { articleId });
  },

  async unsaveArticle(articleId: string): Promise<void> {
    return apiClient.delete<void>(`/bookmarks/${articleId}`);
  },

  async checkIsSaved(articleId: string): Promise<boolean> {
    try {
      if (!apiClient.getAccessToken()) return false;
      const res = await apiClient.get<BookmarkStatusDto>(`/bookmarks/check/${articleId}`);
      return res?.saved || false;
    } catch {
      return false;
    }
  },
};
