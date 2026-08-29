"use client";

import { MotionConfig } from "framer-motion";
import { projects, categories } from "@/lib/portfolio";
import { SiteHeader } from "./header";
import { Hero } from "./hero";
import { ProjectsSection } from "./projects";
import { BioSection } from "./bio";
import { ContactSection } from "./contact";
import { SiteFooter } from "./footer";
import { ScrollProgress } from "./scroll-progress";
import { BackToTop } from "./back-to-top";
import { CommandPalette } from "./command-palette";

/**
 * Client shell assembling all sections. Portfolio content comes from
 * /data/*.json via the shared lib/portfolio module (single source of truth
 * for both server metadata in page.tsx and client rendering here).
 *
 * MotionConfig wraps the tree so every framer-motion animation
 * automatically respects the user's prefers-reduced-motion setting.
 */
export function PortfolioApp() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <ScrollProgress />
        <main className="flex-1">
          <Hero />
          <ProjectsSection projects={projects} categories={categories} />
          <BioSection />
          <ContactSection />
        </main>
        <SiteFooter />
        <BackToTop />
        <CommandPalette />
      </div>
    </MotionConfig>
  );
}
