"use client";
import { useState } from "react";
import Link from "next/link";
import { BookmarkX, Trash2, ArrowRight } from "lucide-react";
import { Article } from "@/types/models";
import { SecondaryStoryCard } from "@/components/news/ArticleCards";
import { savedArticlesService } from "@/services/savedArticlesService";

interface SavedArticlesClientProps {
  initialSaved: Article[];
}

export function SavedArticlesClient({ initialSaved }: SavedArticlesClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialSaved);

  const handleRemove = async (id: string) => {
    const updated = articles.filter((a) => a.id !== id && a.slug !== id);
    setArticles(updated);
    try {
      await savedArticlesService.unsaveArticle(id);
    } catch {
      // Ignore network errors
    }
  };

  const handleClearAll = async () => {
    const current = [...articles];
    setArticles([]);
    for (const item of current) {
      try {
        await savedArticlesService.unsaveArticle(item.id);
      } catch {
        // Ignore
      }
    }
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-sm space-y-4">
        <BookmarkX className="h-12 w-12 text-muted-foreground/40 mx-auto" />
        <h3 className="font-bold text-xl">Your Reading List is Empty</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Click the bookmark icon on any article to save stories to read later across all your devices.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-primary text-black font-bold text-xs px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity uppercase tracking-wider"
          >
            Explore Top Stories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border font-mono">
        <span>{articles.length} bookmarked {articles.length === 1 ? "story" : "stories"} saved in cloud account</span>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1 text-red-500 hover:underline font-semibold"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear Entire List
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="relative group">
            <SecondaryStoryCard article={{ ...article, headline: article.title }} showImage />
            <button
              onClick={() => handleRemove(article.id)}
              className="absolute top-2 right-2 p-1 bg-background/90 hover:bg-red-500 hover:text-white border border-border rounded-xs transition-colors opacity-0 group-hover:opacity-100 text-xs font-bold shadow-xs"
              title="Remove from saved"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
