import { Suspense } from "react";
import { feedService } from "@/services/feedService";
import { SearchClient } from "@/components/search/SearchClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "News Search | Edition TV",
  description: "Search news articles, topics, and correspondents across Edition TV.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", category = "" } = await searchParams;
  const initialFeed = await feedService.getPublicFeed(0, 50);

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8">
      <div className="border-b border-border pb-4 mb-8">
        <span className="section-label block mb-1">Archive Search</span>
        <h1 className="headline-xl text-3xl sm:text-4xl font-extrabold">Search Edition TV</h1>
      </div>

      <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-sm" />}>
        <SearchClient initialQuery={q} initialCategory={category} initialArticles={initialFeed.items} />
      </Suspense>
    </div>
  );
}

