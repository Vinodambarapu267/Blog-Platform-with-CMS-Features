import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Heart, MessageSquare, Eye, Pencil, ArrowLeft, LogIn } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge, Avatar, Skeleton, EmptyState, ErrorState } from "@/components/ui/misc";
import { usePost, useToggleLike } from "@/hooks/use-posts";
import { useComments, useCreateComment } from "@/hooks/use-comments";
import { useCurrentUser } from "@/hooks/use-users";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES, POST_STATUS_META } from "@/constants";
import { formatDate, formatDateTime } from "@/lib/utils";

// This is the ONLY place a reader (logged in or not) can open a post: GET
// /api/v1/posts/{postId} and GET /api/v1/comments/posts/{postId}/comments are
// both public endpoints on the backend (see Api-Gateway RouteValidator +
// each service's own SecurityConfig permitAll rules) — they never required a
// login. Living behind /dashboard/posts/:id/edit inside <ProtectedRoute> meant
// every click on a post bounced straight to /login. This page lives outside
// the protected dashboard shell, so viewing a post never requires a session.
// Commenting (COMMENT_CREATE) and liking (POST_LIKE) still need to be signed
// in — that part actually is enforced by the backend — so those two actions
// are gated client-side with a "sign in" prompt instead of firing a request
// that's guaranteed to fail.
export function PostViewPage() {
  const params = useParams();
  const postId = Number(params.id);
  const { isAuthenticated } = useAuth();
  const { data: currentUser } = useCurrentUser();

  const { data: post, isLoading: postLoading, isError: postError, error: postErrorObj } = usePost(postId);
  const { data: comments, isLoading: commentsLoading } = useComments(postId);
  const toggleLike = useToggleLike();
  const createComment = useCreateComment(postId);

  const [commentText, setCommentText] = useState("");

  // New comments default to PENDING on the backend (Comment.status = PENDING) and
  // only become visible to the public once a moderator approves them. Filtering
  // to APPROVED-only meant a visitor's own just-posted comment vanished — it was
  // saved fine, the list did refetch, it was just invisible, which looked
  // identical to "comments aren't updating." Show it back to its own author
  // (with a pending note) while still hiding other people's un-approved ones.
 const visibleComments = (comments ?? []).filter(
  (c) => c.status === "APPROVED" || (currentUser && c.authorId === currentUser.userId)
);
  const approvedComments = (comments ?? []).filter((c) => c.status === "APPROVED");
  const isOwner = Boolean(currentUser && post && currentUser.userId === post.authorId);
  const statusMeta = post ? POST_STATUS_META[post.status] : null;

  const handleLike = () => {
    if (!isAuthenticated||toggleLike.isPending) {
      return;
    }
    toggleLike.mutate(postId);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createComment.mutate(
      { content: commentText.trim() },
      { onSuccess: () => setCommentText("") }
    );
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to={ROUTES.home} className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>

        {postLoading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : postError || !post ? (
          <div className="mt-6">
            <ErrorState message={postErrorObj instanceof Error ? postErrorObj.message : "This post couldn't be found."} />
          </div>
        ) : (
          <>
            <article className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                {statusMeta && <Badge className={statusMeta.className}>{statusMeta.label}</Badge>}
                {post.categoryName && <Badge className="border-white/10 text-text-secondary">{post.categoryName}</Badge>}
              </div>

              <h1 className="font-display mt-3 text-3xl font-semibold text-text-primary sm:text-4xl">{post.title}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <Avatar name={post.authorName ?? `Author #${post.authorId}`} size={36} />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{post.authorName ?? `Author #${post.authorId}`}</p>
                    <p className="text-xs text-text-muted">{formatDate(post.publishedAt ?? post.createdAt)}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Eye className="h-3.5 w-3.5" /> {post.viewCount ?? 0} views
                </span>
                {isOwner && (
                  <Button asChild variant="secondary" size="sm" className="ml-auto">
                    <Link to={ROUTES.postEdit(post.postId)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit post
                    </Link>
                  </Button>
                )}
              </div>

              {post.excerpt && (
                <p className="mt-5 border-l-2 border-primary/40 pl-4 text-text-secondary">{post.excerpt}</p>
              )}

              <div className="prose prose-invert mt-6 max-w-none prose-headings:font-display prose-a:text-primary-light">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
                <Button
                  variant={isAuthenticated ? "secondary" : "outline"}
                  loading={toggleLike.isPending}
                  onClick={handleLike}
                  title={isAuthenticated ? "Like this post" : "Sign in to like this post"}
                >
                  <Heart className={`h-4 w-4 ${toggleLike.isSuccess ? "fill-danger text-danger" : ""}`} />
                  {post.likeCount ?? 0}
                </Button>
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <MessageSquare className="h-4 w-4" /> {approvedComments.length} comments
                </span>
                {!isAuthenticated && (
                  <Link
                    to={ROUTES.login}
                    className="ml-auto flex items-center gap-1.5 text-sm text-primary-light hover:underline"
                  >
                    <LogIn className="h-3.5 w-3.5" /> Sign in to like or comment
                  </Link>
                )}
              </div>
            </article>

            {/* Comments */}
            <section className="mt-10">
              <h2 className="font-display text-xl font-semibold text-text-primary">Comments</h2>

              {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className="mt-4 flex flex-col gap-2.5">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts…"
                    rows={3}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-text-muted">New comments are held for moderation before other readers can see them.</p>
                    <Button type="submit" size="sm" loading={createComment.isPending} disabled={!commentText.trim()}>
                      Post comment
                    </Button>
                  </div>
                </form>
              ) : (
                <Card className="mt-4">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <p className="text-sm text-text-secondary">Sign in to join the discussion.</p>
                    <Button asChild size="sm" variant="secondary">
                      <Link to={ROUTES.login}>Sign in</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="mt-6 space-y-3">
                {commentsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
                ) : visibleComments.length === 0 ? (
                  <EmptyState
                    icon={<MessageSquare className="h-5 w-5" />}
                    title="No comments yet"
                    description="Be the first to share what you think."
                  />
                ) : (
                  visibleComments.map((comment) => (
                    <Card key={comment.commentId}>
                      <CardContent className="flex gap-3 p-4">
                        <Avatar name={comment.authorName ?? `User ${comment.authorId}`} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-text-primary">
                              {comment.authorName ?? `User #${comment.authorId}`}
                            </p>
                            <span className="text-xs text-text-muted">{formatDateTime(comment.createdAt)}</span>
                            {comment.status !== "APPROVED" && (
                              <Badge className="border-warning/30 bg-warning/15 text-warning">
                                {comment.status === "PENDING" ? "Pending approval — only visible to you" : "Rejected"}
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1.5 text-sm text-text-secondary">{comment.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </PublicLayout>
  );
}