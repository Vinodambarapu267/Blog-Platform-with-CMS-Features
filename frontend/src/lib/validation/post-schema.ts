import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(180),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().max(280, "Keep it under 280 characters").optional(),
  content: z.string().min(20, "Write a bit more content before publishing"),
  categoryId: z.number().optional(),
  tags: z.array(z.string()),
});
export type PostFormValues = z.infer<typeof postSchema>;
