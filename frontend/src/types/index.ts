// ── Auth ──────────────────────────────────────────────────────────────────
export interface LoginPayload { email: string; password: string; }
export interface TokenPayload { username: string; password: string; }

// ── Roles & Permissions (from actual Role.java / Permission.java enums) ───
export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "AUTHOR" | "READER" | "GUEST";

// ── User — UserResponseDto from User-Service ─────────────────────────────
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLOCKED";

export interface User {
  userId: number;
  username: string;
  displayName: string;
  bio?: string;
  email: string;
  role: Role;
  status: UserStatus;
  socialLinks?: Record<string, string>;
  postIds?: number[];
  createdAt: string;
  updatedAt?: string;
}

// UserCreateRequest — exact fields backend expects
export interface UserCreateRequest {
  username: string;
  displayName: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  email: string;
  password: string;
  role: Role;
}

// ── ResponseMessage — the wrapper every service returns ─────────────────
// { statuscode, status, message, data?, list? }
export interface ResponseMessage<T = unknown> {
  statuscode: number;
  status: string;
  message: string;
  data?: T;
  list?: T[];
}

// ── Post — PostDto from Post-Service ─────────────────────────────────────
export type PostStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED" | "DELETED";

export interface Post {
  postId: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  authorId: number;
  authorName?: string;
  categoryId?: number;
  categoryName?: string;
  tags?: string[];
  viewCount: number;
  likeCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Post entity shape for create (backend accepts Post entity directly)
export interface PostCreateRequest {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId?: number;
  categoryId?: number;
  status?: PostStatus;
}

// ── Category — Category entity from Categories-&-Tag-service ─────────────
export interface Category {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  description?: string;
  parentId?: number | null;
  children?: Category[];
  postCount?: number;
}

// CategoryDto — what the backend expects on create/update
export interface CategoryDto {
  categoryName: string;
  categorySlug: string;
  Description?: string;   // capital D — matches CategoryDto.java exactly
  parentId?: number | null;
}

// ── Tag — Tag entity from Categories-&-Tag-service ───────────────────────
export interface Tag {
  tagId: number;
  tagName: string;
  tagSlug: string;
  postCount: number;
}

// TagResponse record: { id, name }
export interface TagResponse {
  id: number;
  name: string;
}

// ── Comment — Comment entity from Comment-service ────────────────────────
// CommentStatus enum has PENDING, APPROVED, REJECTED, DELETED (not SPAM)
export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED" | "DELETED";

export interface Comment {
  commentId: number;
  postId: number;
  authorId: number;
  authorName?: string;
  parentId?: number | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
}

// CommentDto — what the backend expects on create/update
export interface CommentDto {
  authorId?: number;
  parentId?: number | null;
  content: string;
}

// ── Spring Page wrapper (for popular tags, categories) ───────────────────
export interface SpringPage<T> {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
}

// legacy alias
export type PagedResponse<T> = SpringPage<T>;

export interface ApiError {
  timeStamp: string;
  statusCode: number;
  message: string;
  path: string;
}
