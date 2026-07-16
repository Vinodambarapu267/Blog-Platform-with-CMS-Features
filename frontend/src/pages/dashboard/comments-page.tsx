import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Trash2, Eye } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, EmptyState, ErrorState, Skeleton, Avatar } from "@/components/ui/misc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/overlays";
import { Button } from "@/components/ui/button";
import { usePosts, useAllPosts } from "@/hooks/use-posts";
import { useComments, useAllComments, useDeleteComment, useMyComments } from "@/hooks/use-comments";
import { useAuth } from "@/contexts/auth-context";
import { COMMENT_STATUS_META, ROUTES } from "@/constants";
import { formatDateTime } from "@/lib/utils";

const COMMENT_ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];
// Same set as posts-page.tsx: only these roles have POST_CREATE on the backend,
// meaning only they can own posts to moderate comments on. READER/GUEST never
// own a post, so "select a post to moderate" is permanently empty for them —
// they get a "my comments" view instead (see canAuthor below).
const POST_AUTHOR_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"];
const ALL_POSTS_VALUE = "ALL";

export function CommentsPage() {
  const { user } = useAuth();
  const isAdmin = !!user && COMMENT_ADMIN_ROLES.includes(user.role);
  const canAuthor = !!user && POST_AUTHOR_ROLES.includes(user.role);

  const ownPosts = usePosts();
  const allPosts = useAllPosts();
  const { data: posts, isLoading: postsLoading } = isAdmin ? allPosts : ownPosts;

  const [selected, setSelected] = useState<string | null>(null);
  const activeSelection = selected ?? (isAdmin ? ALL_POSTS_VALUE : String(posts?.[0]?.postId ?? -1));
  const viewingAll = isAdmin && activeSelection === ALL_POSTS_VALUE;

  // Rules of Hooks: every hook has to run on every render, so all three queries
  // are always called — the inactive ones are just disabled via `enabled` and
  // never fetch. Which result feeds the UI is picked afterwards, not the hook
  // call itself.
  const postId = Number(activeSelection);
  const allCommentsQuery = useAllComments(viewingAll);
  const postCommentsQuery = useComments(postId, canAuthor && !viewingAll);
  const myCommentsQuery = useMyComments();
  const commentsQuery = !canAuthor ? myCommentsQuery : viewingAll ? allCommentsQuery : postCommentsQuery;

  const { data: comments, isLoading, isError, error, refetch } = commentsQuery;

  const postTitleById = useMemo(() => {
    if (!canAuthor) return myCommentsQuery.postTitleById;
    const map = new Map<number, string>();
    (posts ?? []).forEach((p) => map.set(p.postId, p.title));
    return map;
  }, [posts, canAuthor, myCommentsQuery.postTitleById]);

  // Always call the mutation hook — it's cheap (no request until .mutate() is
  // called) and calling it conditionally would itself violate Rules of Hooks.
  // The delete button below only renders/uses it for admins.
  const remove = useDeleteComment();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Comments</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {isAdmin
                ? "Every comment on the platform, from every post and author."
                : canAuthor
                  ? "Moderate discussion thread by thread."
                  : "Every comment you've posted, across every post — including pending and rejected ones only you can see."}
            </p>
          </div>

          {canAuthor && (
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
          )}
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
            title={!canAuthor ? "You haven't commented yet" : viewingAll ? "No comments yet" : "No comments on this post"}
            description={!canAuthor ? "Comments you post on any article will show up here, including ones still pending approval." : "Comments will show up here as readers add them."}
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
                        {(viewingAll || !canAuthor) && (
                          <span className="text-xs text-text-muted">
                            on “{postTitleById.get(comment.postId) ?? `Post #${comment.postId}`}”
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-text-secondary">{comment.content}</p>

                      <div className="mt-3 flex items-center gap-2">
                        <Button asChild size="sm" variant="ghost">
                          <Link to={ROUTES.postView(comment.postId)}>
                            <Eye className="h-3.5 w-3.5" /> View post
                          </Link>
                        </Button>
                        {/* ✅ Only show Delete button for admins - NO Approve/Reject buttons */}
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto text-danger hover:text-danger"
                            loading={remove.isPending}
                            onClick={() => remove.mutate(comment.commentId)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        )}
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