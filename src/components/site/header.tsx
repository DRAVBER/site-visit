"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useI18n } from "@/lib/i18n";
import { profile } from "@/lib/portfolio";
import { useScrollSpy } from "@/hooks/use-scrollspy";
import { useUiStore } from "@/lib/ui-store";

const NAV_SECTIONS = [
  { id: "hero", key: "nav.home" },
  { id: "projects", key: "nav.projects" },
  { id: "bio", key: "nav.bio" },
  { id: "testimonials", key: "nav.testimonials" },
  { id: "contact", key: "nav.contact" },
] as const;

const SECTION_IDS = NAV_SECTIONS.map((s) => s.id);

/** Fixed glass header: monogram logo, scrollspy nav, theme + language switches. */
export function SiteHeader() {
  const { t, locale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const activeSection = useScrollSpy(SECTION_IDS);
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const isMac =
    typeof window !== "undefined" &&
    /Mac|iPhone|iPad/.test(window.navigator.userAgent);

  // glass background appears once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 print:hidden transition-all duration-500 ${
        scrolled
          ? "header-glass border-b border-border/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* logo */}
        <a
          href="#hero"
          className="group flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={profile.name}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-sm font-bold text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.6)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            {profile.initials}
          </span>
          <span className="hidden text-base font-semibold tracking-tight sm:block">
            {profile.name}
            <span className="text-primary">.</span>
          </span>
        </a>

        {/* desktop nav with scrollspy highlight */}
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-border/50 bg-secondary/30 p-1 backdrop-blur-sm">
            {NAV_SECTIONS.map(({ id, key }) => {
              const isActive = activeSection === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="nav-active-pill"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-primary/90 shadow-[0_2px_14px_-2px_rgba(139,92,246,0.6)]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                    <span className="relative">{t(key)}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* command palette trigger */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label={t("nav.openPalette")}
            title={t("palette.hint")}
            className="group hidden h-9 items-center gap-2 rounded-full border border-border/70 bg-secondary/40 px-3.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
          >
            <Search
              className="h-3.5 w-3.5 transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
            <span className="sr-only sm:not-sr-only">{t("palette.placeholder")}</span>
            <kbd className="pointer-events-none ml-1 hidden select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground/80 lg:flex">
              {isMac ? "⌘" : "Ctrl"}K
            </kbd>
          </button>
          {/* palette trigger (mobile) — icon only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPaletteOpen(true)}
            aria-label={t("nav.openPalette")}
            className="h-9 w-9 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
          >
            <Search className="h-4.5 w-4.5" />
          </Button>

          <LanguageToggle />
          <ThemeToggle />

          {/* mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("nav.openMenu")}
                className="h-9 w-9 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-6">
              <SheetHeader className="p-0 text-left">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 text-xs font-bold text-white">
                    {profile.initials}
                  </span>
                  {profile.name}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  {t("nav.menuDescription")}
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-6">
                <ul className="flex flex-col gap-1">
                  {NAV_SECTIONS.map(({ id, key }) => {
                    const isActive = activeSection === id;
                    return (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          onClick={() => setOpen(false)}
                          aria-current={isActive ? "true" : undefined}
                          className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all hover:bg-accent hover:text-accent-foreground hover:pl-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {t(key)}
                          <span
                            aria-hidden="true"
                            className={`transition-transform ${
                              isActive ? "text-primary translate-x-1" : "text-primary/60"
                            }`}
                          >
                            →
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <p className="mt-8 px-4 text-xs text-muted-foreground">
                {locale === "ru"
                  ? "Спасибо, что заглянули ✦"
                  : "Thanks for stopping by ✦"}
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
