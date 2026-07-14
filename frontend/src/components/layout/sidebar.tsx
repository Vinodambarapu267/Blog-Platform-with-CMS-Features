import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  MessageSquare,
  Users,
  Settings,
  Sparkles,
  UserCircle,
  ShieldCheck,
} from "lucide-react";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { to: ROUTES.dashboard, icon: LayoutDashboard, label: "Overview", end: true },
  { to: ROUTES.posts, icon: FileText, label: "Posts" },
  { to: ROUTES.categories, icon: FolderTree, label: "Categories" },
  { to: ROUTES.tags, icon: Tags, label: "Tags" },
  { to: ROUTES.comments, icon: MessageSquare, label: "Comments" },
  { to: ROUTES.users, icon: Users, label: "Users" },
];

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

const bottomItems = [
  { to: ROUTES.profile, icon: UserCircle, label: "Profile" },
  { to: ROUTES.settings, icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-canvas-raised/60 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6 font-display text-lg font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        Mallivin Tech<span className="text-gradient">CMS</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-text-muted">Workspace</p>
        {navItems.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}

        {isAdmin && (
          <>
            <p className="px-3 pb-2 pt-4 text-xs font-medium uppercase tracking-wider text-text-muted">Admin</p>
            <SidebarLink to={ROUTES.admin} icon={ShieldCheck} label="Admin Panel" />
          </>
        )}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        {bottomItems.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </div>
    </aside>
  );
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  end,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <div className="relative">
          {isActive && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 ring-1 ring-primary/30"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <div
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </div>
        </div>
      )}
    </NavLink>
  );
}
