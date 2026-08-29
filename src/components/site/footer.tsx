"use client";

import { ArrowUp, Heart, Keyboard } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { profile } from "@/lib/portfolio";
import { useUiStore } from "@/lib/ui-store";
import { DiscordIcon, GithubIcon, TelegramIcon } from "./icons";

/** Sticky footer: copyright, social links, made-with note, back to top. */
export function SiteFooter() {
  const { t } = useI18n();
  const setShortcutsOpen = useUiStore((s) => s.setShortcutsOpen);
  const year = new Date().getFullYear();

  const socials = [
    { href: profile.socialLinks.github, label: "GitHub", icon: GithubIcon },
    { href: profile.socialLinks.discord, label: "Discord", icon: DiscordIcon },
    { href: profile.socialLinks.telegram, label: "Telegram", icon: TelegramIcon },
  ];

  return (
    <footer className="relative mt-auto border-t border-border/60 bg-card/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:px-6 lg:px-8">
        {/* socials */}
        <div className="flex items-center gap-2 print:hidden">
          {socials.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-secondary/40 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        {/* made with */}
        <p className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted-foreground">
          {t("footer.madeWith")}
          <Heart
            className="h-4 w-4 fill-red-500 text-red-500 animate-pulse"
            aria-hidden="true"
          />
          {t("footer.by")}
          <a
            href={profile.socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            {profile.name}
          </a>
          © {year}. {t("footer.rights")}
        </p>

        <p className="text-xs text-muted-foreground/70">
          {t("footer.builtNote")}
        </p>

        {/* back to top + shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 print:hidden">
          <button
            type="button"
            onClick={() => setShortcutsOpen(true)}
            aria-label={t("shortcuts.title")}
            title={t("shortcuts.title")}
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/40 px-4 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Keyboard
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110"
              aria-hidden="true"
            />
            {t("shortcuts.title")}
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={t("footer.backToTop")}
            title={t("footer.backToTop")}
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/40 px-4 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUp
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
            {t("footer.backToTop")}
          </button>
        </div>
      </div>
    </footer>
  );
}
