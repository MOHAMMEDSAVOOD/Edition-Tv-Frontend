import { feedRepository } from "@/repositories/feedRepository";
import { marketRepository } from "@/repositories/marketRepository";
import { weatherRepository } from "@/repositories/weatherRepository";
import { feedMapper } from "@/mappers/feedMapper";
import { Article } from "@/types/models";

export interface ArticleFeedItem extends Article {
  headline: string;
}

export interface FeedResponse {
  items: ArticleFeedItem[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

export interface CityWeather {
  city: string;
  country: string;
  tempC: number;
  tempF: number;
  condition: string;
  icon: "sun" | "cloud" | "rain" | "snow";
}

export const feedService = {
  async getPublicFeed(page = 1, pageSize = 10): Promise<FeedResponse> {
    const dtos = await feedRepository.getPublicFeed(Math.max(0, page - 1), pageSize);
    const items = (dtos || []).map(feedMapper.toArticleFeedItem);
    return {
      items,
      page,
      pageSize,
      totalItems: items.length,
    };
  },

  async getTrendingFeed(limit = 5): Promise<ArticleFeedItem[]> {
    const dtos = await feedRepository.getTrendingFeed(limit);
    return (dtos || []).map(feedMapper.toArticleFeedItem);
  },

  async getActiveBreakingNews() {
    const dtos = await feedRepository.getActiveBreakingNews();
    return (dtos || []).map(feedMapper.toBreakingNewsItem);
  },

  async getEditorsPicks(limit = 4): Promise<ArticleFeedItem[]> {
    const dtos = await feedRepository.getEditorsPicks(limit);
    return (dtos || []).map(feedMapper.toArticleFeedItem);
  },

  async getOpinions(limit = 4): Promise<ArticleFeedItem[]> {
    const dtos = await feedRepository.getOpinions(limit);
    return (dtos || []).map(feedMapper.toArticleFeedItem);
  },

  async getInvestigations(limit = 3): Promise<ArticleFeedItem[]> {
    const dtos = await feedRepository.getInvestigations(limit);
    return (dtos || []).map(feedMapper.toArticleFeedItem);
  },

  async getVideos(limit = 3): Promise<ArticleFeedItem[]> {
    const dtos = await feedRepository.getVideos(limit);
    return (dtos || []).map(feedMapper.toArticleFeedItem);
  },

  async getPodcasts(limit = 3): Promise<ArticleFeedItem[]> {
    const dtos = await feedRepository.getPodcasts(limit);
    return (dtos || []).map(feedMapper.toArticleFeedItem);
  },

  async getRecommendedStories(limit = 4): Promise<ArticleFeedItem[]> {
    const dtos = await feedRepository.getRecommendations(limit);
    return (dtos || []).map(feedMapper.toArticleFeedItem);
  },

  async getPopularThisWeek(limit = 5): Promise<ArticleFeedItem[]> {
    const dtos = await feedRepository.getTrendingFeed(limit);
    return (dtos || []).map(feedMapper.toArticleFeedItem);
  },

  async getFeedByCategory(category: string, page = 1, pageSize = 12): Promise<FeedResponse> {
    const dtos = await feedRepository.getCategoryFeed(category, pageSize);
    const items = (dtos || []).map(feedMapper.toArticleFeedItem);
    return {
      items,
      page,
      pageSize,
      totalItems: items.length,
    };
  },

  async getFeedByTopic(topic: string, page = 1, pageSize = 12): Promise<FeedResponse> {
    const dtos = await feedRepository.getTopicFeed(topic, pageSize);
    const items = (dtos || []).map(feedMapper.toArticleFeedItem);
    return {
      items,
      page,
      pageSize,
      totalItems: items.length,
    };
  },

  async getTopics(): Promise<string[]> {
    return feedRepository.getTopics();
  },

  async getFeedByAuthor(authorId: string, page = 1, pageSize = 12): Promise<FeedResponse> {
    const dtos = await feedRepository.getPublicFeed(page - 1, pageSize);
    const items = (dtos || []).map(feedMapper.toArticleFeedItem);
    return {
      items,
      page,
      pageSize,
      totalItems: items.length,
    };
  },

  async getMarketSnapshot(): Promise<MarketIndex[]> {
    try {
      const dtos = await marketRepository.getSnapshot();
      return (dtos || []).map((dto) => {
        const isPos = dto.change >= 0;
        const changeSign = isPos ? "+" : "";
        return {
          symbol: dto.symbol,
          name: dto.name,
          value: dto.currency === "USD" ? `$${dto.price.toLocaleString("en-US")}` : `${dto.price.toLocaleString("en-US")} ${dto.currency}`,
          change: `${changeSign}${dto.change.toFixed(2)}`,
          changePercent: `${changeSign}${dto.changePercent.toFixed(2)}%`,
          isPositive: isPos,
        };
      });
    } catch {
      return [];
    }
  },

  async getWeatherSnapshot(): Promise<CityWeather[]> {
    try {
      const dtos = await weatherRepository.getSnapshot();
      return (dtos || []).map((dto) => ({
        city: dto.city,
        country: dto.country,
        tempC: dto.tempC,
        tempF: dto.tempF,
        condition: dto.condition,
        icon: (dto.icon as "sun" | "cloud" | "rain" | "snow") || "cloud",
      }));
    } catch {
      return [];
    }
  },
};
