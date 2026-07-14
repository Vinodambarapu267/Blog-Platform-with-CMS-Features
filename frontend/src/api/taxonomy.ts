import { apiClient } from "./client";
import type { Category, CategoryDto, Tag, TagResponse, SpringPage, ResponseMessage } from "@/types";

// Categories-&-Tag-service CategoryController + TagController source analysis:
//
// createcategory: POST /api/v1/categories/createcategory
//   @RequestBody CategoryDto { categoryName, categorySlug, Description (capital D), parentId }
//   @PreAuthorize("hasAuthority('CATEGORY_CREATE')")
//   CategoryServiceImpl.createCategory: calls dto.getDescription() (Lombok lowercases capital-D field to getDescription())
//   Returns ResponseMessage { statuscode, status, message, data: Category }
//
// updateCategory: PUT /api/v1/categories/updateCategory/{categoryId}
//   @RequestBody CategoryDto
//   @PreAuthorize("hasAuthority('CATEGORY_UPDATE')")
//   Returns ResponseMessage { data: Category }
//
// getAllCategories: GET /api/v1/categories?page=&sortBy=
//   BOTH params are required — no @RequestParam(defaultValue=...) in the controller
//   Returns Page<Category> directly (not wrapped in ResponseMessage)
//   OPEN GET (RouteValidator: /api/v1/categories/**)
//
// deletebyid: DELETE /api/v1/categories/deletebyid/{id}
//   @PreAuthorize("hasAuthority('CATEGORY_DELETE')")
//   Returns plain String "deleted successfully : {id}"
//
// validate: GET /api/v1/categories/{category-id}/validate
//   Rate-limited (Resilience4j). Returns plain String.
//   OPEN GET.
//
// ── Tags ────────────────────────────────────────────────────────────────────
//
// autocreate: POST /api/v1/tags/autocreate
//   @RequestBody TagResolveRequest record { List<String> names }  (1–50 items)
//   @PreAuthorize("isAuthenticated()") — TOKEN REQUIRED
//   TagServiceImpl.resolveTags normalizes names (trim, lowercase)
//   IMPORTANT — same ResponseMessage(Integer,String,String,Object)/(...,List<?>) overload
//   pair as Post-Service (see api/posts.ts). createTags passes a List<TagResponse>, so Java
//   picks the List<?> overload — the array lands in "list", not "data".
//   Returns ResponseMessage { statuscode, status, message, list: TagResponse[] }
//
// findAll: GET /api/v1/tags
//   Rate-limited. OPEN GET.
//   Same trap: findAll passes List<Tag> → populates "list", not "data".
//   Returns ResponseMessage { statuscode, status, message, list: Tag[] }
//   NOTE: if tags list is empty → returns ResponseMessage with FAILURE status (no list field)
//
// popular: GET /api/v1/tags/popular?page=&size=
//   Both params have defaultValue ("0" and "20"). Rate-limited. OPEN GET.
//   Returns Page<Tag> directly
//
// deleteTag: DELETE /api/v1/tags/delete/{tag-id}
//   @PreAuthorize("hasAuthority('TAG_DELETE')")
//   Rate-limited. Returns plain String "deleted successfully"

export const categoriesApi = {
  create: (payload: CategoryDto) =>
    apiClient
      .post<ResponseMessage<Category>>("/api/v1/categories/createcategory", payload)
      .then((r) => r.data.data as Category),

  update: (categoryId: number, payload: CategoryDto) =>
    apiClient
      .put<ResponseMessage<Category>>(`/api/v1/categories/updateCategory/${categoryId}`, payload)
      .then((r) => r.data.data as Category),

  // page and sortBy are BOTH required — no defaults in controller
  list: (page = 0, sortBy = "categoryName") =>
    apiClient
      .get<SpringPage<Category>>("/api/v1/categories", { params: { page, sortBy } })
      .then((r) => r.data),

  validate: (categoryId: number) =>
    apiClient
      .get<string>(`/api/v1/categories/${categoryId}/validate`)
      .then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete<string>(`/api/v1/categories/deletebyid/${id}`).then((r) => r.data),
};

export const tagsApi = {
  // body must be { names: string[] } matching TagResolveRequest record
  autocreate: (names: string[]) =>
    apiClient
      .post<ResponseMessage<TagResponse>>("/api/v1/tags/autocreate", { names })
      .then((r) => {
        // TagController's List<TagResponse> lands in "list" (see comment above), not "data"
        const body = r.data;
        if (Array.isArray(body.list)) return body.list;
        return [] as TagResponse[];
      }),

  list: () =>
    apiClient
      .get<ResponseMessage<Tag>>("/api/v1/tags")
      .then((r) => {
        // On empty list, TagController returns ResponseMessage with FAILURE (no list/data).
        // On success: ResponseMessage with list: Tag[] (see comment above)
        const body = r.data as Partial<ResponseMessage<Tag>> | Tag[];
        if (Array.isArray(body)) return body;
        if (Array.isArray(body.list)) return body.list;
        return [] as Tag[];
      }),

  popular: (page = 0, size = 20) =>
    apiClient
      .get<SpringPage<Tag>>("/api/v1/tags/popular", { params: { page, size } })
      .then((r) => r.data),

  remove: (tagId: number) =>
    apiClient.delete<string>(`/api/v1/tags/delete/${tagId}`).then((r) => r.data),
};
