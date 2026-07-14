import { apiClient } from "./client";
import type { Comment, CommentDto, CommentStatus, ResponseMessage } from "@/types";

// Comment-service CommentController source analysis:
//
// addComment: POST /api/v1/comments/posts/{postId}/comments
//   @RequestBody CommentDto { authorId, parentId, parent (Comment object), content }
//   @PreAuthorize("hasAuthority('COMMENT_CREATE')")
//   CommentServiceImpl.addComment resolves userId via Feign from username — ignores authorId in body
//   TOKEN REQUIRED — not in OPEN_POST_ENDPOINTS
//   Returns ResponseMessage { data: Comment }
//
// updateComment: PUT /api/v1/comments/posts/{id}/comments
//   @RequestBody CommentDto
//   @PreAuthorize("hasAuthority('COMMENT_UPDATE_ANY') or hasAuthority('COMMENT_UPDATE_OWN')")
//   CommentServiceImpl: checks isOwner + 15-minute edit window
//   Returns ResponseMessage { data: Comment }
//
// readComment: GET /api/v1/comments/posts/{postId}/comments
//   OPEN GET (RouteValidator: /api/v1/comments/posts/*/comments AND SecurityConfig permits it)
//   CommentServiceImpl.readComments: throws CommentNotFoundException if empty
//   IMPORTANT — same ResponseMessage(Integer,String,String,Object) / (...,List<?>) overload
//   pair as Post-Service (see api/posts.ts comment). readComment passes a List<Comment>,
//   so Java picks the List<?> overload and the array lands in the "list" field, not "data".
//   Returns ResponseMessage { statuscode, status, message, list: Comment[] }
//
// findAllComments: GET /api/v1/comments
//   @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')") — admin-only, unlike the
//   per-post readComment above. Returns every comment on the platform, across every post,
//   for platform-wide moderation. Same ResponseMessage overload trap as the other list
//   endpoints — array lands in "list", not "data".
//   Returns ResponseMessage { statuscode, status, message, list: Comment[] }
//
// deleteComment: DELETE /api/v1/comments/{id}
//   @PreAuthorize("hasAuthority('COMMENT_DELETE_ANY') or hasAuthority('COMMENT_DELETE_OWN')")
//   Returns plain String "deleted successfully"
//
// updateStatus: PATCH /api/v1/comments/{id}/status?status=
//   @PreAuthorize("hasAuthority('COMMENT_MODERATE')")
//   CommentServiceImpl.updateCommentStatus switch: APPROVED, PENDING, REJECTED
//   NOTE: "DELETED" is NOT in the switch — will throw IllegalArgumentException
//   Returns Comment directly (no ResponseMessage wrapper)
//
// CommentStatus enum: PENDING, APPROVED, REJECTED, DELETED
// BUT updateCommentStatus switch only handles APPROVED, PENDING, REJECTED
// → frontend must NOT call updateStatus with "DELETED" — use deleteComment instead

export const commentsApi = {
  // GET /api/v1/comments — every comment on the platform, across every post.
  // Backend restricts this to SUPER_ADMIN/ADMIN (403 for anyone else) — only
  // call this from admin-gated UI.
  listAll: (): Promise<Comment[]> =>
    apiClient
      .get<ResponseMessage<Comment> | Comment[]>("/api/v1/comments")
      .then((r) => {
        const body = r.data as Partial<ResponseMessage<Comment>> | Comment[];
        if (Array.isArray(body)) return body;
        if (Array.isArray(body.list)) return body.list;
        if (Array.isArray(body.data)) return body.data as unknown as Comment[];
        return [];
      }),

  create: (postId: number, payload: CommentDto) =>
    apiClient
      .post<ResponseMessage<Comment>>(`/api/v1/comments/posts/${postId}/comments`, payload)
      .then((r) => r.data.data as Comment),

  listForPost: (postId: number) =>
    apiClient
      .get<ResponseMessage<Comment>>(`/api/v1/comments/posts/${postId}/comments`)
      .then((r) => {
        const body = r.data as Partial<ResponseMessage<Comment>> | Comment[];
        if (Array.isArray(body)) return body;
        if (Array.isArray(body.list)) return body.list;
        // FAILURE/empty-comments response — no list field
        return [];
      }),

  update: (id: number, payload: CommentDto) =>
    apiClient
      .put<ResponseMessage<Comment>>(`/api/v1/comments/posts/${id}/comments`, payload)
      .then((r) => r.data.data as Comment),

  // Only APPROVED, PENDING, REJECTED are valid — DELETED throws IllegalArgumentException in backend
  // Use deleteComment for removal instead
  updateStatus: (id: number, status: Exclude<CommentStatus, "DELETED">) =>
    apiClient
      .patch<Comment>(`/api/v1/comments/${id}/status`, null, { params: { status } })
      .then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete<string>(`/api/v1/comments/${id}`).then((r) => r.data),
};
