import { liveBlogRepository, LiveBlogEntryDto } from "@/repositories/liveBlogRepository";

export interface LiveBlogUpdate {
  id: string;
  timestamp: string;
  authorName: string;
  headline?: string;
  content: string;
  isKeyUpdate?: boolean;
  isPinned?: boolean;
}

export interface LiveBlogItem {
  id: string;
  title: string;
  summary?: string;
  status: string;
  updates: LiveBlogUpdate[];
}

function mapEntryToUpdate(entry: LiveBlogEntryDto): LiveBlogUpdate {
  return {
    id: entry.id,
    timestamp: new Date(entry.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    authorName: "Live Editorial Desk",
    headline: entry.headline || "Live Coverage Update",
    content: entry.contentBody,
    isKeyUpdate: entry.isKeyEvent,
    isPinned: entry.pinned,
  };
}

export const liveBlogService = {
  async getActiveLiveCoverage(): Promise<LiveBlogItem | null> {
    try {
      const activeBlogs = await liveBlogRepository.getActiveLiveBlogs();
      if (!activeBlogs || activeBlogs.length === 0) {
        return null;
      }
      const primaryBlog = activeBlogs[0];
      const entries = await liveBlogRepository.getEntries(primaryBlog.id);
      return {
        id: primaryBlog.id,
        title: primaryBlog.title,
        summary: "Real-time live news desk updates and market signals from correspondents worldwide.",
        status: primaryBlog.status,
        updates: (entries || []).map(mapEntryToUpdate),
      };
    } catch {
      return null;
    }
  },

  async getLiveBlogBySlug(slug: string): Promise<LiveBlogItem | null> {
    const [blog, entries] = await Promise.all([
      liveBlogRepository.getLiveBlog(slug),
      liveBlogRepository.getEntries(slug),
    ]);
    if (!blog) return null;
    return {
      id: blog.id,
      title: blog.title,
      summary:
        "Real-time live news desk updates and market signals from correspondents worldwide.",
      status: blog.status,
      updates: entries.map(mapEntryToUpdate),
    };
  },
};
