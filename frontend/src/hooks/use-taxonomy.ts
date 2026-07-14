import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { categoriesApi, tagsApi } from "@/api/taxonomy";
import type { CategoryDto } from "@/types";

export const categoryKeys = { all: ["categories"] as const };
export const tagKeys = { all: ["tags"] as const, popular: ["tags", "popular"] as const };

export function useCategories(page = 0) {
  return useQuery({
    queryKey: [...categoryKeys.all, page],
    queryFn: () => categoriesApi.list(page),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryDto) => categoriesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryDto }) =>
      categoriesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useTags() {
  return useQuery({ queryKey: tagKeys.all, queryFn: () => tagsApi.list() });
}

export function usePopularTags() {
  return useQuery({ queryKey: tagKeys.popular, queryFn: () => tagsApi.popular() });
}

export function useAutoCreateTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (names: string[]) => tagsApi.autocreate(names),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tagKeys.all });
      toast.success("Tags saved");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: number) => tagsApi.remove(tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tagKeys.all });
      toast.success("Tag deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
