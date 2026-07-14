import { useState } from "react";
import { ShieldCheck, FileText, MessageSquare, FolderTree, Tags as TagsIcon, Check, X, Trash2, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, EmptyState, ErrorState, Skeleton, Avatar } from "@/components/ui/misc";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/overlays";
import { useAllPosts, useUpdatePostStatus } from "@/hooks/use-posts";
import { useComments, useModerateComment, useDeleteComment } from "@/hooks/use-comments";
import { useCreateCategory } from "@/hooks/use-taxonomy";
import { useAutoCreateTags } from "@/hooks/use-taxonomy";
import { POST_STATUS_META, COMMENT_STATUS_META } from "@/constants";
import { formatDate, formatDateTime, slugify } from "@/lib/utils";
import type { PostStatus } from "@/types";

const POST_STATUS_OPTIONS: PostStatus[] = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED", "DELETED"];

export function AdminPanelPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <ShieldCheck className="h-5 w-5 text-white" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Admin Panel</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Post &amp; comment moderation, plus category and tag creation. Visible to Super Admin and Admin only.
            </p>
          </div>
        </div>

        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts">
              <FileText className="mr-1.5 inline h-3.5 w-3.5" /> Posts
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="mr-1.5 inline h-3.5 w-3.5" /> Comments
            </TabsTrigger>
            <TabsTrigger value="categories">
              <FolderTree className="mr-1.5 inline h-3.5 w-3.5" /> Categories
            </TabsTrigger>
            <TabsTrigger value="tags">
              <TagsIcon className="mr-1.5 inline h-3.5 w-3.5" /> Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            <PostStatusPanel />
          </TabsContent>
          <TabsContent value="comments" className="mt-4">
            <CommentModerationPanel />
          </TabsContent>
          <TabsContent value="categories" className="mt-4">
            <CategoryCreatePanel />
          </TabsContent>
          <TabsContent value="tags" className="mt-4">
            <TagCreatePanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// ── Posts: change status of any post on the platform ────────────────────────
function PostStatusPanel() {
  const { data: posts, isLoading, isError, error, refetch } = useAllPosts();
  const updateStatus = useUpdatePostStatus();

  if (isError) {
    return <ErrorState message={error instanceof Error ? error.message : "Failed to load posts"} onRetry={() => refetch()} />;
  }
  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>;
  }
  if (!posts?.length) {
    return <EmptyState icon={<FileText className="h-5 w-5" />} title="No posts yet" description="Posts will show up here once authors publish." />;
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const meta = POST_STATUS_META[post.status];
        return (
          <Card key={post.postId}>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{post.title}</p>
                <p className="text-xs text-text-muted">
                  by {post.authorName ?? `User #${post.authorId}`} · {formatDate(post.createdAt)}
                </p>
              </div>
              <Badge className={meta?.className}>{meta?.label ?? post.status}</Badge>
              <Select
                value={post.status}
                onValueChange={(value) => updateStatus.mutate({ id: post.postId, status: value as PostStatus })}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {POST_STATUS_META[s]?.label ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Comments: approve / reject / delete, across any post ────────────────────
function CommentModerationPanel() {
  const { data: posts, isLoading: postsLoading } = useAllPosts();
  const [postId, setPostId] = useState<number | null>(null);
  const activePostId = postId ?? posts?.[0]?.postId ?? -1;

  const { data: comments, isLoading, isError, error, refetch } = useComments(activePostId);
  const moderate = useModerateComment();
  const remove = useDeleteComment();

  return (
    <div className="flex flex-col gap-4">
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

      {isError ? (
        <ErrorState message={error instanceof Error ? error.message : "Failed to load comments"} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
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
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{comment.content}</p>
                    <div className="mt-3 flex items-center gap-2">
                      {comment.status !== "APPROVED" && (
                        <Button size="sm" variant="secondary" loading={moderate.isPending} onClick={() => moderate.mutate({ id: comment.commentId, status: "APPROVED" })}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                      )}
                      {comment.status !== "REJECTED" && (
                        <Button size="sm" variant="ghost" onClick={() => moderate.mutate({ id: comment.commentId, status: "REJECTED" })}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="ml-auto text-danger hover:text-danger" loading={remove.isPending} onClick={() => remove.mutate(comment.commentId)}>
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
  );
}

// ── Categories: create only ──────────────────────────────────────────────────
function CategoryCreatePanel() {
  const createCategory = useCreateCategory();
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!categoryName.trim() || !categorySlug.trim()) return;
    createCategory.mutate(
      { categoryName, categorySlug, Description: description || undefined },
      { onSuccess: () => { setCategoryName(""); setCategorySlug(""); setDescription(""); } }
    );
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="admin-category-name">Name</Label>
          <Input
            id="admin-category-name"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              setCategorySlug(slugify(e.target.value));
            }}
            placeholder="e.g. Engineering"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-category-slug">Slug</Label>
          <Input id="admin-category-slug" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-category-desc">Description</Label>
          <Input id="admin-category-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
        </div>
        <Button onClick={submit} loading={createCategory.isPending} disabled={!categoryName.trim() || !categorySlug.trim()}>
          <Plus className="h-4 w-4" /> Create category
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Tags: create only ────────────────────────────────────────────────────────
function TagCreatePanel() {
  const autoCreate = useAutoCreateTags();
  const [draft, setDraft] = useState("");

  const submitTag = () => {
    const names = draft.split(",").map((t) => t.trim()).filter(Boolean);
    if (!names.length) return;
    autoCreate.mutate(names, { onSuccess: () => setDraft("") });
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. react, spring-boot, kafka — comma separated"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submitTag())}
        />
        <Button onClick={submitTag} loading={autoCreate.isPending} className="shrink-0">
          <Plus className="h-4 w-4" /> Create tags
        </Button>
      </CardContent>
    </Card>
  );
}
