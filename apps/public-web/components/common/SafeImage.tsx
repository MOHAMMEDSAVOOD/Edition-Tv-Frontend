"use client";
import React, { useState } from "react";
import { Newspaper } from "lucide-react";

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt: string;
  className?: string;
  category?: string;
}

export function SafeImage({
  src,
  alt,
  className,
  category,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState<boolean>(false);

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full min-h-[100px] bg-muted/50 dark:bg-muted/20 flex flex-col items-center justify-center p-3 text-center select-none border border-border/40 ${className || ""}`}
      >
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
          <Newspaper className="h-3.5 w-3.5 text-primary/70" />
        </div>
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted-foreground">
          EDITION TV
        </span>
        {category && (
          <span className="text-[9px] font-mono text-muted-foreground/60 uppercase mt-0.5">
            {category}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
