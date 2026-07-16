import { useState ,useMemo} from "react";
import { useForm } from "react-hook-form";
import { FolderTree, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/misc";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAllPosts } from "@/hooks/use-posts";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/overlays";
import {
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
} from "@/hooks/use-taxonomy";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFormValues {
  categoryName: string;
  categorySlug: string;
  description?: string;
}

export function CategoriesPage() {
  const { data, isLoading, isError, error, refetch } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
const { data: allPosts } = useAllPosts();
const postCountByCategory = useMemo(() => {
  const map = new Map<number, number>();
  (allPosts ?? []).forEach((p) => {
    if (p.categoryId != null) map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + 1);
  });
  return map;
}, [allPosts]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<CategoryFormValues>({
    defaultValues: { categoryName: "", categorySlug: "", description: "" },
  });
  const name = watch("categoryName");
  const openEdit = (category: Category) => {
    setEditing(category);
    reset({
      categoryName: category.categoryName,
      categorySlug: category.categorySlug,
      description: category.description ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.categoryId, payload: { categoryName: values.categoryName, categorySlug: values.categorySlug, Description: values.description } });
    } else {
      await createCategory.mutateAsync({ categoryName: values.categoryName, categorySlug: values.categorySlug, Description: values.description });
    }
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Categories</h1>
            <p className="mt-1 text-sm text-text-secondary">Organize posts into a browsable hierarchy.</p>
          </div>
        </div>

        {isError ? (
          <ErrorState message={error instanceof Error ? error.message : "Failed to load categories"} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
          </div>
        ) : (data?.content ?? []).length === 0 ? (
          <EmptyState icon={<FolderTree className="h-5 w-5" />} title="No categories yet" description="Create your first category to start organizing posts." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.content ?? []).map((category) => (
              <Card key={category.categoryId}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-accent">
                        <FolderTree className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium">{category.categoryName}</p>
                        <p className="text-xs text-text-muted">/{category.categorySlug}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-white/10 hover:text-text-primary">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(category)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-danger hover:text-danger"
                          onSelect={() => deleteCategory.mutate(category.categoryId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {category.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-text-secondary">{category.description}</p>
                  )}
                  <p className="mt-3 text-xs text-text-muted">{postCountByCategory.get(category.categoryId) ?? 0} posts</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={editing ? "Edit category" : "New category"}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="categoryName">Name</Label>
              <Input
                id="categoryName"
                {...register("categoryName", {
                  onChange: (e) => {
                    if (!editing) setValue("categorySlug", slugify(e.target.value));
                  },
                })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categorySlug">Slug</Label>
              <Input id="categorySlug" {...register("categorySlug")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register("description")} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createCategory.isPending || updateCategory.isPending} disabled={!name}>
                {editing ? "Save changes" : "Create category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
