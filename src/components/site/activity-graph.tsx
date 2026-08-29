"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { profile } from "@/lib/portfolio";
import { useMounted } from "@/hooks/use-mounted";

/** Deterministic PRNG (mulberry32) — same seed → same graph on every visit. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WEEKS = 53;
const LEVEL_STYLES = [
  "bg-muted/80 dark:bg-white/[0.06]",
  "bg-primary/25 dark:bg-primary/30",
  "bg-primary/45 dark:bg-primary/50",
  "bg-primary/70 dark:bg-primary/75",
  "bg-primary shadow-[0_0_6px_rgba(139,92,246,0.55)]",
] as const;

interface DayCell {
  /** 0..4 intensity, -1 = future placeholder (invisible) */
  level: number;
  date: Date | null;
  count: number;
}

/**
 * Decorative GitHub-style contribution graph.
 *
 * Data is generated client-side from a seed in data/profile.json
 * (`activity.seed` — change it to reshuffle), gated behind a mount check
 * because the calendar is anchored to "today" and must not be SSR'd
 * (server/client dates would diverge → hydration mismatch).
 */
export function ActivityGraph() {
  const { t, locale } = useI18n();
  const mounted = useMounted();

  /** weeks[weekIndex][dayIndex 0=Sun..6=Sat] */
  const weeks = useMemo<DayCell[][]>(() => {
    const rand = mulberry32(profile.activity?.seed ?? 42);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // sunday of the current week, then walk back 52 weeks
    const thisSunday = new Date(today);
    thisSunday.setDate(today.getDate() - today.getDay());
    const start = new Date(thisSunday);
    start.setDate(thisSunday.getDate() - (WEEKS - 1) * 7);

    const cells: DayCell[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      const week: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        if (date > today) {
          week.push({ level: -1, date, count: 0 });
          continue;
        }
        // weekday activity is heavier than weekends
        const isWeekend = d === 0 || d === 6;
        const base = isWeekend ? 0.34 : 0.78;
        const r = rand();
        let level = 0;
        if (r < base * 0.28) level = 4;
        else if (r < base * 0.58) level = 3;
        else if (r < base * 0.85) level = 2;
        else if (r < base) level = 1;
        const count = level === 0 ? 0 : level * 2 + Math.floor(rand() * 3);
        week.push({ level, date, count });
      }
      cells.push(week);
    }
    return cells;
  }, []);

  const total = useMemo(
    () => weeks.flat().reduce((sum, c) => sum + c.count, 0),
    [weeks]
  );

  /** short month label above the first week that crosses into a new month */
  const monthLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
      month: "short",
    });
    const labels: { week: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const first = weeks[w][1]; // Monday of that week
      if (!first.date) continue;
      if (first.date.getDate() <= 7 && first.date.getMonth() !== lastMonth) {
        lastMonth = first.date.getMonth();
        labels.push({ week: w, label: fmt.format(first.date) });
      }
    }
    return labels;
  }, [weeks, locale]);

  const numberFmt = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US");
  const dateFmt = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const summary = `${numberFmt.format(total)} ${t("bio.activitySummary")}`;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-all duration-300 hover:border-primary/35 print:hidden sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-[0.18em] text-primary/80 uppercase">
          {t("bio.activityTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground tabular-nums">
            {numberFmt.format(mounted ? total : 0)}
          </span>{" "}
          {t("bio.activitySummary")}
        </p>
      </div>

      <p className="sr-only" role="img" aria-label={summary}>
        {summary}
      </p>

      <div
        className="relative mt-4"
        aria-hidden="true"
      >
        <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          <div className="min-w-[640px]">
            {/* month labels */}
            <div className="relative mb-1.5 ml-8 h-4 text-[11px] text-muted-foreground">
              {mounted &&
                monthLabels.map(({ week, label }) => (
                  <span
                    key={week}
                    className="absolute whitespace-nowrap"
                    style={{ left: `calc(${week} * (0.75rem + 3px))` }}
                  >
                    {label}
                  </span>
                ))}
            </div>

            <div className="flex gap-[3px]">
              {/* weekday initials (Mon/Wed/Fri) */}
              <div className="mr-1 flex w-6 flex-col gap-[3px] text-[10px] leading-3 text-muted-foreground/70">
                <span className="h-3" />
                <span className="h-3 text-right">{locale === "ru" ? "П" : "M"}</span>
                <span className="h-3" />
                <span className="h-3 text-right">{locale === "ru" ? "С" : "W"}</span>
                <span className="h-3" />
                <span className="h-3 text-right">{locale === "ru" ? "П" : "F"}</span>
                <span className="h-3" />
              </div>

              {/* weeks */}
              {weeks.map((week, wi) => (
                <motion.div
                  key={wi}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(wi * 0.012, 0.45),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex flex-col gap-[3px]"
                >
                  {week.map((cell, di) => (
                    <span
                      key={di}
                      title={
                        cell.date && mounted
                          ? `${cell.count} ${t("bio.activityContributions")} · ${dateFmt.format(cell.date)}`
                          : undefined
                      }
                      className={`h-3 w-3 rounded-[3px] transition-transform duration-150 hover:scale-125 ${
                        cell.level < 0
                          ? "bg-transparent"
                          : mounted
                            ? LEVEL_STYLES[cell.level]
                            : LEVEL_STYLES[0]
                      }`}
                    />
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* right-edge fade hinting at horizontal scroll on narrow screens */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent sm:hidden" />
      </div>

      {/* legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        {t("bio.activityLess")}
        {LEVEL_STYLES.map((style, i) => (
          <span key={i} className={`h-3 w-3 rounded-[3px] ${mounted ? style : LEVEL_STYLES[0]}`} />
        ))}
        {t("bio.activityMore")}
      </div>
    </div>
  );
}
