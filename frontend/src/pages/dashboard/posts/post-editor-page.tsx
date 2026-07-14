import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Send, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/overlays";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { usePost, useCreatePost, useUpdatePost, useUpdatePostStatus, useDeletePost } from "@/hooks/use-posts";
import { useCategories } from "@/hooks/use-taxonomy";
import { slugify } from "@/lib/utils";
import { ROUTES, POST_STATUS_META } from "@/constants";
import type { PostStatus } from "@/types";
import type { PostCreateBody, PostUpdateBody } from "@/api/posts";

// ── Form schema ─────────────────────────────────────────────────────────────
const postSchema = z.object({
  title: z.string().min(3, "At least 3 characters").max(180),
  slug: z
    .string()
    .min(3, "At least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().max(280).optional(),
  content: z.string().min(20, "Write more content before saving"),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED", "DELETED"]),
  categoryId: z.number().optional(),
});
type PostFormValues = z.infer<typeof postSchema>;

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "REVIEW", label: "In Review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export function PostEditorPage() {
  const params = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(params.id);
  const postId = Number(params.id);

  const { data: existingPost, isLoading: postLoading } = usePost(postId);
  const { data: categoriesPage } = useCategories();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost(postId);
  const updateStatus = useUpdatePostStatus();
  const deletePost = useDeletePost();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "DRAFT",
    },
  });

  // Populate form when editing an existing post
  useEffect(() => {
    if (existingPost) {
      reset({
        title: existingPost.title,
        slug: existingPost.slug,
        excerpt: existingPost.excerpt ?? "",
        content: existingPost.content,
        status: existingPost.status,
        categoryId: existingPost.categoryId,
      });
    }
  }, [existingPost, reset]);

  // Auto-generate slug from title on create (not on edit — slug is unique and locked)
  const title = watch("title");
  useEffect(() => {
    if (!isEditing && title) setValue("slug", slugify(title));
  }, [title, isEditing, setValue]);

  const onSubmit = async (values: PostFormValues) => {
    try {
      if (isEditing) {
        // updatepost expects PostDto — status is part of the body
        const payload: PostUpdateBody = {
          title: values.title,
          slug: values.slug,
          content: values.content,
          excerpt: values.excerpt,
          status: values.status,
          categoryId: values.categoryId,
        };
        await updatePost.mutateAsync(payload);
      } else {
        // createpost accepts Post entity — authorId is set from JWT by the backend
        const payload: PostCreateBody = {
          title: values.title,
          slug: values.slug,
          content: values.content,
          excerpt: values.excerpt,
          status: values.status,
          categoryId: values.categoryId,
        };
        await createPost.mutateAsync(payload);
        navigate(ROUTES.posts);
      }
    } catch {
      // error toast handled by mutation
    }
  };

  if (isEditing && postLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-text-secondary">Loading post…</div>
      </DashboardLayout>
    );
  }

  const currentStatusMeta = existingPost ? POST_STATUS_META[existingPost.status] : null;

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={() => navigate(ROUTES.posts)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{isEditing ? "Edit post" : "New post"}</h1>
              {isEditing && currentStatusMeta && (
                <p className="mt-0.5 text-sm text-text-secondary">
                  Status: <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${currentStatusMeta.className}`}>{currentStatusMeta.label}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="danger"
                loading={deletePost.isPending}
                onClick={() => deletePost.mutate(postId, { onSuccess: () => navigate(ROUTES.posts) })}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
            {isEditing && existingPost?.status !== "PUBLISHED" && (
              <Button
                type="button"
                variant="secondary"
                loading={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: postId, status: "PUBLISHED" })}
              >
                <Send className="h-4 w-4" /> Publish now
              </Button>
            )}
            <Button type="submit" loading={isSubmitting || createPost.isPending || updatePost.isPending}>
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left — main content */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="How we cut deploy time by 40%" {...register("title")} />
                  {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">
                    Slug <span className="text-text-muted text-xs">(auto-generated, must be unique)</span>
                  </Label>
                  <Input id="slug" placeholder="how-we-cut-deploy-time" {...register("slug")} />
                  {errors.slug && <p className="text-xs text-danger">{errors.slug.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="excerpt">
                    Excerpt <span className="text-text-muted text-xs">(optional)</span>
                  </Label>
                  <Textarea id="excerpt" rows={2} placeholder="A one-sentence summary for previews" {...register("excerpt")} />
                  {errors.excerpt && <p className="text-xs text-danger">{errors.excerpt.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => <MarkdownEditor value={field.value} onChange={field.onChange} />}
                />
                {errors.content && <p className="mt-2 text-xs text-danger">{errors.content.message}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Right — settings sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label>Post status</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-text-muted">
                    Status is validated server-side against your role permissions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categoriesPage?.content ?? []).map((c) => (
                          <SelectItem key={c.categoryId} value={String(c.categoryId)}>
                            {c.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </CardContent>
            </Card>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-text-muted space-y-1.5">
              <p className="font-medium text-text-secondary">Token status</p>
              <p>The Authorization: Bearer token is automatically attached to every request by the axios interceptor. <span className="text-success">✓ active</span></p>
              <p className="mt-1">POST_CREATE permission is required to create posts. AUTHORs, EDITORs, and ADMINs have it.</p>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
