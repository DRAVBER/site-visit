"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const emptySubscribe = () => () => {};

/** true after hydration (avoids SSR/client mismatch), lint-safe. */
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

type ThemeMode = "dark" | "light" | "system";

/** cycle order: dark → light → system → dark */
const NEXT: Record<ThemeMode, ThemeMode> = {
  dark: "light",
  light: "system",
  system: "dark",
};

const ICONS = {
  dark: Moon,
  light: Sun,
  system: Monitor,
} as const;

/**
 * Tri-state theme switch — dark / light / follow-the-system.
 * The icon reflects the active mode and morphs on every switch;
 * the choice is persisted by next-themes (localStorage "theme").
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const mounted = useMounted();

  const mode: ThemeMode =
    theme === "light" || theme === "system" ? theme : "dark";
  const Icon = ICONS[mode];
  const modeLabel = t(
    mode === "dark"
      ? "nav.themeDark"
      : mode === "light"
        ? "nav.themeLight"
        : "nav.themeSystem"
  );
  const label = t("nav.themeCurrent").replace("{mode}", modeLabel);

  const onClick = useCallback(() => setTheme(NEXT[mode]), [setTheme, mode]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className="relative h-9 w-9 rounded-full text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onClick}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted ? (
          <motion.span
            key={mode}
            initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 60, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="grid place-items-center"
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </motion.span>
        ) : (
          <Moon className="h-[18px] w-[18px] opacity-0" aria-hidden="true" />
        )}
      </AnimatePresence>
    </Button>
  );
}
