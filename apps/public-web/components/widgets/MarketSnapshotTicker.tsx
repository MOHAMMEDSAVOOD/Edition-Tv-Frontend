"use client";
import { useEffect, useState } from "react";
import { feedService, MarketIndex } from "@/services/feedService";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export function MarketSnapshotTicker() {
  const [markets, setMarkets] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedService.getMarketSnapshot().then((data) => {
      setMarkets(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="bg-background border-y border-border py-2 text-xs font-mono" suppressHydrationWarning>
        <div className="container mx-auto max-w-[1200px] px-4 md:px-6 flex items-center gap-4 animate-pulse" suppressHydrationWarning>
          <span className="text-muted-foreground">Loading Financial Markets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border-y border-border py-2 text-xs font-mono overflow-x-auto scrollbar-none" suppressHydrationWarning>
      <div className="container mx-auto max-w-[1200px] px-4 md:px-6 flex items-center justify-between gap-6 whitespace-nowrap" suppressHydrationWarning>
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground flex-none pr-4 border-r border-border">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span>Markets</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto flex-1 no-scrollbar">
          {markets.map((m) => (
            <div key={m.symbol} className="flex items-center gap-2 text-xs">
              <span className="font-bold text-foreground">{m.symbol}</span>
              <span className="text-muted-foreground">{m.value}</span>
              <span
                className={`flex items-center gap-0.5 text-[11px] font-semibold ${
                  m.isPositive ? "text-emerald-600 " : "text-rose-600 "
                }`}
              >
                {m.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {m.changePercent}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

