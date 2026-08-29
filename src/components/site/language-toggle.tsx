"use client";

import { useI18n } from "@/lib/i18n";

/** Compact RU ⇄ EN segmented switch with a sliding violet indicator. */
export function LanguageToggle() {
  const { locale, toggleLocale, t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t("nav.switchLanguage")}
      title={t("nav.switchLanguage")}
      className="relative flex h-9 w-[78px] items-center rounded-full border border-border/70 bg-secondary/60 p-1 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* sliding indicator */}
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-[0_2px_10px_rgba(139,92,246,0.45)] transition-transform duration-300 ease-out"
        style={{ transform: locale === "en" ? "translateX(100%)" : "translateX(0)" }}
      />
      {(["ru", "en"] as const).map((code) => (
        <span
          key={code}
          aria-hidden={locale === code}
          className={`relative z-10 grid h-full flex-1 place-items-center text-xs font-semibold tracking-wide uppercase transition-colors duration-300 ${
            locale === code
              ? "text-primary-foreground"
              : "text-muted-foreground"
          }`}
        >
          {code}
        </span>
      ))}
    </button>
  );
}
