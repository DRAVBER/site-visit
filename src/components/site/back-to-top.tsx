"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Floating back-to-top button with a circular scroll-progress ring.
 * Appears after scrolling past ~80% of the first viewport; the violet
 * ring fills as the page approaches the bottom.
 */
export function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      setVisible(scrolled > window.innerHeight * 0.8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(scrolled / max, 1) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ring geometry: r=20 → circumference ≈ 125.66 */
  const R = 20;
  const C = 2 * Math.PI * R;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t("footer.backToTop")}
          title={t("footer.backToTop")}
          className="fixed right-5 bottom-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-primary/30 bg-card/90 text-primary shadow-[0_8px_30px_-8px_rgba(139,92,246,0.6)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring print:hidden sm:right-8 sm:bottom-8"
        >
          {/* progress ring */}
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
          >
            <circle
              cx="24"
              cy="24"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-primary/15"
            />
            <circle
              cx="24"
              cy="24"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              className="text-primary transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
          <ArrowUp className="relative h-4.5 w-4.5" aria-hidden="true" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
