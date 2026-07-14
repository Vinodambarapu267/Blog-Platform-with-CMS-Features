import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Heart, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, EmptyState, ErrorState } from "@/components/ui/misc";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/overlays";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/overlays";
import { usePosts, useDeletePost, useUpdatePostStatus } from "@/hooks/use-posts";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES, POST_STATUS_META } from "@/constants";
import { formatDate } from "@/lib/utils";
import type { Post, PostStatus } from "@/types";

const POST_ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];
const POST_STATUS_OPTIONS: PostStatus[] = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED", "DELETED"];

export function PostsPage() {
  const { user } = useAuth();
  const isAdmin = !!user && POST_ADMIN_ROLES.includes(user.role);

  const deletePost = useDeletePost();
  const updateStatus = useUpdatePostStatus();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearch(q);
  }, [searchParams]);
  const [status, setStatus] = useState<string>("ALL");
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null);

  // This page always shows only the signed-in user's own posts — regardless
  // of role. SUPER_ADMIN/ADMIN don't see other authors' posts here; that
  // cross-user view lives in the dedicated Admin Panel instead.
  const { data: posts, isLoading, isError, error, refetch } = usePosts();

  const filtered = useMemo(() => {
    return (posts ?? []).filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "ALL" || p.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [posts, search, status]);

  const columns: Column<Post>[] = [
    {
      key: "title",
      header: "Title",
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-text-muted">
            <FileText className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="max-w-xs truncate font-medium">{p.title}</p>
            <p className="max-w-xs truncate text-xs text-text-muted">/{p.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => {
        const meta = POST_STATUS_META[p.status];
        if (!isAdmin) {
          return <Badge className={meta?.className}>{meta?.label ?? p.status}</Badge>;
        }
        return (
          <Select
            value={p.status}
            onValueChange={(value) => updateStatus.mutate({ id: p.postId, status: value as PostStatus })}
          >
            <SelectTrigger className="w-40">
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
        );
      },
    },
    {
      key: "views",
      header: "Views",
      render: (p) => (
        <span className="flex items-center gap-1.5 text-text-secondary">
          <Eye className="h-3.5 w-3.5" /> {p.viewCount ?? 0}
        </span>
      ),
    },
    {
      key: "likes",
      header: "Likes",
      render: (p) => (
        <span className="flex items-center gap-1.5 text-text-secondary">
          <Heart className="h-3.5 w-3.5" /> {p.likeCount ?? 0}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (p) => <span className="text-text-secondary">{formatDate(p.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-white/10 hover:text-text-primary">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={ROUTES.postView(p.postId)}>
                <Eye className="h-3.5 w-3.5" /> View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={ROUTES.postEdit(p.postId)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-danger hover:text-danger"
              onSelect={(e) => {
                e.preventDefault();
                setPendingDelete(p);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Posts</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {isAdmin ? "Manage your own posts — change status inline." : "Create, publish, and manage your posts."}
            </p>
          </div>
          <Button asChild>
            <Link to={ROUTES.postNew}>
              <Plus className="h-4 w-4" /> New post
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {["ALL", "PUBLISHED", "DRAFT", "REVIEW", "ARCHIVED", "DELETED"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "ALL" ? "All statuses" : POST_STATUS_META[s]?.label ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <ErrorState message={error instanceof Error ? error.message : "Failed to load posts"} onRetry={() => refetch()} />
        ) : !isLoading && filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="No posts found"
            description="Try a different search, or create your first post."
            action={
              <Button asChild size="sm">
                <Link to={ROUTES.postNew}>
                  <Plus className="h-4 w-4" /> New post
                </Link>
              </Button>
            }
          />
        ) : (
          <DataTable columns={columns} data={filtered} rowKey={(p) => p.postId} isLoading={isLoading} />
        )}
      </div>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        {pendingDelete && (
          <DialogContent title="Delete this post?" description={`"${pendingDelete.title}" will be permanently removed.`}>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPendingDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deletePost.isPending}
                onClick={() => {
                  deletePost.mutate(pendingDelete.postId, { onSuccess: () => setPendingDelete(null) });
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </DashboardLayout>
  );
}