import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, LogOut, Settings, UserCircle, Command } from "lucide-react";
import { Avatar } from "@/components/ui/misc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlays";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/constants";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `${ROUTES.posts}?q=${encodeURIComponent(q)}` : ROUTES.posts);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/10 bg-canvas/70 px-4 backdrop-blur-xl lg:px-8">
      <form onSubmit={handleSearch} className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, users, comments…"
          className="pl-9 pr-16"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-text-muted">
          <Command className="h-3 w-3" /> K
        </span>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-white/5 focus:outline-none">
            <Avatar name={user?.username ?? "User"} size={32} />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-text-primary">{user?.username}</p>
              <p className="text-xs leading-tight text-text-muted">{user?.role}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={ROUTES.profile}>
                <UserCircle className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={ROUTES.settings}>
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => logout()} className="text-danger hover:text-danger">
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}