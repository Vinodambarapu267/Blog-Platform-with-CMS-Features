export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8089";

export const AUTH_TOKEN_KEY = "blogcms.token";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  postView: (id: number | string) => `/posts/${id}`,
  dashboard: "/dashboard",
  posts: "/dashboard/posts",
  postNew: "/dashboard/posts/new",
  postEdit: (id: number | string) => `/dashboard/posts/${id}/edit`,
  categories: "/dashboard/categories",
  tags: "/dashboard/tags",
  comments: "/dashboard/comments",
  admin: "/dashboard/admin",
  users: "/dashboard/users",
  profile: "/dashboard/profile",
  settings: "/dashboard/settings",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  AUTHOR: "Author",
  READER: "Reader",
  GUEST: "Guest",
};

export const POST_STATUS_META: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "Published", className: "bg-success/15 text-success border-success/30" },
  DRAFT: { label: "Draft", className: "bg-white/10 text-text-secondary border-white/15" },
  REVIEW: { label: "In Review", className: "bg-warning/15 text-warning border-warning/30" },
  ARCHIVED: { label: "Archived", className: "bg-white/5 text-text-muted border-white/10" },
  DELETED: { label: "Deleted", className: "bg-danger/15 text-danger border-danger/30" },
};

export const COMMENT_STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30" },
  APPROVED: { label: "Approved", className: "bg-success/15 text-success border-success/30" },
  REJECTED: { label: "Rejected", className: "bg-danger/15 text-danger border-danger/30" },
  DELETED: { label: "Deleted", className: "bg-white/5 text-text-muted border-white/10" },
};
