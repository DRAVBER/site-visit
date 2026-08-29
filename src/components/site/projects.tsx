"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen, SearchX } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { resolveLocalized, type Project } from "@/lib/portfolio";
import { SectionHeading } from "./section-heading";
import { ProjectCard, CategoryTabs } from "./project-card";
import { ProjectSearch } from "./project-search";

/** heavy dialog is code-split to keep first paint fast */
const ProjectDialog = dynamic(
  () => import("./project-dialog").then((m) => m.ProjectDialog),
  { ssr: false }
);

/**
 * Projects section — grid + category filter tabs.
 * Categories come from data/categories.json (rendered by CategoryTabs),
 * so adding an entry there automatically adds a tab here.
 */
export function ProjectsSection({
  projects,
  categories,
}: {
  projects: Project[];
  categories: import("@/lib/portfolio").Category[];
}) {
  const { t, locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [liveMeta, setLiveMeta] = useState<
    Record<string, { stars?: number; lastCommit?: string }>
  >({});

  /** try to enrich cards with live GitHub data (silently falls back) */
  useEffect(() => {
    let cancelled = false;
    fetch("/api/github?ids=" + projects.map((p) => p.id).join(","))
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Record<string, { stars?: number; lastCommit?: string }> | null) => {
        if (!cancelled && data) setLiveMeta(data);
      })
      .catch(() => {
        /* offline / rate-limited — local fallback data stays */
      });
    return () => {
      cancelled = true;
    };
  }, [projects]);

  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  /** featured first, then by stars */
  const sorted = useMemo(
    () =>
      [...projects].sort((a, b) => {
        if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
        return b.stars - a.stars;
      }),
    [projects]
  );

  /** category filter + full-text search (title / description / tags) */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (!q) return true;
      const haystack = [
        p.title,
        resolveLocalized(p.description, locale),
        p.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [sorted, activeCategory, query, locale]);

  const counts = (id: string | null) =>
    id ? projects.filter((p) => p.category === id).length : projects.length;

  const openProject = (project: Project) => {
    setSelected(project);
    setDialogOpen(true);
  };

  /** merge live GitHub meta over local fallback values */
  const withMeta = (p: Project): Project => {
    const meta = liveMeta[p.id];
    if (!meta) return p;
    return {
      ...p,
      stars: meta.stars ?? p.stars,
      lastCommit: meta.lastCommit ?? p.lastCommit,
    };
  };

  return (
    <section
      id="projects"
      aria-label={t("projects.title")}
      className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      {/* faint background wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 -left-40 h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[120px] dark:bg-violet-700/15"
      />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="projects"
          title={t("projects.title")}
          subtitle={t("projects.subtitle")}
        />

        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
          allLabel={t("projects.all")}
          locale={locale}
          counts={counts}
        />

        <ProjectSearch
          value={query}
          onChange={setQuery}
          placeholder={t("projects.searchPlaceholder")}
          clearLabel={t("projects.searchClear")}
          resultCount={visible.length}
          resultLabel={t("projects.resultsFound")}
        />

        {visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-border/80 p-12 text-center text-muted-foreground"
          >
            {query.trim() ? (
              <>
                <SearchX className="h-10 w-10 text-primary/50" aria-hidden="true" />
                <p>
                  {t("projects.noResults")} «{query.trim()}»
                </p>
                <p className="text-sm">{t("projects.noResultsHint")}</p>
              </>
            ) : (
              <>
                <FolderOpen className="h-10 w-10 text-primary/50" aria-hidden="true" />
                <p>{t("projects.empty")}</p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={withMeta(project)}
                  category={categoriesById.get(project.category)}
                  locale={locale}
                  index={i}
                  onOpen={openProject}
                  labels={{
                    featured: t("projects.featured"),
                    stars: t("projects.stars"),
                    updated: t("projects.updated"),
                    demo: t("projects.details"),
                    source: t("projects.source"),
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ProjectDialog
        project={selected}
        category={selected ? categoriesById.get(selected.category) : undefined}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}
