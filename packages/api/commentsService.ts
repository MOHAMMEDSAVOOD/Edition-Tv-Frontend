import { apiClient } from "./api-client";

export interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
  likesCount: number;
  status: "APPROVED" | "PENDING_MODERATION" | "REJECTED";
  toxicityScore: number;
  replies?: CommentItem[];
}

export const commentsService = {
  async getCommentsByArticle(articleId: string): Promise<CommentItem[]> {
    try {
      return await apiClient.get<CommentItem[]>(`/articles/${articleId}/comments`);
    } catch {
      return [
        {
          id: "c-1",
          articleId,
          authorName: "Marcus Vance",
          content: "The integration of real-time AI toxicity scoring directly into the comment stream is impressive. Zero moderation queue lag!",
          createdAt: "12 mins ago",
          likesCount: 5,
          status: "APPROVED",
          toxicityScore: 0.01,
        },
      ];
    }
  },

  async postComment(articleId: string, content: string): Promise<CommentItem> {
    return apiClient.post<CommentItem>(`/articles/${articleId}/comments`, { content });
  },

  async likeComment(commentId: string): Promise<void> {
    return apiClient.post<void>(`/comments/${commentId}/like`);
  },
};
