"use client";

import { motion, type Variants } from "framer-motion";
import { Briefcase, Clock, MapPin, Quote, Radio } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { profile, resolveLocalized } from "@/lib/portfolio";
import { useNow } from "@/lib/clock";
import { SectionHeading } from "./section-heading";
import { ActivityGraph } from "./activity-graph";
import { DiscordIcon, GithubIcon, TelegramIcon } from "./icons";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

/** Owner's wall-clock time — client-only (server clock would differ). */
function LocalTimeChip() {
  const { t } = useI18n();
  const now = useNow();

  const time = now
    ? new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: profile.timezone ?? "UTC",
      }).format(now)
    : null;

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={`${t("bio.localTime")} (UTC+3)`}
    >
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {time ? <span className="tabular-nums">{time}</span> : "—:—"}
    </span>
  );
}

/** BIO: portrait card + story, principles, experience timeline, skill groups. */
export function BioSection() {
  const { t, locale } = useI18n();

  const paragraphs = [
    t("bio.paragraphs.0"),
    t("bio.paragraphs.1"),
  ];
  const principles = [
    t("bio.principles.0"),
    t("bio.principles.1"),
    t("bio.principles.2"),
    t("bio.principles.3"),
  ];

  const socials = [
    { href: profile.socialLinks.github, label: "GitHub", icon: GithubIcon },
    { href: profile.socialLinks.discord, label: "Discord", icon: DiscordIcon },
    { href: profile.socialLinks.telegram, label: "Telegram", icon: TelegramIcon },
  ];

  return (
    <section
      id="bio"
      aria-label={t("bio.title")}
      className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-purple-600/10 blur-[120px] print:hidden dark:bg-purple-700/15"
      />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="bio"
          number="03"
          title={t("bio.title")}
          subtitle={t("bio.subtitle")}
        />

        <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-14">
          {/* portrait card */}
          <motion.aside
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="h-fit lg:sticky lg:top-24"
          >
            <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-[0_20px_50px_-18px_rgba(139,92,246,0.4)]">
              {/* avatar */}
              <div className="relative mx-auto w-fit">
                <div
                  aria-hidden="true"
                  className="absolute -inset-2 rounded-full bg-gradient-to-tr from-violet-600 via-purple-500 to-fuchsia-500 opacity-60 blur-md transition-opacity duration-500 group-hover:opacity-90"
                />
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  loading="lazy"
                  decoding="async"
                  width={160}
                  height={160}
                  className="relative h-40 w-40 rounded-full border-2 border-background object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-1 bottom-1 h-5 w-5 rounded-full border-[3px] border-card bg-emerald-500"
                  title="online"
                />
              </div>

              <h3 className="mt-5 text-center text-xl font-bold tracking-tight">
                {profile.name}
              </h3>
              <p className="text-gradient mt-1 text-center text-sm font-semibold">
                {t("hero.tagline")}
              </p>
              <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  Europe · UTC+3
                </span>
                <span aria-hidden="true" className="text-muted-foreground/40">·</span>
                <LocalTimeChip />
              </p>

              {/* socials — icon-only, hidden on paper (handles live in Contact) */}
              <div className="mt-5 flex items-center justify-center gap-2 border-t border-border/60 pt-5 print:hidden">
                {socials.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-secondary/50 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* story + principles + experience
              min-w-0 lets the grid/flex tracks shrink below content size —
              without it the activity graph's 53-week row (≈820px min-content)
              blows out the whole BIO column on small screens */}
          <div className="flex min-w-0 flex-col gap-10">
            {/* story */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="space-y-4"
            >
              {paragraphs.map((p, i) => (
                <p key={i} className="text-pretty leading-relaxed text-muted-foreground sm:text-lg">
                  {p}
                </p>
              ))}

              {/* principles */}
              <div className="mt-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-primary/80 uppercase">
                  <Quote className="h-4 w-4" aria-hidden="true" />
                  {t("bio.principlesTitle")}
                </h3>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {principles.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm leading-snug transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35"
                    >
                      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* NOW — what I'm currently working on (data/profile.json → now[]) */}
            {profile.now?.length ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 via-card to-card p-5 sm:p-6"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl print:hidden"
                />
                <h3 className="relative flex items-center gap-2.5 text-sm font-semibold tracking-[0.18em] text-primary/80 uppercase">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <Radio className="h-4 w-4" aria-hidden="true" />
                  {t("bio.nowTitle")}
                </h3>
                <ul className="relative mt-4 grid gap-2 sm:grid-cols-2">
                  {profile.now.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-background/50 px-3.5 py-3 text-sm leading-snug backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
                    >
                      {item.emoji ? (
                        <span aria-hidden="true" className="text-base leading-5">
                          {item.emoji}
                        </span>
                      ) : (
                        <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      {resolveLocalized(item.label, locale)}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}

            {/* activity graph (decorative, seeded from data/profile.json) */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="min-w-0"
            >
              <ActivityGraph />
            </motion.div>

            {/* experience timeline */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-primary/80 uppercase">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
                {t("bio.experienceTitle")}
              </h3>
              <ol className="relative mt-6 space-y-8 before:absolute before:top-1 before:bottom-1 before:left-[7px] before:w-px before:bg-gradient-to-b before:from-primary/60 before:via-primary/25 before:to-transparent">
                {profile.experience.map((job, i) => (
                  <li key={i} className="relative pl-8">
                    <span
                      aria-hidden="true"
                      className={`absolute top-1.5 left-0 h-[15px] w-[15px] rounded-full border-[3px] border-background ${
                        i === 0
                          ? "bg-primary shadow-[0_0_12px_rgba(139,92,246,0.9)]"
                          : "bg-primary/40"
                      }`}
                    />
                    <p className="font-mono text-xs font-medium tracking-wide text-primary">
                      {job.period}
                    </p>
                    <h4 className="mt-1 font-semibold tracking-tight">
                      {resolveLocalized(job.role, locale)}
                      <span className="text-muted-foreground">
                        {" "}
                        · {resolveLocalized(job.company, locale)}
                      </span>
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {resolveLocalized(job.description, locale)}
                    </p>
                  </li>
                ))}
              </ol>
            </motion.div>

            {/* skills */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <h3 className="text-sm font-semibold tracking-[0.18em] text-primary/80 uppercase">
                {t("bio.skillsTitle")}
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {profile.skills.map((group) => (
                  <div
                    key={resolveLocalized(group.label, locale)}
                    className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-all duration-300 hover:border-primary/35"
                  >
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {resolveLocalized(group.label, locale)}
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {group.items.map((skill) => (
                        <li
                          key={skill}
                          className="cursor-default rounded-lg border border-transparent bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
