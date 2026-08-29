"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  Copy,
  ExternalLink,
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

/** Gallery with dots — remounts per project (key) which resets the selection. */
function Gallery({ shots, altBase }: { shots: string[]; altBase: string }) {
  const [active, setActive] = useState(0);

  if (shots.length === 0) return null;

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary sm:rounded-t-2xl">
      <img
        key={shots[active]}
        src={shots[active]}
        alt={`${altBase} ${active + 1}`}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      {shots.length > 1 ? (
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
}: {
  project: Project | null;
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, locale } = useI18n();
  const [copied, setCopied] = useState(false);

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
          />
        ) : (
          <div className="flex aspect-[16/7] w-full items-center justify-center bg-gradient-to-br from-violet-600/30 via-purple-700/20 to-transparent">
            <span className="text-6xl font-bold tracking-tight text-primary/50">
              {project.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* body */}
        <div className="flex flex-col gap-6 p-5 sm:p-8">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectDialog;
