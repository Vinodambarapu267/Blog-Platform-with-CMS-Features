import { motion } from "framer-motion";
import { ShieldCheck, Layers, Bell, Tags, MessagesSquare, Gauge } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Stateless JWT authentication",
    description:
      "Auth-service issues signed tokens with role claims; every downstream service validates and expands role → permission at the method level.",
  },
  {
    icon: Layers,
    title: "Publishing workflow, modeled properly",
    description:
      "Draft, review, publish, archive, delete — post status transitions are enforced server-side, not faked in the UI.",
  },
  {
    icon: Tags,
    title: "Self-organizing taxonomy",
    description:
      "Tags auto-resolve on write and rank themselves by usage. Categories nest into a real parent/child hierarchy.",
  },
  {
    icon: MessagesSquare,
    title: "Threaded, moderated comments",
    description:
      "Parent/child comment threads with a moderation queue — pending, approved, rejected, spam — before anything goes public.",
  },
  {
    icon: Bell,
    title: "Kafka-driven notifications",
    description:
      "User, post, and comment events propagate across services asynchronously, ending in real email delivery.",
  },
  {
    icon: Gauge,
    title: "Rate-limited by design",
    description:
      "Resilience4j guards every write-heavy endpoint so one noisy client can't degrade the platform for everyone else.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Platform"
          title="Everything a real CMS needs, nothing it doesn't"
          description="Built around the actual service boundaries in the backend — not a marketing feature list."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="group rounded-2xl glass p-6 transition-all hover:-translate-y-1 hover:bg-white/[0.08]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary-light ring-1 ring-white/10">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-text-primary">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-primary-light">{eyebrow}</span>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-text-secondary">{description}</p>}
    </div>
  );
}
