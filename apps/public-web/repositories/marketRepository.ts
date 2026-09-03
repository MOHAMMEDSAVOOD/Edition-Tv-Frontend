/**
 * Market Repository — Server Component safe
 * Uses serverFetch (not apiClient) — market data is public, called during SSR.
 */
import { serverFetch } from "@/lib/api-client";

export interface MarketSnapshotDto {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  lastUpdated: string;
}

export const marketRepository = {
  async getSnapshot(): Promise<MarketSnapshotDto[]> {
    return (
      (await serverFetch<MarketSnapshotDto[]>("/market/snapshot", {
        revalidate: 60,
        tags: ["market"],
      })) ?? []
    );
  },
};
