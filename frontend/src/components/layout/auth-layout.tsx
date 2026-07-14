import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, Network } from "lucide-react";
import { ROUTES } from "@/constants";

const points = [
  { icon: ShieldCheck, text: "Stateless JWT auth with role-based access across every service" },
  { icon: Network, text: "Eight microservices behind a single Spring Cloud Gateway" },
  { icon: Zap, text: "Kafka-driven events keep users, posts, and comments in sync" },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-ambient grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 p-10 lg:flex">
        <Link to={ROUTES.home} className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          MallvinTech<span className="text-gradient">CMS</span>
        </Link>

        <div className="max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold leading-tight"
          >
            Publish with the reliability of a real event-driven platform.
          </motion.h2>
          <div className="mt-8 space-y-4">
            {points.map((p, i) => (
              <motion.div
                key={p.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg glass text-primary-light">
                  <p.icon className="h-4 w-4" />
                </span>
                <p className="text-sm text-text-secondary">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-xs text-text-muted">© {new Date().getFullYear()} MallvinTech CMS</p>

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Link to={ROUTES.home} className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              MallvinTech<span className="text-gradient">CMS</span>
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
          <p className="mt-1.5 text-sm text-text-secondary">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
