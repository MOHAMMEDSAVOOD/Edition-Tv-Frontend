import { commentRepository, CommentResponseDto } from "@/repositories/commentRepository";
import { Comment } from "@/types/models";

export interface CommentItem extends Comment {}

function mapCommentDtoToItem(dto: CommentResponseDto): CommentItem {
  return {
    id: dto.id,
    articleId: dto.articleId,
    authorName: dto.authorName || "Verified Reader",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    content: dto.content,
    createdAt: new Date(dto.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    likesCount: dto.likeCount || 0,
    status: (dto.status as "APPROVED" | "PENDING_MODERATION" | "REJECTED") || "APPROVED",
    toxicityScore: dto.toxicityScore || 0.01,
    parentId: dto.parentId || null,
    replies: (dto.replies || []).map(mapCommentDtoToItem),
  };
}

export const commentsService = {
  async getCommentsByArticle(articleId: string): Promise<CommentItem[]> {
    const dtos = await commentRepository.getCommentsByArticle(articleId);
    return (dtos || []).map(mapCommentDtoToItem);
  },

  async postComment(articleId: string, content: string, parentId?: string): Promise<CommentItem> {
    const dto = await commentRepository.postComment(articleId, content, parentId);
    return mapCommentDtoToItem(dto);
  },

  async likeComment(articleId: string, commentId: string): Promise<void> {
    await commentRepository.likeComment(commentId);
  },
};
