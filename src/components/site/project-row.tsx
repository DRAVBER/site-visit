"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import {
  resolveLocalized,
  formatStars,
  type Project,
  type Category,
  type Locale,
} from "@/lib/portfolio";
import { CategoryGlyph } from "./icons";
import { RelativeTime } from "./relative-time";
import { spotlightProps } from "@/hooks/use-spotlight";

/**
 * Compact list row — the space-efficient alternative to the card grid.
 * Uses the "stretched link" pattern: an inset overlay button opens the
 * project dialog, while tag chips sit above it (pointer-events-auto) and
 * keep their own click behavior as one-tap filters.
 */
export function ProjectRow({
  project,
  category,
  locale,
  index,
  metaPending,
  onOpen,
  activeTag,
  onTagClick,
  tagAriaLabel,
  labels,
  updatedPrefix,
}: {
  project: Project;
  category?: Category;
  locale: Locale;
  index: number;
  /** while the live GitHub meta fetch is in flight the meta values pulse */
  metaPending?: boolean;
  onOpen: (project: Project) => void;
  activeTag?: string | null;
  onTagClick?: (tag: string) => void;
  tagAriaLabel?: string;
  labels: {
    featured: string;
    source: string;
    open: string;
    tags?: string;
  };
  updatedPrefix?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const cover = project.screenshots[0];
  const spotlight = spotlightProps<HTMLElement>();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.04, 0.24),
        ease: [0.22, 1, 0.36, 1],
      }}
      data-card=""
      {...spotlight}
      className="card-spotlight group relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:border-primary/45 hover:shadow-[0_14px_40px_-16px_rgba(139,92,246,0.45)] focus-within:border-primary/45 dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]"
    >
      {/* gradient wash on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-primary/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* stretched overlay — opens the dialog, catches all row clicks */}
      <button
        type="button"
        onClick={() => onOpen(project)}
        data-card-trigger=""
        aria-label={`${project.title} — ${labels.open}`}
        className="absolute inset-0 z-0 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />

      <div className="pointer-events-none relative z-10 flex items-center gap-4 p-3 sm:gap-5 sm:p-4">
        {/* thumbnail */}
        <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary print:hidden sm:h-20 sm:w-32">
          {cover && !imageError ? (
            <img
              src={cover}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/25 via-purple-700/15 to-transparent text-lg font-bold text-primary/50">
              {project.title.slice(0, 2).toUpperCase()}
            </span>
          )}
          {project.featured ? (
            <span
              className="absolute top-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground"
              title={labels.featured}
            >
              ★
            </span>
          ) : null}
        </span>

        {/* body */}
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold tracking-tight transition-colors group-hover:text-primary">
              {project.title}
            </span>
            <span
              className={`hidden shrink-0 items-center gap-1 text-[11px] font-medium tabular-nums text-muted-foreground/90 sm:inline-flex ${metaPending ? "meta-pending" : ""}`}
              title={labels.source}
            >
              <Star className="h-3 w-3 text-amber-400" aria-hidden="true" />
              {formatStars(project.stars)}
            </span>
            <span className="hidden shrink-0 items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-flex">
              <CategoryGlyph name={category?.icon} className="h-3 w-3" />
              {category ? resolveLocalized(category.label, locale) : project.category}
            </span>
          </span>

          <span className="line-clamp-1 text-sm text-muted-foreground">
            {resolveLocalized(project.description, locale)}
          </span>

          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {/* tags double as filters — pointer-events-auto lifts them above the stretched button */}
            <span
              className="pointer-events-auto flex flex-wrap gap-1.5"
              aria-label={labels.tags}
            >
              {project.tags.slice(0, 3).map((tag) => {
                const isActive =
                  activeTag?.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(tag);
                    }}
                    aria-pressed={isActive}
                    aria-label={`${tagAriaLabel ?? "Filter by tag"}: ${tag}`}
                    className={`cursor-pointer rounded-md border px-1.5 py-0.5 font-mono transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-transparent bg-secondary text-foreground/75 hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: languageDot(project.language) }}
                aria-hidden="true"
              />
              {project.language}
            </span>
            <span className={`hidden items-center sm:inline-flex ${metaPending ? "meta-pending" : ""}`}>
              <RelativeTime isoDate={project.lastCommit} prefix={updatedPrefix} />
            </span>
          </span>
        </span>

        {/* trailing arrow */}
        <ArrowRight
          className="h-4 w-4 shrink-0 -translate-x-1 text-muted-foreground/50 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
    </motion.article>
  );
}

/** mirrors the grid card language colors */
function languageDot(language: string): string {
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
