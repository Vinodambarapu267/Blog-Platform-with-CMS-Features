import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/overlays";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ROUTES } from "@/constants";

const LandingPage = lazy(() => import("@/pages/public/landing-page").then((m) => ({ default: m.LandingPage })));
const PostViewPage = lazy(() => import("@/pages/public/post-view-page").then((m) => ({ default: m.PostViewPage })));
const LoginPage = lazy(() => import("@/pages/auth/login-page").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/auth/register-page").then((m) => ({ default: m.RegisterPage })));

const DashboardHomePage = lazy(() => import("@/pages/dashboard/dashboard-home-page").then((m) => ({ default: m.DashboardHomePage })));
const PostsPage = lazy(() => import("@/pages/dashboard/posts/posts-page").then((m) => ({ default: m.PostsPage })));
const PostEditorPage = lazy(() => import("@/pages/dashboard/posts/post-editor-page").then((m) => ({ default: m.PostEditorPage })));
const CategoriesPage = lazy(() => import("@/pages/dashboard/taxonomy/categories-page").then((m) => ({ default: m.CategoriesPage })));
const TagsPage = lazy(() => import("@/pages/dashboard/taxonomy/tags-page").then((m) => ({ default: m.TagsPage })));
const CommentsPage = lazy(() => import("@/pages/dashboard/comments-page").then((m) => ({ default: m.CommentsPage })));
const AdminPanelPage = lazy(() => import("@/pages/dashboard/admin/admin-panel-page").then((m) => ({ default: m.AdminPanelPage })));
const UsersPage = lazy(() => import("@/pages/dashboard/users-page").then((m) => ({ default: m.UsersPage })));
const ProfilePage = lazy(() => import("@/pages/dashboard/profile-page").then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("@/pages/dashboard/settings-page").then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import("@/pages/not-found-page").then((m) => ({ default: m.NotFoundPage })));

function PageFallback() {
  return (
    <div className="bg-ambient flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
    </div>
  );
}

function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path={ROUTES.home} element={<LandingPage />} />
          {/* Public — no login required. Backend's GET /posts/{id} and GET /comments/posts/{id}/comments
              are both open endpoints; gating this behind ProtectedRoute was what sent every post click to /login. */}
          <Route path="/posts/:id" element={<PostViewPage />} />
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
          <Route path={ROUTES.dashboard} element={<ProtectedRoute><DashboardHomePage /></ProtectedRoute>} />
          <Route path={ROUTES.posts} element={<ProtectedRoute><PostsPage /></ProtectedRoute>} />
          <Route path={ROUTES.postNew} element={<ProtectedRoute><PostEditorPage /></ProtectedRoute>} />
          <Route path="/dashboard/posts/:id/edit" element={<ProtectedRoute><PostEditorPage /></ProtectedRoute>} />
          <Route path={ROUTES.categories} element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
          <Route path={ROUTES.tags} element={<ProtectedRoute><TagsPage /></ProtectedRoute>} />
          <Route path={ROUTES.comments} element={<ProtectedRoute><CommentsPage /></ProtectedRoute>} />
          <Route
            path={ROUTES.admin}
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.users} element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path={ROUTES.profile} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path={ROUTES.settings} element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </TooltipProvider>
  );
}

export default App;
