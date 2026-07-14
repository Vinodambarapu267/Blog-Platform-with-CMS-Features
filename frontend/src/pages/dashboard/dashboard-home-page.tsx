import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { FileText, Users, Eye, Plus, ArrowUpRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/misc";
import { usePosts } from "@/hooks/use-posts";
import { useUsers } from "@/hooks/use-users";
import { ROUTES, POST_STATUS_META } from "@/constants";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Footer } from "@/components/layout/footer";



export function DashboardHomePage() {
  const { user } = useAuth();
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: users, isLoading: usersLoading } = useUsers();

  const publishedCount = posts?.filter((p) => p.status === "PUBLISHED").length ?? 0;
  const totalViews = posts?.reduce((sum, p) => sum + (p.viewCount ?? 0), 0) ?? 0;

  const stats = [
    { label: "Total posts", value: posts?.length, icon: FileText, loading: postsLoading, href: ROUTES.posts },
    { label: "Published", value: publishedCount, icon: ArrowUpRight, loading: postsLoading, href: ROUTES.posts },
    { label: "Total users", value: users?.length, icon: Users, loading: usersLoading, href: ROUTES.users },
    { label: "Total views", value: totalViews, icon: Eye, loading: postsLoading, href: ROUTES.posts },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, {user?.username ?? "there"} 👋</h1>
            <p className="mt-1 text-sm text-text-secondary">Here's what's happening across your platform.</p>
          </div>
          <Button asChild>
            <Link to={ROUTES.postNew}>
              <Plus className="h-4 w-4" /> New post
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={s.href}>
                <Card className="transition-colors hover:bg-white/[0.08]">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-xs text-text-secondary">{s.label}</p>
                      {s.loading ? (
                        <Skeleton className="mt-2 h-7 w-16" />
                      ) : (
                        <p className="mt-1 font-display text-2xl font-semibold">{s.value ?? 0}</p>
                      )}
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary-light">
                      <s.icon className="h-4.5 w-4.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent posts</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.posts}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {postsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {(posts ?? []).slice(0, 5).map((post) => {
                  const meta = POST_STATUS_META[post.status];
                  return (
                    <Link
                      key={post.postId}
                      to={ROUTES.postView(post.postId)}
                      className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{post.title}</p>
                        <p className="mt-0.5 text-xs text-text-muted">{formatDate(post.createdAt)}</p>
                      </div>
                      <Badge className={meta?.className}>{meta?.label ?? post.status}</Badge>
                    </Link>
                  );
                })}
                {(posts ?? []).length === 0 && (
                  <p className="py-8 text-center text-sm text-text-secondary">No posts yet — create your first one.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </DashboardLayout>
  );
}
