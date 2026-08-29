"use client";

import { useEffect } from "react";
import { Keyboard, CornerDownLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useUiStore } from "@/lib/ui-store";

/**
 * Shortcut data is plain strings so it stays keyable and lint-clean:
 *   combos: [["Ctrl","K"]]            → Ctrl + K
 *   combos: [["←","→"],["↑","↓"]]     → ← →  /  ↑ ↓   (alternative combos)
 */
interface ShortcutRow {
  label: string;
  combos: string[][];
}

/** A single keyboard key chip rendered as a physical keycap. */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-secondary px-1.5 font-mono text-[11px] leading-none font-semibold text-foreground shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]">
      {children}
    </kbd>
  );
}

/** One shortcut row: description on the left, keys on the right. */
function Row({ label, combos }: ShortcutRow) {
  return (
    <li className="flex min-h-9 items-center justify-between gap-4 rounded-lg px-2 py-1 transition-colors hover:bg-secondary/50">
      <span className="text-sm leading-none text-foreground/80">{label}</span>
      <span className="flex shrink-0 items-center gap-1.5">
        {combos.map((combo, i) => (
          <span key={`${label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-[10px] leading-none text-muted-foreground">
                /
              </span>
            )}
            {combo.map((key, j) => (
              <span key={`${label}-${i}-${j}`} className="flex items-center gap-1.5">
                {j > 0 && (
                  <span aria-hidden="true" className="text-[10px] leading-none text-muted-foreground">
                    +
                  </span>
                )}
                <Kbd>{key}</Kbd>
              </span>
            ))}
          </span>
        ))}
      </span>
    </li>
  );
}

/**
 * Keyboard shortcuts help dialog.
 * - global hotkey: "?" (Shift+/) or "/" when not typing in an input
 * - also opened from the command palette and a footer button
 * - lists every keyboard interaction available on the site
 */
export function ShortcutsDialog() {
  const { t } = useI18n();
  const { shortcutsOpen, setShortcutsOpen } = useUiStore();

  /* global "?" / "/" hotkey — ignored while typing in inputs */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "?" && e.key !== "/") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      setShortcutsOpen(!useUiStore.getState().shortcutsOpen);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setShortcutsOpen]);

  const groups: { title: string; items: ShortcutRow[] }[] = [
    {
      title: t("shortcuts.globalGroup"),
      items: [
        { label: t("shortcuts.palette"), combos: [["Ctrl", "K"]] },
        { label: t("shortcuts.thisHelp"), combos: [["?"], ["/"]] },
        { label: t("shortcuts.closeAny"), combos: [["Esc"]] },
      ],
    },
    {
      title: t("shortcuts.gridGroup"),
      items: [
        { label: t("shortcuts.gridMove"), combos: [["←", "→"], ["↑", "↓"]] },
        { label: t("shortcuts.gridHome"), combos: [["Home"], ["End"]] },
        { label: t("shortcuts.gridOpen"), combos: [["Enter"]] },
      ],
    },
    {
      title: t("shortcuts.dialogGroup"),
      items: [
        { label: t("shortcuts.switchProject"), combos: [["←", "→"]] },
        { label: t("shortcuts.galleryMove"), combos: [["←", "→"]] },
        { label: t("shortcuts.closeAny"), combos: [["Esc"]] },
      ],
    },
  ];

  return (
    <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl">
        {/* header */}
        <div className="relative overflow-hidden border-b border-border/60 px-5 py-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"
          />
          <DialogTitle className="flex items-center gap-2.5 text-base font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-primary/25">
              <Keyboard className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            {t("shortcuts.title")}
          </DialogTitle>
          <DialogDescription className="mt-1.5 pl-[46px] text-sm">
            {t("shortcuts.subtitle")}
          </DialogDescription>
        </div>

        {/* groups */}
        <div className="max-h-[60vh] overflow-y-auto px-3 py-3 [scrollbar-width:thin]">
          {groups.map((group) => (
            <section key={group.title} className="mb-2 last:mb-0">
              <h3 className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-primary/80 uppercase">
                {group.title}
              </h3>
              <ul>
                {group.items.map((item) => (
                  <Row key={item.label} label={item.label} combos={item.combos} />
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* footer hint */}
        <div className="flex items-center gap-2 border-t border-border/60 bg-secondary/30 px-5 py-3 text-xs leading-snug text-muted-foreground">
          <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden="true" />
          <span>{t("shortcuts.footerHint")}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
