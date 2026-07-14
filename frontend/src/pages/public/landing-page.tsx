import { PublicLayout } from "@/components/layout/public-layout";
import { Hero } from "./sections/hero";
import { StatsBand } from "./sections/stats-band";
import { FeatureGrid } from "./sections/feature-grid";
import { ArchitectureSection } from "./sections/architecture-section";
import { TechStackSection } from "./sections/tech-stack-section";
import {  CtaSection } from "./sections/testimonials-cta";

export function LandingPage() {
  return (
    <PublicLayout>
      <Hero />
      <StatsBand />
      <FeatureGrid />
      <ArchitectureSection />
      <TechStackSection />
      <CtaSection />
    </PublicLayout>
  );
}
