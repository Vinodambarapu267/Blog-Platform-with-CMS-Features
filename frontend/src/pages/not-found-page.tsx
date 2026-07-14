import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export function NotFoundPage() {
  return (
    <div className="bg-ambient flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-8xl font-bold text-gradient"
      >
        404
      </motion.p>
      <h1 className="mt-4 text-2xl font-semibold">This page wandered off</h1>
      <p className="mt-2 max-w-sm text-text-secondary">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Button asChild className="mt-8">
        <Link to={ROUTES.home}>
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </Button>
    </div>
  );
}
