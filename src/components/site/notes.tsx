"use client";

/**
 * Notes — a micro-blog feed, fully data-driven from data/notes.json
 * (the section disappears if the array is empty).
 *
 * - editorial single-column feed: type icon rail + date + text + tags
 * - shows the latest 4 notes, “show everything” expands the rest
 *   (AnimatePresence height animation)
 * - localized dates via Intl.DateTimeFormat, localized type labels
 * - print: every note is stacked compactly so the feed lands in the PDF
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  ExternalLink,
  Lightbulb,
  Link2,
  Rocket,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { notes, resolveLocalized, type Note, type NoteType } from "@/lib/portfolio";
import { SectionHeading } from "./section-heading";

/** notes shown before the “expand” button kicks in */
const COLLAPSED_COUNT = 4;

const TYPE_ICON: Record<NoteType, typeof Lightbulb> = {
  thought: Lightbulb,
  release: Rocket,
  link: Link2,
  milestone: Award,
};

/** icon chip tint per note type — all violet-family, varying intensity */
const TYPE_TINT: Record<NoteType, string> = {
  thought:
    "border-violet-500/25 bg-violet-500/10 text-violet-500 dark:text-violet-300",
  release:
    "border-purple-500/25 bg-purple-500/10 text-purple-500 dark:text-purple-300",
  link: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-500 dark:text-fuchsia-300",
  milestone:
    "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function formatDate(iso: string, locale: "en" | "ru"): string {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function NoteRow({
  note,
  locale,
  index,
  readLabel,
  latestLabel,
}: {
  note: Note;
  locale: "en" | "ru";
  index: number;
  readLabel: string;
  latestLabel: string;
}) {
  const { t } = useI18n();
  const Icon = TYPE_ICON[note.type] ?? Lightbulb;
  const typeLabel = t(`notes.type_${note.type}`);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index, 3) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex gap-4 rounded-2xl px-3 py-6 transition-colors duration-300 hover:bg-secondary/30 sm:gap-6 sm:px-5 print:py-3 print:hover:bg-transparent"
    >
      {/* hairline separator between notes */}
      {index > 0 ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent sm:inset-x-5"
        />
      ) : null}

      {/* type icon rail */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <span
          aria-hidden="true"
          className={`grid h-11 w-11 place-items-center rounded-xl border transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_6px_18px_-6px_rgba(139,92,246,0.55)] ${TYPE_TINT[note.type] ?? TYPE_TINT.thought} print:hidden`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-xs tracking-wide text-muted-foreground/80">
            {formatDate(note.date, locale)}
          </span>
          <span className="text-xs font-semibold tracking-wide text-primary/80 uppercase">
            {typeLabel}
          </span>
          {index === 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              {latestLabel}
            </span>
          ) : null}
        </p>
        <p className="mt-2.5 text-pretty leading-relaxed text-foreground/90 transition-colors duration-300 group-hover:text-foreground sm:text-[1.05rem]">
          {resolveLocalized(note.text, locale)}
        </p>
        {(note.tags?.length || note.url) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 print:hidden">
            {note.url ? (
              <a
                href={note.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={readLabel}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 text-xs font-medium text-primary transition-all duration-300 hover:border-primary/60 hover:bg-primary/20 hover:shadow-[0_4px_14px_-4px_rgba(139,92,246,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                {readLabel}
              </a>
            ) : null}
            {note.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/70 bg-secondary/50 px-2.5 py-0.5 font-mono text-[11px] text-foreground/75"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export function NotesSection() {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);

  if (notes.length === 0) return null;

  const visible = expanded ? notes : notes.slice(0, COLLAPSED_COUNT);
  const hiddenCount = notes.length - COLLAPSED_COUNT;

  return (
    <section
      id="notes"
      aria-label={t("notes.title")}
      className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 right-0 h-[360px] w-[360px] rounded-full bg-fuchsia-500/8 blur-[120px] print:hidden dark:bg-fuchsia-700/10"
      />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="notes"
          number="04"
          title={t("notes.title")}
          subtitle={t("notes.subtitle")}
        />

        <div className="mx-auto max-w-3xl">
          {/* screen feed */}
          <div className="card-ring-glow relative overflow-hidden rounded-3xl border border-border/70 bg-card/70 px-2 py-2 shadow-sm backdrop-blur-sm sm:px-4 print:hidden">
            {visible.map((note, i) => (
              <NoteRow
                key={note.id}
                note={note}
                locale={locale}
                index={i}
                readLabel={t("notes.readMore")}
                latestLabel={t("notes.latest")}
              />
            ))}

            {hiddenCount > 0 ? (
              <div className="flex justify-center border-t border-border/60 py-5">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 text-sm font-semibold text-primary transition-all duration-300 hover:border-primary/60 hover:bg-primary/20 hover:shadow-[0_6px_20px_-6px_rgba(139,92,246,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {expanded ? t("notes.collapse") : t("notes.expand").replace("{count}", String(hiddenCount))}
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    ↓
                  </motion.span>
                </button>
              </div>
            ) : null}
          </div>

          {/* print fallback: compact stacked list */}
          <div className="hidden flex-col gap-3 print:flex">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-xl border border-border p-4 text-sm"
              >
                <p className="text-xs text-muted-foreground">
                  {formatDate(note.date, locale)} · {t(`notes.type_${note.type}`)}
                </p>
                <p className="mt-1 leading-relaxed">
                  {resolveLocalized(note.text, locale)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
