import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { commentsApi } from "@/api/comments";
import { postsApi } from "@/api/posts";
import { postKeys } from "@/hooks/use-posts";
import { useCurrentUser } from "@/hooks/use-users";
import type { Comment, CommentDto, CommentStatus } from "@/types";

export const commentKeys = {
  forPost: (postId: number) => ["comments", postId] as const,
  all: () => ["comments", "all"] as const,
};

export function useComments(postId: number, enabled = true) {
  return useQuery({
    queryKey: commentKeys.forPost(postId),
    queryFn: () => commentsApi.listForPost(postId),
    enabled: enabled && Number.isFinite(postId),
   
  });
}

export function useAllComments(enabled = true) {
  return useQuery({
    queryKey: commentKeys.all(),
    queryFn: () => commentsApi.listAll(),
    enabled,
  });
}

// GET /api/v1/comments (findAllComments) is SUPER_ADMIN/ADMIN only on the backend —
// there is no "comments by author" endpoint for everyone else. So for a non-admin
// (a reader who owns no posts to moderate, for instance), the only way to show every
// comment THEY posted, regardless of status, is: fetch every open post, fetch that
// post's comments (also an open GET), and filter client-side to their own authorId.
// This is an N+1 fan-out (one request per post) — fine at demo/small-dataset scale,
// but if the post count grows large this should become a real backend endpoint instead.
export function useMyComments() {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.userId;

  const postsQuery = useQuery({
    queryKey: postKeys.allPosts,
    queryFn: () => postsApi.listAll(),
  });
  const posts = postsQuery.data ?? [];

  const commentQueries = useQueries({
    queries: posts.map((p) => ({
      queryKey: commentKeys.forPost(p.postId),
      queryFn: () => commentsApi.listForPost(p.postId),
      enabled: postsQuery.isSuccess,
    })),
  });

  const postTitleById = new Map(posts.map((p) => [p.postId, p.title]));

  const isLoading = postsQuery.isLoading || commentQueries.some((q) => q.isLoading);
  const isError = postsQuery.isError || commentQueries.some((q) => q.isError);
  const firstError = postsQuery.error ?? commentQueries.find((q) => q.error)?.error;

  const comments = userId
    ? commentQueries
        .flatMap((q) => q.data ?? [])
        .filter((c) => c.authorId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const refetch = () => {
    postsQuery.refetch();
    commentQueries.forEach((q) => q.refetch());
  };

  return { data: comments, isLoading, isError, error: firstError, refetch, postTitleById };
}

export function useCreateComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommentDto) => commentsApi.create(postId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.forPost(postId) });
      toast.success("Comment posted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useModerateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Exclude<CommentStatus, "DELETED"> }) =>
      commentsApi.updateStatus(id, status),
   onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["comments"] });
      const previous = qc.getQueriesData<Comment[]>({ queryKey: ["comments"] });
      qc.setQueriesData<Comment[]>({ queryKey: ["comments"] }, (old) =>
        old?.map((c) => (c.commentId === id ? { ...c, status } : c))
      );
      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      context?.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(err.message);
    },
    onSuccess: () => {
    toast.success("Comment moderated");
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => commentsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Comment deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}