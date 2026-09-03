"use client";
import { useState, useEffect, useCallback } from "react";
import { feedService, ArticleFeedItem, FeedResponse } from "@/services/feedService";

export function usePublicFeed(page = 1, pageSize = 10) {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await feedService.getPublicFeed(page, pageSize);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Failed to fetch public feed"));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { data, isLoading, isError, error, refetch: fetchFeed };
}

export function useTrendingFeed(limit = 5) {
  const [data, setData] = useState<ArticleFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await feedService.getTrendingFeed(limit);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error("Failed to fetch trending feed"));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return { data, isLoading, isError, error, refetch: fetchTrending };
}

export function useBreakingNews() {
  const [data, setData] = useState<Array<{ id: string; headline: string; slug: string; tickerText: string; urgencyLevel: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchBreaking = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await feedService.getActiveBreakingNews();
      setData(res);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBreaking();
  }, [fetchBreaking]);

  return { data, isLoading, isError, refetch: fetchBreaking };
}
