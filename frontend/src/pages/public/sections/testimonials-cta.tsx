import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export function CtaSection() {
  return (
    <section className="px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl glass-strong p-12 text-center sm:p-16"
      >
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/25 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-secondary/25 blur-[100px]" />

        <h2 className="text-3xl font-semibold sm:text-4xl">Ready to see the dashboard?</h2>
        <p className="mx-auto mt-4 max-w-lg text-text-secondary">
          Spin up an account and walk through post publishing, taxonomy management, and comment
          moderation end to end.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to={ROUTES.register}>
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to={ROUTES.login}>Sign in</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
