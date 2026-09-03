/**
 * Weather Repository — Server Component safe
 * Uses serverFetch (not apiClient) — weather data is public, called during SSR.
 */
import { serverFetch } from "@/lib/api-client";

export interface CityWeatherDto {
  city: string;
  country: string;
  tempC: number;
  tempF: number;
  condition: string;
  icon: string;
}

export const weatherRepository = {
  async getSnapshot(): Promise<CityWeatherDto[]> {
    return (
      (await serverFetch<CityWeatherDto[]>("/weather/snapshot", {
        revalidate: 300, // weather updates less frequently
        tags: ["weather"],
      })) ?? []
    );
  },
};
