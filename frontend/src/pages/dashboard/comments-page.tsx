import { useState } from "react";
import { MessageSquare, Check, X, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, EmptyState, ErrorState, Skeleton, Avatar } from "@/components/ui/misc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/overlays";
import { Button } from "@/components/ui/button";
import { usePosts } from "@/hooks/use-posts";
import { useComments, useModerateComment, useDeleteComment } from "@/hooks/use-comments";
import { COMMENT_STATUS_META } from "@/constants";
import { formatDateTime } from "@/lib/utils";

export function CommentsPage() {
  const { data: posts, isLoading: postsLoading } = usePosts();
  const [postId, setPostId] = useState<number | null>(null);
  const activePostId = postId ?? posts?.[0]?.postId ?? -1;

  const { data: comments, isLoading, isError, error, refetch } = useComments(activePostId);
  const moderate = useModerateComment();
  const remove = useDeleteComment();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Comments</h1>
            <p className="mt-1 text-sm text-text-secondary">Moderate discussion thread by thread.</p>
          </div>

          <Select value={String(activePostId)} onValueChange={(v) => setPostId(Number(v))}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder={postsLoading ? "Loading posts…" : "Select a post"} />
            </SelectTrigger>
            <SelectContent>
              {(posts ?? []).map((p) => (
                <SelectItem key={p.postId} value={String(p.postId)}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <ErrorState message={error instanceof Error ? error.message : "Failed to load comments"} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : (comments ?? []).length === 0 ? (
          <EmptyState icon={<MessageSquare className="h-5 w-5" />} title="No comments on this post" description="Comments will show up here as readers add them." />
        ) : (
          <div className="space-y-3">
            {(comments ?? []).map((comment) => {
              const meta = COMMENT_STATUS_META[comment.status];
              return (
                <Card key={comment.commentId}>
                  <CardContent className="flex gap-3 p-5">
                    <Avatar name={comment.authorName ?? `User ${comment.authorId}`} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{comment.authorName ?? `User #${comment.authorId}`}</p>
                        <span className="text-xs text-text-muted">{formatDateTime(comment.createdAt)}</span>
                        <Badge className={meta?.className}>{meta?.label ?? comment.status}</Badge>
                        {comment.parentId && (
                          <span className="text-xs text-text-muted">↳ reply to #{comment.parentId}</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-text-secondary">{comment.content}</p>
                      <div className="mt-3 flex items-center gap-2">
                        {comment.status !== "APPROVED" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={moderate.isPending}
                            onClick={() => moderate.mutate({ id: comment.commentId, status: "APPROVED" })}
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                        )}
                        {comment.status !== "REJECTED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moderate.mutate({ id: comment.commentId, status: "REJECTED" })}
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        )}
                        {/* 
                          IMPORTANT: Do NOT call PATCH /status with "DELETED" —
                          CommentServiceImpl.updateCommentStatus switch only handles APPROVED, PENDING, REJECTED.
                          "DELETED" throws IllegalArgumentException("enter correct status").
                          Use DELETE /api/v1/comments/{id} instead (the remove button below).
                        */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto text-danger hover:text-danger"
                          loading={remove.isPending}
                          onClick={() => remove.mutate(comment.commentId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
