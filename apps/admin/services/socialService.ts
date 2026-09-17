import { apiClient } from "@/lib/api-client";

/**
 * Social distribution, always through the Edition backend.
 *
 * The TSP social-media module is never called from the browser: it lives in its own namespace and
 * its management API key is held by the backend. Everything here talks to `/social/**`, which
 * records the share against the article on the way through.
 */

export type SocialShareStatus =
  "PENDING" | "SCHEDULED" | "PUBLISHED" | "FAILED";

/** The networks the newsroom can publish to, as the API spells them. */
export type SocialPlatform = "instagram" | "facebook" | "youtube";

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "instagram",
  "facebook",
  "youtube",
];

export interface SocialAccount {
  /** The network's own id: an Instagram user id, a Page id, a channel id. */
  id: string;
  username: string | null;
  platform: SocialPlatform;
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
  platform: "INSTAGRAM" | "FACEBOOK" | "YOUTUBE";
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
  /** Standfirst, drawn under the headline on the branded poster. */
  summary: string | null;
  /** Banner text on the branded poster. */
  category: string | null;
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

export interface ShareArticleRequest {
  articleId: string;
  /** Networks to post to; each one comes back as its own share. */
  platforms: SocialPlatform[];
  caption: string;
  /** The poster. Also YouTube's thumbnail. */
  imageUrl: string;
  /**
   * The file YouTube uploads. Required when youtube is among the platforms: an article carries no
   * video of its own, so the editor names one.
   */
  videoUrl?: string;
  youtubeTitle?: string;
  link?: string;
  instagramAccountId?: string;
  facebookPageId?: string;
  youtubeChannelId?: string;
  idempotencyKey?: string;
  /** Post even though this article is already out on that network. */
  force?: boolean;
}

export const socialService = {
  /** Whether this environment can share at all, and which accounts it can post as. */
  getStatus(): Promise<SocialMediaStatus> {
    return apiClient.get<SocialMediaStatus>("/social/status");
  },

  /** Caption, poster image and share history for one article, prepared by the backend. */
  getDraft(articleId: string): Promise<SocialShareDraft> {
    return apiClient.get<SocialShareDraft>(
      `/social/articles/${articleId}/draft`,
    );
  },

  getShares(articleId: string): Promise<SocialShare[]> {
    return apiClient.get<SocialShare[]>(`/social/articles/${articleId}/shares`);
  },

  shareToInstagram(request: ShareToInstagramRequest): Promise<SocialShare> {
    return apiClient.post<SocialShare>("/social/shares/instagram", request);
  },

  /** Publishes to every named network; one share comes back per network, in the order asked. */
  share(request: ShareArticleRequest): Promise<SocialShare[]> {
    return apiClient.post<SocialShare[]>("/social/shares", request);
  },
};

/** A remote image fetched by the backend as a data URI, so a canvas drawing it stays exportable. */
export interface RemoteImage {
  dataUri: string;
  mimeType: string;
  bytes: number;
}

export interface StoredPoster {
  /** Absolute, publicly fetchable — this is the URL handed to Instagram. */
  url: string;
  key: string;
  bytes: number;
}

export const posterService = {
  /**
   * Fetches an image through the backend rather than the browser.
   *
   * Wire agencies serve images without CORS headers, which taints the poster canvas and makes the
   * PNG export fail. A data URI has no origin, so it taints nothing.
   */
  fetchRemoteImage(url: string): Promise<RemoteImage> {
    return apiClient.get<RemoteImage>(
      `/media/remote-image?url=${encodeURIComponent(url)}`,
    );
  },

  /** Stores the rendered poster and returns the public URL Instagram will fetch. */
  storePoster(contentBase64: string): Promise<StoredPoster> {
    return apiClient.post<StoredPoster>("/media/posters", { contentBase64 });
  },
};
