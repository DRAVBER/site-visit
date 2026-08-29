"use client";

import { MotionConfig } from "framer-motion";
import { projects, categories } from "@/lib/portfolio";
import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-svh flex-col">
        {/* a11y: keyboard users can jump straight past the fixed header */}
        <a
          href="#projects"
          className="sr-only z-[60] rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t("a11y.skipToContent")}
        </a>

        <SiteHeader />
        <ScrollProgress />

        {/* film-grain overlay — adds depth to flat backgrounds, ~3.5% opacity */}
        <div
          aria-hidden="true"
          className="bg-noise pointer-events-none fixed inset-0 z-[5] opacity-[0.035] print:hidden dark:opacity-[0.05]"
        />

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
