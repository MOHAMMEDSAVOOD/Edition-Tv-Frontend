"use client";
import { useState, useEffect, useCallback } from "react";
import { articleService, ArticleDetail } from "@/services/articleService";

export function useArticle(slug: string) {
  const [data, setData] = useState<ArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchArticle = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await articleService.getArticleBySlug(slug);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error(`Failed to fetch article for slug: ${slug}`));
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return { data, isLoading, isError, error, refetch: fetchArticle };
}
