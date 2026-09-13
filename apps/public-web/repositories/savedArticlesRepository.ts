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
      const raw = await apiClient.get<any>("/bookmarks");
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw.content)) return raw.content;
      if (Array.isArray(raw.data)) return raw.data;
      if (Array.isArray(raw.items)) return raw.items;
      if (typeof raw === "object" && (raw.articleId || raw.id)) {
        return [raw as SavedArticleEntityDto];
      }
      return [];
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
      try {
        const res = await apiClient.get<BookmarkStatusDto>(`/bookmarks/check/${articleId}`);
        if (typeof res?.saved === "boolean") return res.saved;
      } catch {
        // Fallback: check bookmarks list directly
        const list = await this.getSavedArticles();
        return list.some((b) => b.articleId === articleId);
      }
      return false;
    } catch {
      return false;
    }
  },
};
