"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
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

/** Sun/moon switch — choice is persisted by next-themes (localStorage). */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";
  const onClick = useCallback(
    () => setTheme(isDark ? "light" : "dark"),
    [setTheme, isDark]
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("nav.toggleTheme")}
      title={t("nav.toggleTheme")}
      className="relative h-9 w-9 rounded-full text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onClick}
    >
      {mounted && isDark ? (
        <Sun className="h-[18px] w-[18px] transition-transform duration-500" />
      ) : mounted && !isDark ? (
        <Moon className="h-[18px] w-[18px] transition-transform duration-500" />
      ) : (
        <Moon className="h-[18px] w-[18px] opacity-0" />
      )}
    </Button>
  );
}
