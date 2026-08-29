"use client";

import { projects, categories } from "@/lib/portfolio";
import { SiteHeader } from "./header";
import { Hero } from "./hero";
import { ProjectsSection } from "./projects";
import { BioSection } from "./bio";
import { ContactSection } from "./contact";
import { SiteFooter } from "./footer";
import { ScrollProgress } from "./scroll-progress";
import { BackToTop } from "./back-to-top";

/**
 * Client shell assembling all sections. Portfolio content comes from
 * /data/*.json via the shared lib/portfolio module (single source of truth
 * for both server metadata in page.tsx and client rendering here).
 */
export function PortfolioApp() {
  return (
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
    </div>
  );
}
