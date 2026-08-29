"use client";

/**
 * Notes — a micro-blog feed, fully data-driven from data/notes.json
 * (the section disappears if the array is empty).
 *
 * - editorial single-column feed: type icon rail + date + text + tags
 * - type filter chips (All + every type present in the data) narrow the feed;
 *   the count is announced politely to screen readers
 * - shows the latest 4 notes, “show everything” expands the rest
 *   (AnimatePresence height animation)
 * - per-note share button copies `#n=<id>` deep links; opening such a URL
 *   (or picking the note in the ⌘K palette) scrolls to the note, resets the
 *   filter / expand state if it hides the target and flashes a violet glow
 * - localized dates via Intl.DateTimeFormat, localized type labels
 * - print: every note is stacked compactly so the feed lands in the PDF
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Award,
  ExternalLink,
  Lightbulb,
  Link2,
  Rocket,
  Rss,
  Share2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { copyToClipboard } from "@/lib/clipboard";
import { notes, resolveLocalized, type Note, type NoteType } from "@/lib/portfolio";
import { SectionHeading } from "./section-heading";

/** notes shown before the “expand” button kicks in */
const COLLAPSED_COUNT = 4;

/** how long the deep-link highlight glow stays on (ms) */
const HIGHLIGHT_MS = 2600;

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
  shareLabel,
  highlighted,
  onShare,
}: {
  note: Note;
  locale: "en" | "ru";
  index: number;
  readLabel: string;
  latestLabel: string;
  shareLabel: string;
  highlighted: boolean;
  onShare: (note: Note) => void;
}) {
  const { t } = useI18n();
  const Icon = TYPE_ICON[note.type] ?? Lightbulb;
  const typeLabel = t(`notes.type_${note.type}`);

  return (
    <motion.article
      id={`n-${note.id}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index, 3) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative flex scroll-mt-32 gap-4 rounded-2xl px-3 py-6 transition-colors duration-300 hover:bg-secondary/30 focus-within:bg-secondary/20 sm:gap-6 sm:px-5 print:py-3 print:hover:bg-transparent ${
        highlighted ? "note-highlight" : ""
      }`}
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
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
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
          {/* per-note deep link — copies #n=<id>, revealed on hover (always
              reachable on touch: visible, just quiet) */}
          <button
            type="button"
            onClick={() => onShare(note)}
            aria-label={shareLabel}
            title={shareLabel}
            className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary/40 text-muted-foreground/70 opacity-100 transition-all duration-300 hover:border-primary/50 hover:text-primary hover:shadow-[0_4px_12px_-4px_rgba(139,92,246,0.5)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 print:hidden"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
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
  const [filter, setFilter] = useState<NoteType | "all">("all");
  /** note id currently glowing because of a `#n=<id>` deep link */
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimer = useRef<number | null>(null);

  /** types actually present in the data — chips are fully data-driven */
  const availableTypes = useMemo(
    () =>
      Array.from(
        new Set(notes.map((n) => n.type))
      ).sort(),
    []
  );

  /** per-type counts shown as tiny badges on the chips */
  const typeCounts = useMemo(() => {
    const map = new Map<NoteType, number>();
    for (const n of notes) map.set(n.type, (map.get(n.type) ?? 0) + 1);
    return map;
  }, []);

  const filtered = filter === "all" ? notes : notes.filter((n) => n.type === filter);

  /** switching the filter resets the expand state — the newest 4 of the new
   *  selection are the most useful starting point */
  function applyFilter(next: NoteType | "all") {
    setFilter(next);
    setExpanded(false);
  }

  /** copy `#n=<id>` deep link and reflect it in the address bar */
  async function shareNote(note: Note) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#n=${note.id}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      /* replaceState (not location.hash) — no navigation, no hashchange loop */
      window.history.replaceState(null, "", `#n=${note.id}`);
      toast.success(t("toast.noteLinkCopied"));
    }
  }

  /**
   * React to `#n=<id>` deep links (initial load, back/forward, palette jumps).
   * If the active filter or the collapsed feed would hide the target note,
   * both are reset first; then the note is scrolled into view and glows.
   * All setters are unconditional — React bails out when the value is
   * unchanged, so the handler needs no reactive deps (stable subscription).
   */
  useEffect(() => {
    const jump = (hash: string) => {
      const match = /^#n=([\w-]+)$/.exec(hash);
      if (!match) return;
      const id = match[1];
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      setFilter("all");
      setExpanded(true);
      requestAnimationFrame(() => {
        document
          .getElementById(`n-${id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      setHighlightedId(id);
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
      highlightTimer.current = window.setTimeout(
        () => setHighlightedId(null),
        HIGHLIGHT_MS
      );
    };

    /* rAF-wrapped so no state is set synchronously inside the effect body */
    const raf = requestAnimationFrame(() => jump(window.location.hash));
    const onHashChange = () => jump(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", onHashChange);
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    };
  }, []);

  if (notes.length === 0) return null;

  const visible = expanded ? filtered : filtered.slice(0, COLLAPSED_COUNT);
  const hiddenCount = filtered.length - COLLAPSED_COUNT;

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
          {/* type filter chips + notes RSS — data-driven, only types present */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div
              role="group"
              aria-label={t("notes.filterLabel")}
              className="flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                onClick={() => applyFilter("all")}
                aria-pressed={filter === "all"}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  filter === "all"
                    ? "border-primary/50 bg-primary/15 text-primary shadow-[0_4px_14px_-6px_rgba(139,92,246,0.5)]"
                    : "border-border/70 bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {t("notes.filterAll")}
                <span className="font-mono text-[10px] opacity-70 tabular-nums">
                  {notes.length}
                </span>
              </button>
              {availableTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => applyFilter(type)}
                  aria-pressed={filter === type}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    filter === type
                      ? "border-primary/50 bg-primary/15 text-primary shadow-[0_4px_14px_-6px_rgba(139,92,246,0.5)]"
                      : "border-border/70 bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {t(`notes.type_${type}`)}
                  <span className="font-mono text-[10px] opacity-70 tabular-nums">
                    {typeCounts.get(type) ?? 0}
                  </span>
                </button>
              ))}
            </div>

            {/* notes feed subscription — small, quiet, in the section itself */}
            <a
              href="/notes.xml"
              aria-label={t("footer.rssNotes")}
              title={t("footer.rssNotes")}
              className="group inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-secondary/40 px-3 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Rss
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12"
                aria-hidden="true"
              />
              RSS
            </a>
          </div>

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
                shareLabel={t("notes.shareNote")}
                highlighted={highlightedId === note.id}
                onShare={shareNote}
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

            {/* live count for screen readers — mirrors the filter state */}
            <p aria-live="polite" className="sr-only">
              {t("notes.filteredCount").replace("{count}", String(filtered.length))}
            </p>
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
