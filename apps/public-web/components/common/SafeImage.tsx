"use client";
import React, { useState } from "react";

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
  void category;
  const [hasError, setHasError] = useState<boolean>(false);

  if (!src || src.trim().length === 0 || hasError) {
    return null;
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt || ""}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
