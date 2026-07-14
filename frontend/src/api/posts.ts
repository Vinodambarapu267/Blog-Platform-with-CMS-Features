import { apiClient } from "./client";
import type { ApiError, Post, PostStatus, ResponseMessage } from "@/types";

// Post-Service PostController source analysis:
//
// createpost: POST /api/v1/posts/createpost
//   @RequestBody Post entity (PostServiceImpl ignores authorId from body — sets from Feign call)
//   @PreAuthorize("hasAuthority('POST_CREATE')")
//   Token REQUIRED — not in OPEN_POST_ENDPOINTS
//   Returns ResponseMessage { statuscode, status, message, data: Post }
//
// updatepost: PUT /api/v1/posts/updatepost/{id}
//   @RequestBody PostDto { postId, title, slug, content, excerpt, status, authorId, categoryId, ... }
//   @PreAuthorize("hasAuthority('POST_UPDATE_OWN')")
//   PostServiceImpl.updatePost checks isOwner AND POST_UPDATE_OWN permission
//   Returns ResponseMessage { data: Post }
//
// updatestatus: PUT /api/v1/posts/updatestatus/{id}?status=
//   @PreAuthorize("isAuthenticated()")
//   Fine-grained per-status permission check in PostServiceImpl.updatePostStatus
//   PUBLISHED → POST_PUBLISH, ARCHIVED → POST_UNPUBLISH, REVIEW → POST_SUBMIT_DRAFT/POST_APPROVE
//   DRAFT → POST_REJECT, DELETED → POST_DELETE_ANY/OWN
//   Returns plain String
//
// deletePost: DELETE /api/v1/posts/{id}
//   Requires POST_DELETE_ANY OR (POST_DELETE_OWN AND isOwner)
//   Returns plain String
//
// addLike: POST /api/v1/posts/{id}/like
//   @RequestBody PostLike (backend ignores body's userId — derives from auth)
//   @PreAuthorize("hasAuthority('POST_LIKE')")
//   NOTE: READER has POST_LIKE, AUTHOR has POST_LIKE — not GUEST
//   Returns ResponseMessage { data: Post }
//
// findByPostId: GET /api/v1/posts/{postId}
//   OPEN GET (RouteValidator: /api/v1/posts/*)
//   Returns PostDto directly (no ResponseMessage wrapper)
//
// getTotalLikes: GET /api/v1/posts/{id}/likes
//   OPEN GET (RouteValidator: /api/v1/posts/*)
//   @PreAuthorize("hasAuthority('POST_LIKES')") — but gateway open, downstream checks
//   Returns Integer directly
//
// findAllPost: GET /api/v1/posts
//   OPEN GET — explicitly whitelisted in the Api-Gateway RouteValidator
//   (OPEN_GET_ENDPOINTS includes "/api/v1/posts" exactly, in addition to "/api/v1/posts/*"),
//   no JWT needed. Lists every post on the platform (not scoped to one author).
//   Same ResponseMessage(Integer,String,String,Object)/(...,List<?>) overload trap as
//   findAllByAuthorId below — controller passes a List<Post>, so Java picks the List<?>
//   overload and the array lands in "list", not "data".
//   Returns ResponseMessage { statuscode, status, message, list: Post[] }
//
// findAllByAuthorId: GET /api/v1/posts/findpostsbyuserid/{userId}
//   OPEN GET — explicitly whitelisted in the Api-Gateway RouteValidator
//   (OPEN_GET_ENDPOINTS includes "/api/v1/posts/findpostsbyuserid/*"), no JWT needed.
//
//   IMPORTANT — utility.ResponseMessage has TWO 4-arg constructors:
//     ResponseMessage(Integer, String, String, Object data)
//     ResponseMessage(Integer, String, String, List<?> list)
//   The controller calls `new ResponseMessage(status, name, message, posts)` where `posts`
//   is a List<Post>. Java's overload resolution picks the more specific List<?> constructor
//   over Object, so the JSON actually comes back as { statuscode, status, message, list: [...] }
//   — the "list" field is populated, "data" stays null/absent. (createpost/updatepost/addLike
//   pass a single Post, not a List, so those correctly use the Object/"data" constructor.)
//
//   Empty case: PostServiceImpl.findAllByAuthorId THROWS PostNotFoundException when the
//   author has zero posts. GlobalExceptionHandler catches it and still responds HTTP 200,
//   but with a totally different body shape: ErrorMessage { timeStamp, statusCode, message, path }.
//   We detect that shape and treat it as "no posts yet" instead of surfacing it as an error.

export interface PostCreateBody {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId?: number;
  status?: PostStatus;
  // authorId intentionally omitted — PostServiceImpl.createPost resolves it via Feign from JWT username
}

export interface PostUpdateBody {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  categoryId?: number;
  // authorId intentionally omitted — PostServiceImpl.updatePost resolves it via Feign
}

const unwrapPost = (r: { data: ResponseMessage<Post> }): Post => r.data.data as Post;

export const postsApi = {
  // GET /api/v1/posts — every post on the platform, open endpoint, no auth required.
  listAll: (): Promise<Post[]> =>
    apiClient
      .get<ResponseMessage<Post> | ApiError>("/api/v1/posts")
      .then((r) => {
        const body = r.data as Partial<ResponseMessage<Post>> | undefined;
        // Java overload resolution puts the array in "list", not "data" — see comment above.
        if (body && Array.isArray(body.list)) return body.list;
        if (body && Array.isArray(body.data)) return body.data as unknown as Post[];
        return [];
      }),

  // GET /api/v1/posts/findpostsbyuserid/{authorId}
  // This IS the "posts list" for the dashboard — see note above the object.
  listByAuthor: (authorId: number): Promise<Post[]> =>
    apiClient
      .get<ResponseMessage<Post> | ApiError>(`/api/v1/posts/findpostsbyuserid/${authorId}`)
      .then((r) => {
        const body = r.data as Partial<ResponseMessage<Post>> | undefined;
        // Java overload resolution puts the array in "list", not "data" — see comment above.
        // Still fall back to "data" defensively in case the backend is ever fixed/changed.
        if (body && Array.isArray(body.list)) return body.list;
        if (body && Array.isArray(body.data)) return body.data as unknown as Post[];
        // ErrorMessage shape ({ timeStamp, statusCode, message, path }) — author has no posts yet.
        return [];
      }),

  create: (payload: PostCreateBody) =>
    apiClient
      .post<ResponseMessage<Post>>("/api/v1/posts/createpost", payload)
      .then(unwrapPost),

  update: (id: number, payload: PostUpdateBody) =>
    apiClient
      .put<ResponseMessage<Post>>(`/api/v1/posts/updatepost/${id}`, payload)
      .then(unwrapPost),

  // updateStatus returns plain String — use responseType text to avoid JSON parse error
  updateStatus: (id: number, status: PostStatus) =>
    apiClient
      .put<string>(`/api/v1/posts/updatestatus/${id}`, null, {
        params: { status },
        responseType: "text",
      })
      .then((r) => r.data),

  // deletePost returns plain String
  remove: (id: number) =>
    apiClient
      .delete<string>(`/api/v1/posts/${id}`, { responseType: "text" })
      .then((r) => r.data),

  // addLike: send empty object — backend derives userId from JWT via Authentication
  toggleLike: (id: number) =>
    apiClient
      .post<ResponseMessage<Post>>(`/api/v1/posts/${id}/like`, {})
      .then(unwrapPost),

  // findByPostId returns PostDto directly (no wrapper)
  getById: (id: number) =>
    apiClient.get<Post>(`/api/v1/posts/${id}`).then((r) => r.data),

  // getTotalLikes returns Integer directly
  getLikeCount: (id: number) =>
    apiClient.get<number>(`/api/v1/posts/${id}/likes`).then((r) => r.data),
};
