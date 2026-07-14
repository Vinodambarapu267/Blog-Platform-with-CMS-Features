import { useMemo, useState } from "react";
import { Users as UsersIcon, Search, MoreHorizontal, Trash2, ShieldCheck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Avatar, Badge, EmptyState, ErrorState } from "@/components/ui/misc";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/overlays";
import { useUsers, useUpdateUserStatus, useDeleteUser } from "@/hooks/use-users";
import { ROLE_LABELS } from "@/constants";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import type { User, UserStatus } from "@/types";

const STATUS_META: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-success/15 text-success border-success/30" },
  INACTIVE: { label: "Inactive", className: "bg-white/5 text-text-muted border-white/10" },
  SUSPENDED: { label: "Suspended", className: "bg-warning/15 text-warning border-warning/30" },
  BLOCKED: { label: "Blocked", className: "bg-danger/15 text-danger border-danger/30" },
};

// ✅ Define which roles can perform actions
const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"];

export function UsersPage() {
  const { user } = useAuth();
  
  // ✅ Check if user has permission to perform actions
  const canManageUsers = user && ALLOWED_ROLES.includes(user.role);

  const { data: users, isLoading, isError, error, refetch } = useUsers();
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => (users ?? []).filter((u) => 
      u.username.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase())
    ),
    [users, search]
  );

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.displayName || u.username} size={32} />
          <div className="min-w-0">
            <p className="truncate font-medium">{u.displayName || u.username}</p>
            <p className="truncate text-xs text-text-muted">@{u.username}</p>
          </div>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (u) => <span className="text-text-secondary">{u.email}</span> },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <Badge className="border-white/10 bg-white/5 text-text-secondary">
          <ShieldCheck className="h-3 w-3" /> {ROLE_LABELS[u.role] ?? u.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => {
        const meta = STATUS_META[u.status];
        return <Badge className={meta?.className}>{meta?.label ?? u.status}</Badge>;
      },
    },
    { key: "joined", header: "Joined", render: (u) => <span className="text-text-secondary">{formatDate(u.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (u) => (
        // ✅ Only show actions dropdown if user has permission
        canManageUsers ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-white/10 hover:text-text-primary">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"] as UserStatus[])
                .filter((s) => s !== u.status)
                .map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => updateStatus.mutate({ username: u.username, status: s })}>
                    Mark as {STATUS_META[s].label}
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-danger hover:text-danger"
                onSelect={() => deleteUser.mutate(u.username)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // ✅ For non-admin users, show nothing or a disabled state
          <span className="text-xs text-text-muted">-</span>
        )
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {canManageUsers 
              ? "Manage accounts, roles, and status across the platform." 
              : "View all users on the platform."}
          </p>
        </div>

        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search users…" 
            className="pl-9" 
          />
        </div>

        {isError ? (
          <ErrorState 
            message={error instanceof Error ? error.message : "Failed to load users"} 
            onRetry={() => refetch()} 
          />
        ) : !isLoading && filtered.length === 0 ? (
          <EmptyState 
            icon={<UsersIcon className="h-5 w-5" />} 
            title="No users found" 
            description="Try a different search term." 
          />
        ) : (
          <DataTable 
            columns={columns} 
            data={filtered} 
            rowKey={(u) => u.userId} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}