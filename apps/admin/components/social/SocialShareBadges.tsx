"use client";

import { Instagram, Facebook, Youtube } from "lucide-react";
import type {
  ArticleShareSummary,
  PlatformShareStatus,
} from "@/services/socialService";

/**
 * Where a story stands on social, at a glance in a list row.
 *
 * <p>Only networks the story has actually been sent to get a glyph — a row for a story that has
 * never been shared stays quiet rather than showing three greyed-out icons, so the eye picks out
 * what is out there and what failed.
 */

const PLATFORM_ICONS = {
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  YOUTUBE: Youtube,
} as const;

const PLATFORM_LABELS = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
} as const;

/** Published reads as settled, failed as needing attention, the in-between states as in flight. */
const STATUS_STYLES: Record<PlatformShareStatus["status"], string> = {
  PUBLISHED: "text-emerald-600 border-emerald-200 bg-emerald-50",
  FAILED: "text-red-600 border-red-200 bg-red-50",
  SCHEDULED: "text-amber-600 border-amber-200 bg-amber-50",
  PENDING: "text-slate-500 border-slate-200 bg-slate-50",
};

const STATUS_WORDS: Record<PlatformShareStatus["status"], string> = {
  PUBLISHED: "posted to",
  FAILED: "failed on",
  SCHEDULED: "scheduled for",
  PENDING: "pending on",
};

function describe(entry: PlatformShareStatus): string {
  const when = entry.publishedAt
    ? ` on ${new Date(entry.publishedAt).toLocaleString()}`
    : "";
  return `${STATUS_WORDS[entry.status]} ${PLATFORM_LABELS[entry.platform]}${when}`;
}

export function SocialShareBadges({
  summary,
  className = "",
}: {
  /** Undefined while the page is still loading; absent entirely when never shared. */
  summary?: ArticleShareSummary;
  className?: string;
}) {
  const platforms = summary?.platforms ?? [];

  if (platforms.length === 0) {
    return (
      <span className={`text-slate-300 text-[11px] font-mono ${className}`}>
        —
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {platforms.map((entry) => {
        const Icon = PLATFORM_ICONS[entry.platform];
        const label = describe(entry);
        // A permalink only exists once the network accepted the post, so the badge is a link
        // exactly when there is somewhere to go.
        const badge = (
          <span
            className={`inline-flex items-center justify-center h-5 w-5 rounded-md border ${STATUS_STYLES[entry.status]}`}
            title={label}
            aria-label={label}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
          </span>
        );

        return entry.permalink ? (
          <a
            key={entry.platform}
            href={entry.permalink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:opacity-80 transition"
          >
            {badge}
          </a>
        ) : (
          <span key={entry.platform}>{badge}</span>
        );
      })}
    </div>
  );
}
