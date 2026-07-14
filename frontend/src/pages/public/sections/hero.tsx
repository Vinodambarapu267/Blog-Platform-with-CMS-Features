import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

const events = [
  { topic: "user-registered", detail: "auth-service consumed" },
  { topic: "post-published", detail: "user-service updated profile" },
  { topic: "comment-created", detail: "notification-service queued" },
  { topic: "post-deleted", detail: "comment-service cascaded" },
  { topic: "user-updated", detail: "auth-service synced" },
  { topic: "comment-moderated", detail: "notification-service queued" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-28 sm:pt-28">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-text-secondary"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Eight services, one gateway, zero downtime deploys
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="mt-6 text-4xl font-semibold leading-[1.1] sm:text-6xl"
        >
          Publishing infrastructure for teams who take
          <span className="text-gradient"> content operations </span>
          seriously
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-base text-text-secondary sm:text-lg"
        >
          MallvinTech CMS is a microservices blog platform built on Spring Boot: JWT auth, role-based
          publishing workflows, Kafka-driven notifications, and a CMS that scales each concern —
          posts, taxonomy, comments — independently.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg">
            <Link to={ROUTES.register}>
              Start publishing <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href="#architecture">
              <PlayCircle className="h-4 w-4" /> See the architecture
            </a>
          </Button>
        </motion.div>
      </div>

      {/* Live event ticker — a real product detail, not decoration: this is the Kafka
          event topology from the README, rendered as a moving strip. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl glass"
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 text-xs text-text-muted">
          <span className="h-2 w-2 rounded-full bg-danger/70" />
          <span className="h-2 w-2 rounded-full bg-warning/70" />
          <span className="h-2 w-2 rounded-full bg-success/70" />
          <span className="ml-2 font-mono">kafka://event-bus — live topics</span>
        </div>
        <div className="overflow-hidden py-4">
          <div className="animate-ticker flex w-max gap-3 px-4">
            {[...events, ...events].map((e, i) => (
              <div
                key={i}
                className="flex shrink-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-text-primary">{e.topic}</span>
                <span className="text-text-muted">· {e.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
    </section>
  );
}
