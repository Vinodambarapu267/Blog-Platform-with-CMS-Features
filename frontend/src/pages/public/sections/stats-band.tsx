import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 8, suffix: "", label: "Independent microservices" },
  { value: 6, suffix: "", label: "Role-based permission tiers" },
  { value: 40, suffix: "+", label: "Documented REST endpoints" },
  { value: 99.9, suffix: "%", label: "Gateway uptime target" },
];

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(Number((value * progress).toFixed(value % 1 !== 0 ? 1 : 0)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function StatsBand() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-2xl glass p-6 text-center"
          >
            <p className="font-display text-3xl font-semibold text-gradient sm:text-4xl">
              <CountUp value={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-xs text-text-secondary sm:text-sm">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
