"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { ArticleFeedItem } from "@/services/feedService";
import { SecondaryStoryCard } from "@/components/news/ArticleCards";
import { Search, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { searchRepository, SearchHitDto } from "@/repositories/searchRepository";

interface SearchClientProps {
  initialQuery: string;
  initialCategory: string;
  initialArticles: ArticleFeedItem[];
}

const CATEGORIES = ["All", "Business", "Technology", "World", "Science", "Politics"];

// Helper to debounce function calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function SearchClient({ initialQuery, initialCategory, initialArticles }: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);
  
  const [category, setCategory] = useState(initialCategory || "All");
  const [sortBy, setSortBy] = useState<"latest" | "relevant">("latest");
  
  const [searchResults, setSearchResults] = useState<ArticleFeedItem[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  const fetchSearchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults(initialArticles);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await searchRepository.search(searchQuery, 0, 50);
      
      // Map SearchHitDto back to ArticleFeedItem for UI components
      const mappedArticles: ArticleFeedItem[] = (res.items || []).map((hit: SearchHitDto) => ({
        id: hit.articleId,
        slug: hit.articleId, // fallback to articleId if slug is unavailable
        title: hit.highlightedTitle || hit.title,
        headline: hit.highlightedTitle || hit.title,
        subtitle: hit.summary,
        summary: hit.highlightedContent || hit.summary,
        bodyHtml: "",
        category: hit.category || "Uncategorized",
        topic: "",
        tags: [],
        authorId: "",
        authorName: hit.author || "Edition Staff",
        authorTitle: "Staff",
        publishedAt: new Date().toISOString(), // Fallback
        readingTime: "3 min read",
        readingTimeMinutes: 3,
        featuredImageUrl: "", // SafeImage fallback will handle this
        viewsCount: 0,
        commentsCount: 0,
        summaryPoints: []
      } as unknown as ArticleFeedItem));

      setSearchResults(mappedArticles);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [initialArticles]);

  // Trigger search when debounced query changes
  useEffect(() => {
    fetchSearchResults(debouncedQuery);
  }, [debouncedQuery, fetchSearchResults]);

  // Apply client-side filtering and sorting on the fetched results
  const displayedArticles = useMemo(() => {
    let filtered = searchResults;

    if (category !== "All") {
      filtered = filtered.filter((art) => art.category.toLowerCase() === category.toLowerCase());
    }

    // Basic sorting logic (mock implementation for demonstration)
    if (sortBy === "relevant" && hasSearched) {
      // If we had a score from backend, we could sort by it here
      // But assuming backend already returns sorted by relevance if it's a search
      return filtered; 
    }

    // Default to 'latest' (mocking by reversing just to show change if needed, but usually we just return as is)
    return filtered;
  }, [searchResults, category, sortBy, hasSearched]);

  return (
    <div className="space-y-8">
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
          {isLoading && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
          )}
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
          Found <strong>{displayedArticles.length}</strong> {displayedArticles.length === 1 ? "result" : "results"}
          {debouncedQuery && (
            <>
              {" "}
              for &ldquo;<strong>{debouncedQuery}</strong>&rdquo;
            </>
          )}
        </span>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="text-center py-16 border border-dashed border-border rounded-sm space-y-4">
          <Loader2 className="h-8 w-8 text-primary/60 animate-spin mx-auto" />
          <h3 className="font-bold text-base text-muted-foreground">Searching archives...</h3>
        </div>
      ) : displayedArticles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-sm space-y-2">
          <Search className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <h3 className="font-bold text-base">No articles found</h3>
          <p className="text-xs text-muted-foreground">Try adjusting your search terms or selecting a different category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedArticles.map((article) => (
            <SecondaryStoryCard key={article.id} article={article} showImage />
          ))}
        </div>
      )}
    </div>
  );
}

