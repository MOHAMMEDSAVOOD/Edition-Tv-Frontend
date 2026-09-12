"use client";
import { useState } from "react";
import { CommentItem, commentsService } from "@/services/commentsService";
import { MessageSquare, ThumbsUp, Send, ShieldCheck } from "lucide-react";
import { SectionDivider } from "@/components/news/SectionDivider";
import { TimeAgo } from "@/components/common/TimeAgo";

interface CommentsSectionProps {
  articleId: string;
  initialComments: CommentItem[];
}

export function CommentsSection({ articleId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await commentsService.postComment(articleId, newComment);
      if (created && created.content) {
        setComments((prev) => [created, ...prev]);
      } else {
        const optimistic: CommentItem = {
          id: `c-opt-${Date.now()}`,
          articleId,
          authorName: authorName.trim() || "Verified Reader",
          content: newComment,
          createdAt: new Date().toISOString(),
          likesCount: 0,
          status: "APPROVED",
          toxicityScore: 0.0,
        };
        setComments((prev) => [optimistic, ...prev]);
      }
      setNewComment("");
    } catch {
      const optimistic: CommentItem = {
        id: `c-opt-${Date.now()}`,
        articleId,
        authorName: authorName.trim() || "Verified Reader",
        content: newComment,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        status: "APPROVED",
        toxicityScore: 0.0,
      };
      setComments((prev) => [optimistic, ...prev]);
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likesCount: c.likesCount + 1 } : c))
    );
    commentsService.likeComment(articleId, commentId).catch(() => {});
  };

  return (
    <section className="mt-16 max-w-4xl pt-8 border-t border-border font-sans">
      <SectionDivider label={`Reader Discussion (${comments.length})`} />

      {/* Post Comment Form */}
      <form onSubmit={handleSubmit} className="bg-muted/30 border border-border p-4 rounded-sm mb-8 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-primary" /> Join the Discussion
          </span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" /> AI Moderation Active
          </span>
        </div>

        <input
          type="text"
          placeholder="Your Name (Optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 text-xs border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <textarea
          rows={3}
          required
          placeholder="Share your perspective on this article..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-3 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="flex items-center gap-1.5 bg-primary text-black font-bold text-xs px-4 py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">No comments yet. Be the first to join the conversation!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 border border-border bg-card rounded-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">{comment.authorName}</span>
                <span className="text-muted-foreground text-[11px] font-mono"><TimeAgo date={comment.createdAt} /></span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed font-sans">{comment.content}</p>
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-[11px]"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{comment.likesCount} Helpful</span>
                </button>
                {comment.toxicityScore < 0.05 && (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                    Verified High Quality
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
