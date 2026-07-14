import { motion } from "framer-motion";
import { SectionHeading } from "./feature-grid";

const stack = [
  "React 19", "TypeScript", "Vite", "React Router v7", "Tailwind CSS v4",
  "Framer Motion", "shadcn/ui", "TanStack Query", "React Hook Form", "Zod",
  "Axios", "Recharts", "Spring Boot 3.5", "Spring Cloud Gateway", "Eureka",
  "Apache Kafka", "Redis", "MySQL 8",
];

export function TechStackSection() {
  return (
    <section id="stack" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Stack"
          title="Built on tools your team already trusts"
          description="A React front end talking to a Spring Boot microservices backend — no exotic dependencies to onboard."
        />

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {stack.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="rounded-full glass px-4 py-2 font-mono text-xs text-text-secondary"
            >
              {t}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
