"use client";
import React, { useState } from "react";
import { Newspaper } from "lucide-react";

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt: string;
  className?: string;
  category?: string;
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  politics: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop",
  politic: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop",
  gov: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop",
  business: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop",
  biz: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop",
  finance: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop",
  market: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
  ai: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  cyber: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
  world: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  global: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop",
  sport: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop",
  science: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop",
  entertainment: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
  culture: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?q=80&w=800&auto=format&fit=crop",
  opinion: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop",
  investigation: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
};

export function getCategoryFallbackImage(category?: string): string {
  if (!category) return CATEGORY_FALLBACK_IMAGES.default;
  const key = category.toLowerCase().trim();
  for (const [catKey, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (key.includes(catKey)) return url;
  }
  return CATEGORY_FALLBACK_IMAGES.default;
}

export function SafeImage({
  src,
  alt,
  className,
  category,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (src && src.trim().length > 0) return src;
    return getCategoryFallbackImage(category);
  });
  const [isFallback, setIsFallback] = useState<boolean>(!src || src.trim().length === 0);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleError = () => {
    if (!isFallback) {
      setImgSrc(getCategoryFallbackImage(category));
      setIsFallback(true);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div
        className={`w-full h-full min-h-[140px] bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 text-center select-none relative overflow-hidden border border-slate-800 group ${className || ""}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-9 w-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center mb-2 shadow-xs">
            <Newspaper className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-[11px] font-mono font-extrabold tracking-widest uppercase text-slate-200">
            EDITION TV
          </span>
          {category && (
            <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800/60">
              {category}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={imgSrc}
      alt={alt || "Edition TV News"}
      className={className}
      referrerPolicy="no-referrer"
      onError={handleError}
      {...props}
    />
  );
}
