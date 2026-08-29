"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Link2,
  Maximize2,
  Star,
  Terminal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import {
  resolveLocalized,
  formatStars,
  type Project,
  type Category,
} from "@/lib/portfolio";
import { CategoryGlyph, GithubIcon } from "./icons";
import { Lightbox } from "./lightbox";

/** compact card shown in the "See also" strip at the bottom of the dialog */
export interface RelatedProject {
  project: Project;
  /** localized category label (or raw category id as fallback) */
  categoryLabel: string;
}

/** Gallery with dots — remounts per project (key) which resets the selection.
 *  Arrow keys ← → move between shots when the gallery is focused.
 *  Clicking the image opens the fullscreen lightbox viewer. */
function Gallery({ shots, altBase, zoomLabel }: { shots: string[]; altBase: string; zoomLabel: string }) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (shots.length === 0) return null;

  const go = (delta: number) =>
    setActive((i) => (i + delta + shots.length) % shots.length);

  return (
    <div
      className="group relative aspect-[16/9] w-full overflow-hidden bg-secondary sm:rounded-t-2xl"
      tabIndex={shots.length > 1 ? 0 : undefined}
      aria-label={shots.length > 1 ? altBase : undefined}
      onKeyDown={(e) => {
        if (shots.length <= 1) return;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label={zoomLabel}
        title={zoomLabel}
        className="group/img relative block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <img
          key={shots[active]}
          src={shots[active]}
          alt={`${altBase} ${active + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {/* zoom hint — appears on hover/focus */}
        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/55 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover/img:opacity-100 group-focus-visible/img:opacity-100 group-hover/img:scale-105"
        >
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>
      <Lightbox
        images={shots}
        index={active}
        onIndexChange={setActive}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        altBase={altBase}
        labels={{
          close: t("lightbox.close"),
          prev: t("lightbox.prev"),
          next: t("lightbox.next"),
        }}
      />
      {shots.length > 1 ? (
        <>
          {/* arrow controls — visible on hover/focus, keyboard via the wrapper */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={`${altBase} — previous`}
            className="absolute top-1/2 left-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white opacity-0 backdrop-blur-md transition-opacity duration-300 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={`${altBase} — next`}
            className="absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white opacity-0 backdrop-blur-md transition-opacity duration-300 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-white/15 bg-black/55 p-1.5 backdrop-blur-md">
            {shots.map((shot, i) => (
              <button
                key={shot}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${altBase} ${i + 1}`}
                aria-current={i === active}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-6 bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                    : "bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * Full project view — opened from a card. Rendered via next/dynamic
 * (code-split) so the initial page payload stays small.
 */
export function ProjectDialog({
  project,
  category,
  open,
  onOpenChange,
  related,
  onSelectRelated,
}: {
  project: Project | null;
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** up to 3 similar projects (same category / shared tags) */
  related?: RelatedProject[];
  /** opens a related project in place — the dialog content swaps */
  onSelectRelated?: (project: Project) => void;
}) {
  const { t, locale } = useI18n();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // when a related project is opened in place, rewind the scrollable
  // dialog body so the new project starts from its gallery
  useEffect(() => {
    if (!open) return;
    document
      .querySelector("[data-slot='dialog-content']")
      ?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [project?.id, open]);

  if (!project) return null;

  const copyRun = async () => {
    if (!project.run) return;
    const ok = await copyToClipboard(project.run);
    if (ok) {
      setCopied(true);
      toast.success(t("toast.commandsCopied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyShareLink = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#p=${project.id}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      setLinkCopied(true);
      toast.success(t("toast.linkCopied"));
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const lastCommit = new Date(project.lastCommit).toLocaleDateString(
    locale === "ru" ? "ru-RU" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92svh] gap-0 overflow-y-auto rounded-2xl border-border/70 bg-card p-0 sm:max-w-4xl"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{project.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {resolveLocalized(project.description, locale)}
        </DialogDescription>

        {/* close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label={t("projectDialog.close")}
          className="absolute top-4 right-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-background/80 text-muted-foreground backdrop-blur transition-all hover:rotate-90 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* gallery (or monogram fallback) */}
        {project.screenshots.length > 0 ? (
          <Gallery
            key={project.id}
            shots={project.screenshots}
            altBase={`${project.title} — ${t("projectDialog.screenshot")}`}
            zoomLabel={t("projectDialog.zoom")}
          />
        ) : (
          <div className="flex aspect-[16/7] w-full items-center justify-center bg-gradient-to-br from-violet-600/30 via-purple-700/20 to-transparent">
            <span className="text-6xl font-bold tracking-tight text-primary/50">
              {project.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* body — min-w-0 kills the grid-item automatic minimum so the
            "how to run" code block scrolls internally instead of blowing
            the dialog out horizontally on narrow screens */}
        <div className="flex min-w-0 flex-col gap-6 p-5 sm:p-8">
          {/* title row */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <CategoryGlyph name={category?.icon} className="h-3.5 w-3.5" />
                {category ? resolveLocalized(category.label, locale) : project.category}
              </span>
              {project.featured ? (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-[0_2px_12px_rgba(139,92,246,0.6)]">
                  ★ {t("projects.featured")}
                </span>
              ) : null}
            </div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {project.title}
            </h3>

            {/* meta */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <b className="font-semibold text-foreground">{formatStars(project.stars)}</b>{" "}
                {t("projects.stars")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {t("projectDialog.lastCommit")}: {lastCommit}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: "#8b5cf6" }}
                  aria-hidden="true"
                />
                {project.language}
              </span>
            </div>
          </div>

          {/* description */}
          <section>
            <h4 className="text-xs font-semibold tracking-[0.18em] text-primary/80 uppercase">
              {t("projectDialog.overview")}
            </h4>
            <p className="mt-2.5 text-pretty leading-relaxed text-muted-foreground">
              {resolveLocalized(project.description, locale)}
            </p>
          </section>

          {/* tech stack */}
          <section>
            <h4 className="text-xs font-semibold tracking-[0.18em] text-primary/80 uppercase">
              {t("projectDialog.tech")}
            </h4>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-lg border border-border/70 bg-secondary/60 px-3 py-1.5 font-mono text-xs text-secondary-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </section>

          {/* how to run */}
          {project.run ? (
            <section>
              <h4 className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-primary/80 uppercase">
                <Terminal className="h-4 w-4" aria-hidden="true" />
                {t("projectDialog.run")}
              </h4>
              <div className="group relative mt-2.5 overflow-hidden rounded-xl border border-border/70 bg-[#0d1117] dark:bg-black/60">
                <pre className="overflow-x-auto p-4 pr-12 font-mono text-[13px] leading-relaxed text-emerald-300/90">
                  {project.run}
                </pre>
                <button
                  type="button"
                  onClick={copyRun}
                  aria-label={t("projectDialog.copyCommands")}
                  className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-gray-400 backdrop-blur transition-all hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </section>
          ) : null}

          {/* actions */}
          <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-6 text-sm font-semibold text-white shadow-[0_8px_28px_-8px_rgba(139,92,246,0.7)] transition-shadow hover:shadow-[0_10px_34px_-6px_rgba(139,92,246,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GithubIcon className="h-4 w-4" aria-hidden="true" />
              {t("projectDialog.openRepo")}
            </motion.a>
            {project.demoUrl ? (
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-semibold transition-all hover:border-primary/50 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                {t("projectDialog.openDemo")}
              </motion.a>
            ) : null}
            {/* copy shareable deep link (#p=<id>) — works with the hash-sync hook */}
            <button
              type="button"
              onClick={copyShareLink}
              aria-label={t("projectDialog.copyLink")}
              title={t("projectDialog.shareLabel")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold transition-all hover:border-primary/50 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {linkCopied ? (
                <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              ) : (
                <Link2 className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {t("projectDialog.copyLink")}
              </span>
            </button>
          </div>

          {/* related projects — same category / shared tags first */}
          {related && related.length > 0 ? (
            <section
              aria-label={t("projectDialog.related")}
              className="border-t border-border/60 pt-5"
            >
              <h4 className="text-xs font-semibold tracking-[0.18em] text-primary/80 uppercase">
                {t("projectDialog.related")}
              </h4>
              <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                {related.map(({ project: rel, categoryLabel }, i) => {
                  const thumb = rel.screenshots[0];
                  return (
                    <motion.li
                      key={rel.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.08 + i * 0.07,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectRelated?.(rel)}
                        aria-label={t("projectDialog.relatedOpen").replace(
                          "{title}",
                          rel.title
                        )}
                        className="group flex w-full items-center gap-3 rounded-xl border border-border/70 bg-secondary/40 p-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/70 hover:shadow-[0_8px_22px_-10px_rgba(139,92,246,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-10 w-14 shrink-0 rounded-lg border border-border/60 object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-14 shrink-0 place-items-center rounded-lg border border-border/60 bg-gradient-to-br from-violet-600/30 to-purple-700/20 text-xs font-bold text-primary/70">
                            {rel.title.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                            {rel.title}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Star
                              className="h-3 w-3 text-amber-400"
                              aria-hidden="true"
                            />
                            {formatStars(rel.stars)} · {categoryLabel}
                          </span>
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectDialog;
