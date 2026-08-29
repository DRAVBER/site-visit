"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen, LayoutGrid, ListIcon, SearchX, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { resolveLocalized, type Project } from "@/lib/portfolio";
import { useUiStore } from "@/lib/ui-store";
import { SectionHeading } from "./section-heading";
import { ProjectCard, CategoryTabs } from "./project-card";
import { ProjectRow } from "./project-row";
import { ProjectSearch } from "./project-search";
import { SortSelect, type SortMode } from "./sort-select";
import { useProjectHashSync } from "@/hooks/use-project-hash-sync";

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
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [liveMeta, setLiveMeta] = useState<
    Record<string, { stars?: number; lastCommit?: string }>
  >({});

  /** grid/list lives in the shared ui-store (persisted, hydration-safe) */
  const view = useUiStore((s) => s.viewMode);
  const setView = useUiStore((s) => s.setViewMode);
  useEffect(() => {
    useUiStore.getState().hydrateViewMode();
  }, []);

  /** dialog state lives in the shared ui-store so the ⌘K palette can open
   *  any project from anywhere (no prop drilling / effect syncing) */
  const selected = useUiStore((s) => s.selectedProject);
  const dialogOpen = useUiStore((s) => s.dialogOpen);
  const openProject = useUiStore((s) => s.openProject);
  const closeDialog = useUiStore((s) => s.closeDialog);

  /** two-way sync: `#p=<id>` deep-links straight into the project dialog */
  useProjectHashSync(projects);

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

  /** ordering follows the sort select — featured first by default */
  const sorted = useMemo(() => {
    const bySort = (a: Project, b: Project) => {
      switch (sortMode) {
        case "stars":
          return b.stars - a.stars;
        case "name":
          return a.title.localeCompare(b.title);
        case "updated":
          return (
            new Date(b.lastCommit).getTime() - new Date(a.lastCommit).getTime()
          );
        default:
          if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
          return b.stars - a.stars;
      }
    };
    return [...projects].sort(bySort);
  }, [projects, sortMode]);

  /** category filter + featured toggle + full-text search (title / description / tags) */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (featuredOnly && !p.featured) return false;
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
  }, [sorted, activeCategory, query, locale, featuredOnly]);

  const counts = (id: string | null) =>
    id ? projects.filter((p) => p.category === id).length : projects.length;

  /** clicking a tag chip on a card fills the search box with that tag */
  const filterByTag = (tag: string) => {
    setQuery((q) => (q.trim() === tag ? "" : tag));
    /* bring the search box into view on small screens */
    if (window.innerWidth < 640) {
      document
        .querySelector("#projects input[type=search]")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
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

  /** roving arrow-key navigation across card/list triggers — the column
   *  count is read from the live computed grid so 1/2/3/4-col layouts all
   *  behave. Keys are only handled while focus is already inside the grid,
   *  so typing in the search box is never hijacked. */
  const onGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const keys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];
      if (!keys.includes(e.key)) return;

      const container = e.currentTarget;
      const triggers = Array.from(
        container.querySelectorAll<HTMLElement>("[data-card-trigger]")
      );
      if (triggers.length === 0) return;

      const activeEl = document.activeElement as HTMLElement | null;
      const currentIndex = triggers.findIndex(
        (el) => el === activeEl || el.contains(activeEl)
      );
      if (currentIndex === -1) return;

      let target = currentIndex;
      if (e.key === "Home") target = 0;
      else if (e.key === "End") target = triggers.length - 1;
      else {
        const cols = view === "grid" ? (() => {
          try {
            return (
              getComputedStyle(container)
                .gridTemplateColumns.split(" ")
                .filter(Boolean).length || 1
            );
          } catch {
            return 1;
          }
        })() : 1;
        const delta =
          e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" ? cols : -cols;
        target = Math.min(Math.max(currentIndex + delta, 0), triggers.length - 1);
      }

      if (target !== currentIndex) {
        e.preventDefault();
        triggers[target].focus();
      }
    },
    [view]
  );

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
        className="pointer-events-none absolute top-40 -left-40 h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[120px] print:hidden dark:bg-violet-700/15"
      />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="projects"
          number="02"
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

        <div className="mb-8 flex flex-col items-center justify-center gap-3 print:hidden sm:mb-10 sm:flex-row sm:gap-4">
          <ProjectSearch
            value={query}
            onChange={setQuery}
            placeholder={t("projects.searchPlaceholder")}
            clearLabel={t("projects.searchClear")}
            resultCount={visible.length}
            resultLabel={t("projects.resultsFound")}
          />
          <div className="flex items-center gap-3">
            {/* featured-only quick filter */}
            <button
              type="button"
              onClick={() => setFeaturedOnly((v) => !v)}
              aria-pressed={featuredOnly}
              className={`flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                featuredOnly
                  ? "border-primary/60 bg-primary/15 text-primary shadow-[0_2px_14px_-2px_rgba(139,92,246,0.5)]"
                  : "border-border/70 bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Star
                aria-hidden="true"
                className={`h-3.5 w-3.5 transition-transform duration-300 ${
                  featuredOnly ? "scale-110 fill-primary" : ""
                }`}
              />
              <span className="hidden sm:inline">{t("projects.featuredOnly")}</span>
              <span className="sm:hidden" aria-hidden="true">{t("projects.featured")}</span>
            </button>
            <SortSelect
              value={sortMode}
              onChange={setSortMode}
              label={t("projects.sortLabel")}
              options={[
                { value: "featured", label: t("projects.sortFeatured") },
                { value: "stars", label: t("projects.sortStars") },
                { value: "name", label: t("projects.sortName") },
                { value: "updated", label: t("projects.sortUpdated") },
              ]}
            />
            {/* grid / list view toggle */}
            <div
              role="group"
              aria-label={t("projects.viewMode")}
              className="flex h-10 items-center gap-0.5 rounded-full border border-border/70 bg-secondary/40 p-1"
            >
              {(
                [
                  { mode: "grid" as const, icon: LayoutGrid, label: t("projects.viewGrid") },
                  { mode: "list" as const, icon: ListIcon, label: t("projects.viewList") },
                ]
              ).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  aria-pressed={view === mode}
                  aria-label={label}
                  title={label}
                  className={`grid h-8 w-8 place-items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    view === mode
                      ? "bg-primary text-primary-foreground shadow-[0_2px_14px_-2px_rgba(139,92,246,0.6)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>

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
        ) : view === "grid" ? (
          <motion.div
            layout
            onKeyDown={onGridKeyDown}
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
                  activeTag={query.trim() || null}
                  onTagClick={filterByTag}
                  tagAriaLabel={t("projects.filterByTag")}
                  updatedPrefix={t("projects.updatedAgoPrefix")}
                  labels={{
                    featured: t("projects.featured"),
                    stars: t("projects.stars"),
                    updated: t("projects.updated"),
                    demo: t("projects.details"),
                    source: t("projects.source"),
                    tags: t("projects.tagsLabel"),
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            layout
            onKeyDown={onGridKeyDown}
            className="flex flex-col gap-3"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((project, i) => (
                <ProjectRow
                  key={project.id}
                  project={withMeta(project)}
                  category={categoriesById.get(project.category)}
                  locale={locale}
                  index={i}
                  onOpen={openProject}
                  activeTag={query.trim() || null}
                  onTagClick={filterByTag}
                  tagAriaLabel={t("projects.filterByTag")}
                  updatedPrefix={t("projects.updatedAgoPrefix")}
                  labels={{
                    featured: t("projects.featured"),
                    source: t("projects.stars"),
                    open: t("projects.listOpen"),
                    tags: t("projects.tagsLabel"),
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
        onOpenChange={(open) => (open ? undefined : closeDialog())}
      />
    </section>
  );
}
