"use client";

import { useState, useEffect } from "react";

interface TimeAgoProps {
  date: string;
  className?: string;
}

function calculateTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (isNaN(diff) || diff < 0) return dateStr;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatStaticDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <time dateTime={date} className={className} suppressHydrationWarning>
      {mounted ? calculateTimeAgo(date) : formatStaticDate(date)}
    </time>
  );
}
