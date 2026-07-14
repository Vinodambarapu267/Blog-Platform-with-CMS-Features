import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { commentsApi } from "@/api/comments";
import type { Comment, CommentDto, CommentStatus } from "@/types";

export const commentKeys = {
  forPost: (postId: number) => ["comments", postId] as const,
  all: () => ["comments", "all"] as const,
};

export function useComments(postId: number) {
  return useQuery({
    queryKey: commentKeys.forPost(postId),
    queryFn: () => commentsApi.listForPost(postId),
    enabled: Number.isFinite(postId),
   
  });
}

export function useAllComments() {
  return useQuery({
    queryKey: commentKeys.all(),
    queryFn: () => commentsApi.listAll(),
  });
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
