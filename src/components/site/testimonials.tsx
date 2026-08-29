"use client";

/**
 * Testimonials — auto-rotating quote carousel, fully data-driven from
 * data/testimonials.json (the section disappears if the array is empty).
 *
 * - auto-advance every 7s, paused on hover / focus / reduced-motion
 * - prev/next buttons + dot indicators (all keyboard accessible)
 * - one slide in the DOM at a time (AnimatePresence mode="wait")
 * - print: the carousel is replaced by a compact stacked list so every
 *   quote lands in the PDF resume
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { resolveLocalized, testimonials, type Testimonial } from "@/lib/portfolio";
import { SectionHeading } from "./section-heading";

const AUTO_ADVANCE_MS = 7000;

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <p
      className="flex items-center gap-1"
      aria-label={label}
      title={label}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-3.5 w-3.5 ${
            i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </p>
  );
}

/** monogram avatar with the brand gradient ring */
function Monogram({ initials }: { initials: string }) {
  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full">
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 via-purple-500 to-fuchsia-500 opacity-70"
      />
      <span className="relative grid h-full w-full place-items-center rounded-full border-2 border-background bg-card text-sm font-bold tracking-wide text-foreground">
        {initials}
      </span>
    </span>
  );
}

function Slide({
  item,
  locale,
  ratingLabel,
  projectLabel,
}: {
  item: Testimonial;
  locale: "en" | "ru";
  ratingLabel: string;
  projectLabel: string;
}) {
  const rating = item.rating ?? 5;
  return (
    <motion.figure
      key={item.id}
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-[240px] flex-col items-center gap-5 px-2 text-center sm:min-h-[220px] sm:px-8"
    >
      <Quote
        aria-hidden="true"
        className="h-8 w-8 rotate-180 text-primary/35"
      />
      <blockquote className="max-w-2xl text-pretty leading-relaxed text-muted-foreground sm:text-lg">
        “{resolveLocalized(item.quote, locale)}”
      </blockquote>
      <figcaption className="mt-auto flex flex-col items-center gap-3">
        <Stars rating={rating} label={ratingLabel.replace("{rating}", String(rating))} />
        <div className="flex items-center gap-3">
          <Monogram initials={item.initials} />
          <span className="text-left">
            <span className="block text-sm font-semibold tracking-tight">
              {item.author}
            </span>
            <span className="block text-xs text-muted-foreground">
              {resolveLocalized(item.role, locale)} · {item.company}
            </span>
            {item.project ? (
              <span className="mt-1 inline-block rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-primary">
                {projectLabel}: {item.project}
              </span>
            ) : null}
          </span>
        </div>
      </figcaption>
    </motion.figure>
  );
}

export function TestimonialsSection() {
  const { t, locale } = useI18n();
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = testimonials.length;
  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  /* auto-rotate unless hovered/focused, reduced motion or only one slide */
  useEffect(() => {
    if (paused || reducedMotion || count <= 1) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reducedMotion, count]);

  if (count === 0) return null;
  const item = testimonials[index];

  return (
    <section
      id="testimonials"
      aria-label={t("testimonials.title")}
      aria-roledescription="carousel"
      className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[380px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/8 blur-[130px] print:hidden dark:bg-violet-700/12"
      />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="testimonials"
          number="04"
          title={t("testimonials.title")}
          subtitle={t("testimonials.subtitle")}
        />

        {/* screen carousel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-3xl print:hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="card-ring-glow relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 px-6 py-10 shadow-sm backdrop-blur-sm sm:px-12">
            <AnimatePresence mode="wait" initial={false}>
              <Slide
                key={item.id}
                item={item}
                locale={locale}
                ratingLabel={t("testimonials.ratingLabel")}
                projectLabel={t("testimonials.projectLabel")}
              />
            </AnimatePresence>
          </div>

          {/* prev / next */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={t("testimonials.prev")}
              className="grid h-11 w-11 place-items-center rounded-full border border-border/70 bg-secondary/40 text-muted-foreground transition-all duration-300 hover:-translate-x-0.5 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* dots — generous 24px hit area, the visual pill lives inside */}
            <div
              role="tablist"
              aria-label={t("testimonials.autoRotate")}
              className="flex items-center gap-1"
            >
              {testimonials.map((it, i) => (
                <button
                  key={it.id}
                  role="tab"
                  type="button"
                  aria-selected={i === index}
                  aria-label={t("testimonials.goTo").replace("{index}", String(i + 1))}
                  onClick={() => go(i)}
                  className="grid h-6 w-6 place-items-center rounded-full transition-colors duration-300 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      i === index
                        ? "w-5 bg-primary shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                        : "w-2 bg-muted-foreground/50 hover:bg-muted-foreground/80"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={t("testimonials.next")}
              className="grid h-11 w-11 place-items-center rounded-full border border-border/70 bg-secondary/40 text-muted-foreground transition-all duration-300 hover:translate-x-0.5 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        {/* print fallback: every quote, stacked compactly */}
        <div className="hidden gap-4 print:grid print:grid-cols-2">
          {testimonials.map((it) => (
            <figure
              key={it.id}
              className="rounded-xl border border-border p-4 text-sm"
            >
              <blockquote className="leading-relaxed">
                “{resolveLocalized(it.quote, locale)}”
              </blockquote>
              <figcaption className="mt-2 text-xs text-muted-foreground">
                {it.author} · {resolveLocalized(it.role, locale)}, {it.company}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
