"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useI18n } from "@/lib/i18n";
import { profile } from "@/lib/portfolio";

const NAV_SECTIONS = [
  { id: "hero", key: "nav.home" },
  { id: "projects", key: "nav.projects" },
  { id: "bio", key: "nav.bio" },
  { id: "contact", key: "nav.contact" },
] as const;

/** Fixed glass header: monogram logo, anchor nav, theme + language switches. */
export function SiteHeader() {
  const { t, locale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // glass background appears once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
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

        {/* desktop nav */}
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_SECTIONS.map(({ id, key }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
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
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-6">
                <ul className="flex flex-col gap-1">
                  {NAV_SECTIONS.map(({ id, key }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:pl-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {t(key)}
                        <span
                          aria-hidden="true"
                          className="text-primary/60 transition-transform"
                        >
                          →
                        </span>
                      </a>
                    </li>
                  ))}
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
