import { apiClient } from "@/lib/api-client";

/**
 * Social distribution, always through the Edition backend.
 *
 * The TSP social-media module is never called from the browser: it lives in its own namespace and
 * its management API key is held by the backend. Everything here talks to `/social/**`, which
 * records the share against the article on the way through.
 */

export type SocialShareStatus = "PENDING" | "SCHEDULED" | "PUBLISHED" | "FAILED";

export interface SocialAccount {
  id: string;
  username: string | null;
  /** False when the module holds no usable access token for the account. */
  ready: boolean;
}

export interface SocialMediaStatus {
  enabled: boolean;
  accounts: SocialAccount[];
  captionLimit: number;
  /** Why sharing is unavailable or degraded; null when all is well. */
  reason: string | null;
}

export interface SocialShare {
  id: string;
  articleId: string;
  platform: "INSTAGRAM";
  status: SocialShareStatus;
  caption: string;
  mediaUrl: string | null;
  permalink: string | null;
  errorMessage: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  requestedBy: string | null;
  createdAt: string;
}

export interface SocialShareDraft {
  articleId: string;
  headline: string;
  status: string;
  suggestedCaption: string;
  imageUrl: string | null;
  /** Why the image cannot be posted as it stands, or null when it is fine. */
  imageProblem: string | null;
  articleUrl: string;
  previousShares: SocialShare[];
}

export interface ShareToInstagramRequest {
  articleId: string;
  caption: string;
  imageUrl: string;
  link?: string;
  instagramAccountId?: string;
  idempotencyKey?: string;
  /** Post even though this article is already on Instagram. */
  force?: boolean;
}

export const socialService = {
  /** Whether this environment can share at all, and which accounts it can post as. */
  getStatus(): Promise<SocialMediaStatus> {
    return apiClient.get<SocialMediaStatus>("/social/status");
  },

  /** Caption, poster image and share history for one article, prepared by the backend. */
  getDraft(articleId: string): Promise<SocialShareDraft> {
    return apiClient.get<SocialShareDraft>(`/social/articles/${articleId}/draft`);
  },

  getShares(articleId: string): Promise<SocialShare[]> {
    return apiClient.get<SocialShare[]>(`/social/articles/${articleId}/shares`);
  },

  shareToInstagram(request: ShareToInstagramRequest): Promise<SocialShare> {
    return apiClient.post<SocialShare>("/social/shares/instagram", request);
  },
};
