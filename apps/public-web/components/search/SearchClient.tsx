"use client";
import { useState, useMemo } from "react";
import { ArticleFeedItem } from "@/services/feedService";
import { SecondaryStoryCard } from "@/components/news/ArticleCards";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

interface SearchClientProps {
  initialQuery: string;
  initialCategory: string;
  initialArticles: ArticleFeedItem[];
}

const CATEGORIES = ["All", "Business", "Technology", "World", "Science", "Politics"];

export function SearchClient({ initialQuery, initialCategory, initialArticles }: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory || "All");
  const [sortBy, setSortBy] = useState<"latest" | "relevant">("latest");

  const filteredArticles = useMemo(() => {
    return initialArticles.filter((art) => {
      const matchesQuery =
        !query.trim() ||
        art.headline.toLowerCase().includes(query.toLowerCase()) ||
        art.summary.toLowerCase().includes(query.toLowerCase()) ||
        art.authorName.toLowerCase().includes(query.toLowerCase());

      const matchesCat = category === "All" || art.category.toLowerCase() === category.toLowerCase();

      return matchesQuery && matchesCat;
    });
  }, [initialArticles, query, category]);

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Search Input & Controls */}
      <div className="bg-muted/30 border border-border p-4 rounded-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, headlines, authors..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Category Pill Filters & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1 mr-2">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 text-xs rounded-sm font-semibold transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "latest" | "relevant")}
              className="bg-background border border-border text-xs rounded-sm px-2 py-1 focus:outline-none"
            >
              <option value="latest">Most Recent</option>
              <option value="relevant">Relevance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
        <span>
          Found <strong>{filteredArticles.length}</strong> {filteredArticles.length === 1 ? "result" : "results"}
          {query && (
            <>
              {" "}
              for &ldquo;<strong>{query}</strong>&rdquo;
            </>
          )}
        </span>
      </div>

      {/* Results List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-sm space-y-2">
          <Search className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <h3 className="font-bold text-base">No articles found</h3>
          <p className="text-xs text-muted-foreground">Try adjusting your search terms or selecting a different category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <SecondaryStoryCard key={article.id} article={article} showImage />
          ))}
        </div>
      )}
    </div>
  );
}
