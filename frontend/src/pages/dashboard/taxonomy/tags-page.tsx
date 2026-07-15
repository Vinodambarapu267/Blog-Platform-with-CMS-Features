import { useState } from "react";
import {  MessageSquare,Plus, X, TrendingUp, TagIcon } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState, ErrorState, Skeleton } from "@/components/ui/misc";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/overlays";
import { useTags, usePopularTags, useAutoCreateTags, useDeleteTag } from "@/hooks/use-taxonomy";
import { useAuth } from "@/contexts/auth-context";

const TAG_MANAGE_ROLES = ["SUPER_ADMIN", "ADMIN"];

export function TagsPage() {
  const { user } = useAuth();
  // Creating/deleting tags is an admin-only action — normal users (
  // AUTHOR, READER, etc.) can browse tags but shouldn't get the write UI.
  const canManageTags = !!user && TAG_MANAGE_ROLES.includes(user.role);
// Tags page always shows all tags, no filtering by post
  const { data: tags, isLoading, isError, error, refetch } = useTags();
  const { data: popular } = usePopularTags();
  const autoCreate = useAutoCreateTags();
  const deleteTag = useDeleteTag();
  const [draft, setDraft] = useState("");

  const submitTag = () => {
    const names = draft.split(",").map((t) => t.trim()).filter(Boolean);
    if (!names.length) return;
    autoCreate.mutate(names, { onSuccess: () => setDraft("") });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Tags</h1>
          <p className="mt-1 text-sm text-text-secondary">Tags auto-create on write and rank themselves by usage.</p>
        </div>

        {canManageTags && (
          <Card>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="e.g. react, spring-boot, kafka — comma separated"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submitTag())}
              />
              <Button onClick={submitTag} loading={autoCreate.isPending} className="shrink-0">
                <Plus className="h-4 w-4" /> Add tags
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All tags</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {isError ? (
          <ErrorState message={error instanceof Error ? error.message : "Failed to load comments"} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : (TagIcon ?? []).length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-5 w-5" />}
            title="No tags available"
            description="Tags will show up here as readers add them."
          />
        ): (
              <div className="flex flex-wrap gap-2">
                {(tags ?? []).map((tag) => (
                  <Badge key={tag.tagId} className="gap-2 border-white/10 bg-white/5 py-1.5 pl-3 pr-2 text-text-secondary">
                    #{tag.tagName}
                    <span className="text-text-muted">{tag.postCount}</span>
                    {canManageTags && (
                      <button onClick={() => deleteTag.mutate(tag.tagId)} className="rounded-full p-0.5 hover:bg-white/10 hover:text-danger">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary-light" /> Trending tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {(popular?.content ?? []).map((tag, i) => (
                  <div key={tag.tagId} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs font-medium text-text-muted">{i + 1}</span>
                      <span className="text-sm font-medium">#{tag.tagName}</span>
                    </div>
                    <span className="text-xs text-text-muted">{tag.postCount} posts</span>
                  </div>
                ))}
                {(popular?.content ?? []).length === 0 && (
                  <p className="py-6 text-center text-sm text-text-secondary">No usage data yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
