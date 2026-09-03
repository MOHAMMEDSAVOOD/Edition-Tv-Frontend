"use client";
import { useBreakingNews } from "@/hooks/useFeed";
import Link from "next/link";

export function BreakingTicker() {
  const { data: tickers, isLoading } = useBreakingNews();

  const items = tickers.length > 0
    ? tickers.map((t) => ({ text: t.tickerText || t.headline, slug: t.slug }))
    : [
        { text: "BREAKING: Federal Reserve holds benchmark rates steady at 5.25%-5.50%", slug: "fed-rates-decision-august-2026" },
        { text: "Zurich Quantum Center confirms 500-microsecond qubit coherence milestone", slug: "zurich-quantum-coherence-landmark-2026" },
        { text: "140 Nations Sign Historic Geneva Climate Accord targeting 45% methane cut", slug: "climate-accord-geneva-2026" },
      ];

  const doubled = [...items, ...items];

  return (
    <div className="breaking-ticker py-1.5 text-xs font-semibold tracking-wide bg-primary text-black max-w-full overflow-x-hidden">
      <div className="container mx-auto max-w-[1200px] px-4 md:px-6 flex items-center gap-3 overflow-hidden">
        <span className="flex-none flex items-center gap-1.5 pr-4 border-r border-black/30 uppercase tracking-widest text-[10px] font-mono font-extrabold">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-red-600 animate-ping" />
          Breaking
        </span>

        {isLoading ? (
          <div className="text-[11px] text-black/70 animate-pulse font-mono">
            Connecting to breaking news stream...
          </div>
        ) : (
          <div className="overflow-hidden flex-1 relative">
            <div className="ticker-track">
              {doubled.map((item, i) => (
                <span key={i} className="inline-flex items-center">
                  <span className="mx-6 text-black/40 select-none">◆</span>
                  <Link href={`/articles/${item.slug}`} className="text-black font-bold hover:underline">
                    {item.text}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
