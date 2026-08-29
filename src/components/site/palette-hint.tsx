"use client";

/**
 * One-time nudge that teaches first-time visitors about the ⌘K palette.
 *
 * - appears ~3s after load, only if the hint wasn't dismissed before
 *   (localStorage "portfolio-palette-hint" = "seen")
 * - hides itself when the palette is opened, when dismissed or after 15s
 * - client-only + external-store visibility flag → no SSR mismatch
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Command, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useUiStore } from "@/lib/ui-store";
import { useMounted } from "@/hooks/use-mounted";

const HINT_KEY = "portfolio-palette-hint";
const SHOW_AFTER_MS = 3000;
const AUTO_HIDE_MS = 15000;

export function PaletteHint() {
  const { t } = useI18n();
  const mounted = useMounted();
  /** raised by the intro timer, lowered on dismiss / auto-hide */
  const [raised, setRaised] = useState(false);
  const paletteOpen = useUiStore((s) => s.paletteOpen);

  /* derived: an open palette always wins over the hint — no effect needed */
  const visible = mounted && raised && !paletteOpen;

  useEffect(() => {
    if (!mounted) return;
    let seen = false;
    try {
      seen = localStorage.getItem(HINT_KEY) === "seen";
    } catch {
      /* private mode — show anyway, never persist */
    }
    if (seen) return;

    const showTimer = setTimeout(() => setRaised(true), SHOW_AFTER_MS);
    const hideTimer = setTimeout(() => {
      setRaised(false);
      try {
        localStorage.setItem(HINT_KEY, "seen");
      } catch {
        /* ignore */
      }
    }, SHOW_AFTER_MS + AUTO_HIDE_MS);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [mounted]);

  /* opening the palette itself counts as “got it” (external side effect) */
  useEffect(() => {
    if (!paletteOpen) return;
    try {
      localStorage.setItem(HINT_KEY, "seen");
    } catch {
      /* ignore */
    }
  }, [paletteOpen]);

  const dismiss = () => {
    setRaised(false);
    try {
      localStorage.setItem(HINT_KEY, "seen");
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence>
      {mounted && visible ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 print:hidden"
        >
          <div className="flex items-center gap-3 rounded-full border border-primary/30 bg-card/95 py-2 pr-2 pl-4 shadow-[0_16px_44px_-16px_rgba(139,92,246,0.55)] backdrop-blur">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <Command className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm leading-tight">
              <span className="block font-semibold">{t("palette.hintTitle")}</span>
              <span className="block text-muted-foreground">
                {t("palette.hintBody")}
              </span>
            </span>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t("palette.hintDismiss")}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
