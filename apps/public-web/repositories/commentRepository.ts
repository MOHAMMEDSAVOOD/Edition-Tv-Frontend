import { apiClient } from "@/lib/api-client";

export interface CommentResponseDto {
  id: string;
  articleId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  content: string;
  depth: number;
  status: string;
  likeCount: number;
  replyCount: number;
  toxicityScore?: number;
  createdAt: string;
  replies?: CommentResponseDto[];
}

export const commentRepository = {
  async getCommentsByArticle(articleId: string): Promise<CommentResponseDto[]> {
    return apiClient.get<CommentResponseDto[]>(`/articles/${articleId}/comments`);
  },

  async postComment(articleId: string, content: string, parentId?: string): Promise<CommentResponseDto> {
    if (parentId) {
      return apiClient.post<CommentResponseDto>(`/comments/${parentId}/reply`, { content });
    }
    return apiClient.post<CommentResponseDto>(`/articles/${articleId}/comments`, { content });
  },

  async likeComment(commentId: string): Promise<void> {
    return apiClient.post<void>(`/comments/${commentId}/like`);
  },
};
