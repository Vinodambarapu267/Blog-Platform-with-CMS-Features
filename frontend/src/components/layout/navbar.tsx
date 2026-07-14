import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { useAuth } from "@/contexts/auth-context";

const links = [
  { label: "Features", href: "#features" },
  { label: "Architecture", href: "#architecture" },
  { label: "Stack", href: "#stack" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40">
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl glass px-4 py-3 sm:px-6"
      >
        <Link to={ROUTES.home} className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          Mallivin Tech<span className="text-gradient">CMS</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link to={ROUTES.dashboard}>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to={ROUTES.login}>Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to={ROUTES.register}>Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </motion.div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mx-4 mt-2 rounded-2xl glass p-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-text-secondary" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <Button asChild variant="ghost" size="sm" className="flex-1">
                <Link to={ROUTES.login}>Sign in</Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link to={ROUTES.register}>Get started</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}

function NavLinkItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => (isActive ? "text-text-primary" : "text-text-secondary")}>
      {label}
    </NavLink>
  );
}
export { NavLinkItem };
