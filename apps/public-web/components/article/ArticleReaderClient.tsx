"use client";
import { useState, useEffect } from "react";
import { ArticleDetail } from "@/services/articleService";
import { Bookmark, Heart, Share2, Volume2, Eye } from "lucide-react";
import { savedArticlesService } from "@/services/savedArticlesService";
import { cn } from "@/lib/utils";
import { AudioPlayerBar } from "./AudioPlayerBar";

import { StorySharePosterModal } from "./StorySharePosterModal";

interface ArticleReaderClientProps {
  article: ArticleDetail;
  children?: React.ReactNode;
}

export function ArticleReaderClient({ article, children }: ArticleReaderClientProps) {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    savedArticlesService.checkIsSaved(article.id).then(setIsBookmarked);

    try {
      localStorage.setItem(
        "edition_last_read_article",
        JSON.stringify({
          id: article.id,
          title: article.title,
          slug: article.slug,
          subtitle: article.subtitle,
          category: article.category,
        })
      );

      const existingRaw = localStorage.getItem("edition_recently_viewed");
      const existing: Array<{ id: string; title: string; slug: string; subtitle: string; category: string }> = existingRaw ? JSON.parse(existingRaw) : [];
      const filtered = existing.filter((item) => item.id !== article.id);
      const updated = [
        {
          id: article.id,
          title: article.title,
          slug: article.slug,
          subtitle: article.subtitle,
          category: article.category,
        },
        ...filtered,
      ].slice(0, 10);
      localStorage.setItem("edition_recently_viewed", JSON.stringify(updated));
    } catch {
      // Ignored
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article]);

  const toggleBookmark = async () => {
    if (isBookmarked) {
      setIsBookmarked(false);
      try {
        await savedArticlesService.unsaveArticle(article.id);
      } catch {
        // Fallback
      }
    } else {
      setIsBookmarked(true);
      try {
        await savedArticlesService.saveArticle(article.id);
      } catch {
        // Fallback
      }
    }
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const fontSizeClasses = {
    normal: "text-base leading-relaxed",
    large: "text-lg leading-loose",
    xlarge: "text-xl leading-loose",
  };

  return (
    <>
      {/* Scroll Progress Bar at top of screen */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className={cn("transition-all duration-300", isReadingMode && "max-w-2xl mx-auto py-4")}>
        {/* Floating / Sticky Action Bar for Article Reader */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border border-border rounded-sm py-2 px-4 mb-8 flex items-center justify-between shadow-xs">
          {/* Left: Audio & Text Controls */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-colors font-medium",
                isPlayingAudio ? "bg-primary text-black font-bold border-primary" : "border-border hover:bg-muted"
              )}
            >
              <Volume2 className="h-3.5 w-3.5" />
              {isPlayingAudio ? "Pause Audio" : "Listen (5 min)"}
            </button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Font size toggle */}
            <div className="flex items-center gap-1 border border-border rounded-sm p-0.5">
              <button
                onClick={() => setFontSize("normal")}
                className={cn("px-2 py-0.5 text-xs font-bold rounded-xs", fontSize === "normal" && "bg-muted text-foreground")}
                title="Normal Font Size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={cn("px-2 py-0.5 text-sm font-bold rounded-xs", fontSize === "large" && "bg-muted text-foreground")}
                title="Large Font Size"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize("xlarge")}
                className={cn("px-2 py-0.5 text-base font-bold rounded-xs", fontSize === "xlarge" && "bg-muted text-foreground")}
                title="Extra Large Font Size"
              >
                A++
              </button>
            </div>

            <button
              onClick={() => setIsReadingMode(!isReadingMode)}
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border hover:bg-muted transition-colors font-medium",
                isReadingMode && "bg-primary/10 text-primary border-primary/30"
              )}
              title="Focus Reading Mode"
            >
              <Eye className="h-3.5 w-3.5" />
              {isReadingMode ? "Exit Focus" : "Focus Mode"}
            </button>
          </div>

          {/* Right: Like, Save, Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm border transition-colors",
                hasLiked ? "bg-red-500/10 text-red-500 border-red-500/30" : "border-border hover:bg-muted"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", hasLiked && "fill-current")} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={toggleBookmark}
              className={cn(
                "p-1.5 rounded-sm border transition-colors",
                isBookmarked ? "bg-primary text-black border-primary" : "border-border hover:bg-muted"
              )}
              title={isBookmarked ? "Remove Bookmark" : "Save for Later"}
            >
              <Bookmark className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-sm border border-red-500/30 bg-red-500/5 text-red-600 hover:bg-red-500/10 transition-colors"
              title="Share Story & Generate Poster"
            >
              <Share2 className="h-3.5 w-3.5 text-red-600" />
              <span>Share Poster</span>
            </button>
          </div>
        </div>

        {/* Article Body Content */}
        <div
          className={cn("article-body font-sans text-foreground/90 max-w-4xl", fontSizeClasses[fontSize])}
          dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
        />

        {children}
      </div>

      {/* Floating Audio Player when active */}
      {isPlayingAudio && (
        <AudioPlayerBar
          title={article.title}
          authorName={article.authorName}
          audioUrl={article.audioUrl}
          onClose={() => setIsPlayingAudio(false)}
        />
      )}

      {/* Story Share & Poster Generator Modal */}
      <StorySharePosterModal
        article={article}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </>
  );
}
