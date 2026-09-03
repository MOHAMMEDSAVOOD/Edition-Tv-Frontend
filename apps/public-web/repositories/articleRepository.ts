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
    // 1. Try canonical /articles/slug/${slug} FIRST for full contentBody & real-time updates
    const article = await serverFetch<ArticleResponseDto>(
      `/articles/slug/${slug}`,
      { revalidate: 0, cache: "no-store" }
    );

    if (article && (article.slug || article.headline)) {
      return article;
    }

    // 2. Fallback to news feed endpoint if canonical endpoint returns null
    return serverFetch<ArticleResponseDto>(`/news/feed/slug/${slug}`, {
      revalidate: 0,
      cache: "no-store",
    });
  },

  async getArticleById(id: string): Promise<ArticleResponseDto | null> {
    return serverFetch<ArticleResponseDto>(`/articles/${id}`, {
      revalidate: 0,
      cache: "no-store",
    });
  },
};
