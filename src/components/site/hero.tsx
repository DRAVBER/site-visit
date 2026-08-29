"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowDown, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";
import { profile } from "@/lib/portfolio";
import { useMounted } from "@/hooks/use-mounted";
import { DiscordIcon, GithubIcon, TelegramIcon } from "./icons";
import { CountUp } from "./count-up";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Wraps a CTA in a magnetic pull toward the cursor (desktop, motion-ok). */
function Magnetic({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xs = useSpring(x, { stiffness: 200, damping: 14, mass: 0.4 });
  const ys = useSpring(y, { stiffness: 200, damping: 14, mass: 0.4 });
  return (
    <motion.div
      style={{ x: xs, y: ys }}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.25);
        y.set((e.clientY - r.top - r.height / 2) * 0.25);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

/** Time-of-day greeting — swaps the generic “Hi, I'm” for a personal one.
 *  Rendered only after hydration (SSR keeps the static default so the
 *  server and client markup match). */
function useTimeGreeting(): string {
  const { t } = useI18n();
  const mounted = useMounted();
  if (!mounted) return t("hero.greeting");
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return t("hero.greetingMorning");
  if (hour >= 12 && hour < 18) return t("hero.greetingAfternoon");
  if (hour >= 18 && hour < 23) return t("hero.greetingEvening");
  return t("hero.greetingNight");
}

/** Full-viewport hero: aurora orbs + blueprint grid, gradient headline, CTAs, stats. */
export function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const greeting = useTimeGreeting();

  // cursor-following ambient glow (desktop + motion-ok only)
  const glowX = useMotionValue(-300);
  const glowY = useMotionValue(-300);
  const glowXs = useSpring(glowX, { stiffness: 120, damping: 24, mass: 0.5 });
  const glowYs = useSpring(glowY, { stiffness: 120, damping: 24, mass: 0.5 });

  // unused for now, reserved for future parallax orbs
  const heroRef = useRef<HTMLElement>(null);

  const stats = [
    { value: profile.stats.years, suffix: "+", label: t("hero.stats.years"), format: "plain" as const },
    { value: profile.stats.projects, suffix: "+", label: t("hero.stats.projects"), format: "plain" as const },
    { value: profile.stats.openSource, suffix: "", label: t("hero.stats.openSource"), format: "plain" as const },
    { value: profile.stats.stars, suffix: "", label: t("hero.stats.stars"), format: "compact" as const },
  ];

  const socials = [
    { href: profile.socialLinks.github, label: "GitHub", icon: GithubIcon },
    { href: profile.socialLinks.discord, label: "Discord", icon: DiscordIcon },
    { href: profile.socialLinks.telegram, label: "Telegram", icon: TelegramIcon },
    { href: `mailto:${profile.socialLinks.email}`, label: "Email", icon: Mail },
  ];

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-label={t("nav.home")}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        glowX.set(e.clientX - r.left);
        glowY.set(e.clientY - r.top);
      }}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-10 sm:px-6 lg:px-8"
    >
      {/* ambience: blueprint grid + two drifting aurora orbs */}
      <div aria-hidden="true" className="absolute inset-0 bg-grid print:hidden [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,black,transparent)]" />
      <div
        aria-hidden="true"
        className="animate-aurora absolute -top-32 left-1/2 h-[480px] w-[680px] -translate-x-[70%] rounded-full bg-violet-600/25 blur-[130px] print:hidden dark:bg-violet-600/30"
      />
      <div
        aria-hidden="true"
        className="animate-aurora absolute top-1/3 left-1/2 h-[420px] w-[560px] -translate-x-[15%] rounded-full bg-fuchsia-500/15 blur-[130px] print:hidden [animation-delay:-6s] dark:bg-fuchsia-500/20"
      />
      <div
        aria-hidden="true"
        className="animate-aurora absolute -bottom-40 left-1/2 h-[380px] w-[520px] -translate-x-1/2 rounded-full bg-violet-700/15 blur-[120px] print:hidden [animation-delay:-12s] dark:bg-violet-800/30"
      />

      {/* cursor-following ambient glow — a soft violet halo that tracks the
          pointer across the hero. Centered via negative margin (not transform,
          which framer-motion would overwrite). Inert on touch + reduced-motion. */}
      {!reduce ? (
        <motion.div
          aria-hidden="true"
          style={{ left: glowXs, top: glowYs, marginLeft: -170, marginTop: -170 }}
          className="hero-cursor-glow pointer-events-none absolute z-[2] h-[340px] w-[340px] rounded-full bg-violet-500/15 blur-[90px] print:hidden dark:bg-violet-500/20"
        />
      ) : null}

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center"
      >
        {/* availability badge */}
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary dark:text-violet-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {t("hero.badge")}
          </span>
        </motion.div>

        {/* headline */}
        <motion.p
          variants={item}
          className="mt-8 text-base font-medium tracking-wide text-muted-foreground sm:text-lg"
        >
          {greeting}
        </motion.p>
        <motion.h1
          variants={item}
          className="text-gradient-animated mt-2 text-5xl font-bold tracking-tight text-balance sm:text-6xl md:text-7xl xl:text-8xl"
        >
          {profile.name}
          <span className="text-primary">.</span>
        </motion.h1>
        <motion.h2
          variants={item}
          className="text-gradient mt-3 max-w-3xl text-xl font-semibold tracking-tight text-balance sm:text-2xl md:text-3xl xl:text-4xl"
        >
          {t("hero.tagline")}
        </motion.h2>
        <motion.p
          variants={item}
          className="mt-5 max-w-2xl text-pretty text-muted-foreground sm:text-lg"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="mt-9 flex flex-col items-center gap-3 print:hidden sm:flex-row"
        >
          <Magnetic>
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-8 text-base font-semibold shadow-[0_8px_30px_-8px_rgba(139,92,246,0.7)] transition-all duration-300 hover:shadow-[0_10px_40px_-6px_rgba(139,92,246,0.85)] hover:brightness-110"
            >
              <a href="#projects">
                {t("hero.viewProjects")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-border bg-background/60 px-8 text-base font-semibold backdrop-blur transition-all duration-300 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
            >
              <a href="#contact">{t("hero.contactMe")}</a>
            </Button>
          </Magnetic>
        </motion.div>

        {/* socials — icon-only links are useless on paper */}
        <motion.div variants={item} className="mt-8 flex items-center gap-2 print:hidden">
          {socials.map(({ href, label, icon: Icon }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-secondary/50 text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:text-primary hover:shadow-[0_8px_20px_-6px_rgba(139,92,246,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          ))}
        </motion.div>

        {/* stats */}
        <motion.dl
          variants={item}
          className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="group rounded-2xl border border-border/60 bg-card/50 px-4 py-5 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_30px_-12px_rgba(139,92,246,0.35)]"
            >
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-gradient text-2xl font-bold tabular-nums sm:text-3xl">
                <CountUp value={s.value} suffix={s.suffix} format={s.format} />
              </dd>
              <dd className="mt-1 text-xs leading-snug text-muted-foreground sm:text-sm">
                {s.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* scroll hint — in normal flow below stats so it can never overlap */}
      <motion.a
        href="#projects"
        aria-label={t("hero.scroll")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="relative z-10 mt-10 flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary print:hidden"
      >
        <span className="text-[11px] font-medium tracking-[0.2em] uppercase">
          {t("hero.scroll")}
        </span>
        <span className="flex h-9 w-6 justify-center rounded-full border border-border/80 pt-1.5">
          <span className="animate-scroll-dot h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      </motion.a>
    </section>
  );
}
