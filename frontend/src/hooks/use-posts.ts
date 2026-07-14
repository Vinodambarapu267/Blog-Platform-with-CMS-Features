import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { postsApi, type PostCreateBody, type PostUpdateBody } from "@/api/posts";
import { useCurrentUser } from "@/hooks/use-users";
import type { Post, PostStatus } from "@/types";

export const postKeys = {
  all: ["posts"] as const,
  allPosts: ["posts", "all"] as const,
  byAuthor: (authorId: number) => ["posts", "author", authorId] as const,
  detail: (id: number) => ["posts", id] as const,
};


export function useAllPosts() {
  return useQuery({
    queryKey: postKeys.allPosts,
    queryFn: () => postsApi.listAll(),
  });
}


export function usePosts() {
  const currentUser = useCurrentUser();
  const authorId = currentUser.data?.userId;

  const postsQuery = useQuery({
    queryKey: postKeys.byAuthor(authorId ?? -1),
    queryFn: () => postsApi.listByAuthor(authorId as number),
    enabled: Number.isFinite(authorId),
  });

  return {
    ...postsQuery,
    isLoading: currentUser.isLoading || (Number.isFinite(authorId) && postsQuery.isLoading),
    isError: currentUser.isError || postsQuery.isError,
    error: currentUser.error ?? postsQuery.error,
  };
}

export function usePost(id: number) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PostCreateBody) => postsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Post created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdatePost(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PostUpdateBody) => postsApi.update(id, payload),
    onSuccess: (updatedPost) => {
     qc.setQueryData<Post>(postKeys.detail(id), updatedPost);
     qc.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Post updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdatePostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: PostStatus }) =>
      postsApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: postKeys.detail(id) });
      const previousDetail = qc.getQueryData<Post>(postKeys.detail(id));
      qc.setQueryData<Post>(postKeys.detail(id), (old) =>
        old ? { ...old, status } : old
      );
      return { previousDetail };
    },
    onError: (err: Error, { id }, context) => {
      if (context?.previousDetail) qc.setQueryData(postKeys.detail(id), context.previousDetail);
      toast.error(err.message);
    },
    onSuccess: () => {
     qc.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Status updated");
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postsApi.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: postKeys.detail(id) });
      qc.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Post deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postsApi.toggleLike(id),
    onSuccess: (updatedPost, id) => {
      qc.setQueryData<Post>(postKeys.detail(id), updatedPost);
      qc.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
