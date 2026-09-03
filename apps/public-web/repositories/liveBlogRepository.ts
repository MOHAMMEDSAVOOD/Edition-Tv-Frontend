/**
 * Live Blog Repository — Server Component safe
 *
 * Live blog data is public — called from Server Components.
 * Uses serverFetch; returns empty arrays / null on failure.
 */
import { serverFetch } from "@/lib/api-client";

export interface LiveBlogDto {
  id: string;
  articleId?: string;
  title: string;
  status: string;
  createdAuthorId: string;
  createdAt: string;
}

export interface LiveBlogEntryDto {
  id: string;
  liveBlogId: string;
  authorId: string;
  headline?: string;
  contentBody: string;
  isKeyEvent: boolean;
  pinned: boolean;
  createdAt: string;
}

export const liveBlogRepository = {
  async getActiveLiveBlogs(): Promise<LiveBlogDto[]> {
    return (
      (await serverFetch<LiveBlogDto[]>("/live-blogs/active", {
        revalidate: 30,
        tags: ["live-blogs"],
      })) ?? []
    );
  },

  async getLiveBlog(id: string): Promise<LiveBlogDto | null> {
    return serverFetch<LiveBlogDto>(`/live-blogs/${id}`, {
      revalidate: 30,
      tags: ["live-blogs", `live-blog-${id}`],
    });
  },

  async getEntries(id: string): Promise<LiveBlogEntryDto[]> {
    return (
      (await serverFetch<LiveBlogEntryDto[]>(`/live-blogs/${id}/entries`, {
        revalidate: 15,
        tags: ["live-blogs", `live-blog-${id}`],
      })) ?? []
    );
  },

  async getKeyEvents(id: string): Promise<LiveBlogEntryDto[]> {
    return (
      (await serverFetch<LiveBlogEntryDto[]>(
        `/live-blogs/${id}/key-events`,
        {
          revalidate: 15,
          tags: ["live-blogs", `live-blog-${id}`],
        }
      )) ?? []
    );
  },
};
