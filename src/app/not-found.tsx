"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Home } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { profile } from "@/lib/portfolio";
import { useMounted } from "@/hooks/use-mounted";

/**
 * 404 page — terminal-styled to match the developer theme.
 * Client component so it inherits theme + RU/EN i18n from the root layout.
 */
export default function NotFound() {
  const { t } = useI18n();
  /* pathname is client-only — rendered after hydration to avoid mismatch */
  const mounted = useMounted();
  const pathname = mounted && typeof window !== "undefined" ? window.location.pathname : "/…";

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* aurora backdrop — matches the hero ambience */}
      <div
        aria-hidden="true"
        className="animate-aurora pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[130px] dark:bg-violet-700/25"
      />
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
      />

      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        {/* terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_30px_80px_-30px_rgba(139,92,246,0.35)]"
        >
          {/* title bar */}
          <div className="flex items-center gap-2 border-b border-border/60 bg-secondary/60 px-4 py-3">
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-red-500/80" />
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {profile.handle.toLowerCase()}@web — zsh
            </span>
          </div>
          {/* exchange */}
          <div className="space-y-1.5 px-5 py-5 text-left font-mono text-sm">
            <p className="text-muted-foreground">
              <span className="text-primary">$</span> curl -I{" "}
              <span className="text-foreground/80">
                https://{profile.handle.toLowerCase()}.dev{pathname}
              </span>
            </p>
            <p className="text-muted-foreground">HTTP/2 404</p>
            <p className="text-muted-foreground">
              server: <span className="text-amber-500">not-found</span>
            </p>
            <p className="text-muted-foreground">
              <span className="text-primary">$</span>{" "}
              <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-primary" />
            </p>
          </div>
        </motion.div>

        {/* giant 404 */}
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
          className="text-gradient-animated mt-4 bg-clip-text text-7xl font-black tracking-tighter text-transparent sm:text-8xl"
        >
          404
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
        >
          {t("notFound.title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          {t("notFound.description")}
        </motion.p>

        {/* actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-10px_rgba(139,92,246,0.7)] transition-all duration-300 hover:shadow-[0_16px_40px_-10px_rgba(139,92,246,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Home className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
            {t("notFound.backHome")}
          </Link>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            {t("notFound.viewProjects")}
          </Link>
        </motion.div>

        {/* subtle hint back */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          {t("notFound.hint")}
        </motion.p>
      </div>
    </main>
  );
}
