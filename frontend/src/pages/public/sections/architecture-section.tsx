import { motion } from "framer-motion";
import { Globe, ShieldCheck, Users, FileText, FolderTree, MessageSquare, Bell, Radar } from "lucide-react";
import { SectionHeading } from "./feature-grid";

const services = [
  { icon: Globe, name: "Api-Gateway", port: "8089", desc: "Public entry point + auth filter" },
  { icon: ShieldCheck, name: "Auth-service", port: "8081", desc: "Credentials, JWT issuance" },
  { icon: Users, name: "User-Service", port: "8082", desc: "Profiles, roles, status" },
  { icon: FileText, name: "Post-Service", port: "8083", desc: "Posts, publishing, likes" },
  { icon: FolderTree, name: "Categories-&-Tag", port: "8084", desc: "Taxonomy" },
  { icon: MessageSquare, name: "Comment-service", port: "8085", desc: "Threaded comments" },
  { icon: Bell, name: "Notification-service", port: "8088", desc: "Kafka → email" },
  { icon: Radar, name: "Eureka-server", port: "8761", desc: "Service discovery" },
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Architecture"
          title="Eight services. One gateway. Zero guessing."
          description="Every request enters through Api-Gateway, gets authenticated once, and is routed to the service that owns it."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="rounded-2xl glass p-5"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-accent">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-text-muted">
                  :{s.port}
                </span>
              </div>
              <p className="mt-4 font-mono text-sm font-medium text-text-primary">{s.name}</p>
              <p className="mt-1 text-xs text-text-secondary">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
