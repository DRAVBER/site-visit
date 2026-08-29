"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import {
  resolveLocalized,
  formatStars,
  type Project,
  type Category,
  type Locale,
} from "@/lib/portfolio";
import { CategoryGlyph } from "./icons";

/** One project card — image, category chip, meta from GitHub, tags. */
export function ProjectCard({
  project,
  category,
  locale,
  labels,
  index,
  onOpen,
}: {
  project: Project;
  category?: Category;
  locale: Locale;
  labels: {
    featured: string;
    stars: string;
    updated: string;
    demo: string;
    source: string;
  };
  index: number;
  onOpen: (project: Project) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const cover = project.screenshots[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-[0_20px_50px_-16px_rgba(139,92,246,0.4)] focus-within:border-primary/45"
    >
      {/* cover image */}
      <button
        type="button"
        onClick={() => onOpen(project)}
        className="relative block aspect-[16/10] w-full cursor-pointer overflow-hidden bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`${project.title} — ${labels.demo}`}
      >
        {cover && !imageError ? (
          <img
            src={cover}
            alt={`${project.title} screenshot`}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/25 via-purple-700/15 to-transparent">
            <span className="text-4xl font-bold tracking-tight text-primary/50">
              {project.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* hover veil with quick actions */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="translate-y-2 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-gray-900 shadow-lg transition-transform duration-300 group-hover:translate-y-0">
            {labels.demo} →
          </span>
        </div>

        {/* category + featured chips */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <CategoryGlyph name={category?.icon} className="h-3 w-3" />
            {category ? resolveLocalized(category.label, locale) : project.category}
          </span>
          {project.featured ? (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-[0_2px_12px_rgba(139,92,246,0.6)]">
              ★ {labels.featured}
            </span>
          ) : null}
        </div>
      </button>

      {/* body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="text-left text-lg font-semibold tracking-tight transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {project.title}
          </button>
          <span
            className="mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground"
            title={labels.stars}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-amber-400" aria-hidden="true">
              <path d="M12 2l2.9 6.26 6.6.56-5 4.36 1.5 6.45L12 16.9 5.99 19.63l1.5-6.45-5-4.36 6.6-.56L12 2z" />
            </svg>
            {formatStars(project.stars)}
          </span>
        </div>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {resolveLocalized(project.description, locale)}
        </p>

        {/* tags */}
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="tags">
          {project.tags.slice(0, 4).map((tag) => (
            <li
              key={tag}
              className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-secondary-foreground"
            >
              {tag}
            </li>
          ))}
          {project.tags.length > 4 ? (
            <li className="rounded-md px-1 py-0.5 font-mono text-[11px] text-muted-foreground/70">
              +{project.tags.length - 4}
            </li>
          ) : null}
        </ul>

        {/* footer: language + last commit + repo link */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: languageColor(project.language) }}
              aria-hidden="true"
            />
            {project.language}
          </span>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            {labels.source}
          </a>
        </div>
      </div>
    </motion.article>
  );
}

/** GitHub language dot colors (subset of github-linguist). */
function languageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Rust: "#dea584",
    Shell: "#89e051",
    Astro: "#ff5a03",
    SVG: "#ff9900",
    Go: "#00ADD8",
  };
  return colors[language] ?? "#8b5cf6";
}

/** Filter tabs driven entirely by data/categories.json + "All". */
export function CategoryTabs({
  categories,
  active,
  onChange,
  allLabel,
  locale,
  counts,
}: {
  categories: Category[];
  active: string | null;
  onChange: (id: string | null) => void;
  allLabel: string;
  locale: Locale;
  counts: (id: string | null) => number;
}) {
  const tabs: { id: string | null; category?: Category }[] = [
    { id: null },
    ...categories.map((c) => ({ id: c.id, category: c })),
  ];

  return (
    <div
      role="tablist"
      aria-label="Project categories"
      className="mx-auto mb-8 flex max-w-full flex-wrap items-center justify-center gap-2 sm:mb-10"
    >
      {tabs.map(({ id, category }) => {
        const isActive = active === id;
        const label = category ? resolveLocalized(category.label, locale) : allLabel;
        return (
          <button
            key={id ?? "all"}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? "border-primary/60 bg-primary/10 text-primary shadow-[0_4px_20px_-6px_rgba(139,92,246,0.5)]"
                : "border-border/70 bg-secondary/40 text-muted-foreground hover:border-primary/35 hover:text-foreground"
            }`}
          >
            {category ? (
              <CategoryGlyph name={category.icon} className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            )}
            {label}
            <span
              className={`rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                isActive ? "bg-primary/20" : "bg-muted"
              }`}
            >
              {counts(id)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
