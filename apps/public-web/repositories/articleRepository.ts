/**
 * Article Repository — Server Component safe
 *
 * getArticleBySlug / getArticleById are called from Server Components (article detail page).
 * Uses serverFetch for public reads, returns null on failure (let page.tsx handle 404).
 */
import { serverFetch } from "@/lib/api-client";
import { ArticleResponseDto } from "@/dtos/article.dto";

export const articleRepository = {
  async getArticleBySlug(slug: string): Promise<ArticleResponseDto | null> {
    const res = await serverFetch<any>(`/articles/slug/${encodeURIComponent(slug)}`, { revalidate: 0, cache: "no-store" });
    if (res) {
      const item = Array.isArray(res) ? res[0] : (res.content && Array.isArray(res.content)) ? res.content[0] : res;
      if (item && (item.slug || item.headline || item.title)) return item;
    }

    const fallbackRes = await serverFetch<any>(`/news/feed/slug/${encodeURIComponent(slug)}`, { revalidate: 0, cache: "no-store" });
    if (fallbackRes) {
      const item = Array.isArray(fallbackRes) ? fallbackRes[0] : (fallbackRes.content && Array.isArray(fallbackRes.content)) ? fallbackRes.content[0] : fallbackRes;
      if (item && (item.slug || item.headline || item.title)) return item;
    }

    return null;
  },

  async getArticleById(id: string): Promise<ArticleResponseDto | null> {
    const res = await serverFetch<any>(`/articles/${id}`, { revalidate: 0, cache: "no-store" });
    if (res) {
      return Array.isArray(res) ? res[0] : (res.content && Array.isArray(res.content)) ? res.content[0] : res;
    }
    return null;
  },
};
