import { useMemo, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, EmptyState, ErrorState, Skeleton, Avatar } from "@/components/ui/misc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/overlays";
import { Button } from "@/components/ui/button";
import { usePosts, useAllPosts } from "@/hooks/use-posts";
import { useComments, useAllComments, useDeleteComment } from "@/hooks/use-comments";
import { useAuth } from "@/contexts/auth-context";
import { COMMENT_STATUS_META } from "@/constants";
import { formatDateTime } from "@/lib/utils";

const COMMENT_ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];
const ALL_POSTS_VALUE = "ALL";

export function CommentsPage() {
  const { user } = useAuth();
  const isAdmin = !!user && COMMENT_ADMIN_ROLES.includes(user.role);

  const ownPosts = usePosts();
  const allPosts = useAllPosts();
  const { data: posts, isLoading: postsLoading } = isAdmin ? allPosts : ownPosts;

  const [selected, setSelected] = useState<string | null>(null);
  const activeSelection = selected ?? (isAdmin ? ALL_POSTS_VALUE : String(posts?.[0]?.postId ?? -1));
  const viewingAll = isAdmin && activeSelection === ALL_POSTS_VALUE;

  // ✅ Conditionally call the appropriate hook based on user role and viewing mode
  let commentsQuery;
  if (viewingAll) {
    // Only admins can view all comments - this will only be called when viewingAll is true
    commentsQuery = useAllComments();
  } else {
    // For non-admins or when viewing a specific post
    const postId = Number(activeSelection);
    commentsQuery = useComments(postId);
  }

  const { data: comments, isLoading, isError, error, refetch } = commentsQuery;

  const postTitleById = useMemo(() => {
    const map = new Map<number, string>();
    (posts ?? []).forEach((p) => map.set(p.postId, p.title));
    return map;
  }, [posts]);

  // ✅ Only initialize delete hook for admins (remove moderate hook entirely)
  const remove = isAdmin ? useDeleteComment() : null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Comments</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {isAdmin ? "Every comment on the platform, from every post and author." : "Moderate discussion thread by thread."}
            </p>
          </div>

          <Select value={activeSelection} onValueChange={setSelected}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder={postsLoading ? "Loading posts…" : "Select a post"} />
            </SelectTrigger>
            <SelectContent>
              {isAdmin && (
                <SelectItem value={ALL_POSTS_VALUE}>All posts</SelectItem>
              )}
              {(posts ?? []).map((p) => (
                <SelectItem key={p.postId} value={String(p.postId)}>
                  {p.title}
                  {isAdmin && ` — ${p.authorName ?? `User #${p.authorId}`}`}
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
          <EmptyState
            icon={<MessageSquare className="h-5 w-5" />}
            title={viewingAll ? "No comments yet" : "No comments on this post"}
            description="Comments will show up here as readers add them."
          />
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
                        {viewingAll && (
                          <span className="text-xs text-text-muted">
                            on “{postTitleById.get(comment.postId) ?? `Post #${comment.postId}`}”
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-text-secondary">{comment.content}</p>
                      
                      {/* ✅ Only show Delete button for admins - NO Approve/Reject buttons */}
                      {isAdmin && (
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto text-danger hover:text-danger"
                            loading={remove?.isPending}
                            onClick={() => remove?.mutate(comment.commentId)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      )}
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