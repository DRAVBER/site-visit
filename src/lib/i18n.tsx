"use client";

/**
 * Lightweight i18n for two locales (RU / EN).
 *
 * - Dictionaries live in /locales/*.json and are imported statically →
 *   switching a language is synchronous (no fetch, no reload, no flicker).
 * - The chosen locale is persisted in localStorage ("portfolio-lang") via a
 *   tiny external store consumed with useSyncExternalStore — hydration-safe
 *   and free of setState-in-effect cascades.
 * - On first visit the browser language is detected (navigator.language).
 * - Server render defaults to "ru"; <html lang> is kept in sync for a11y/SEO.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import en from "../../locales/en.json";
import ru from "../../locales/ru.json";
import type { Locale } from "./portfolio";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  ru: ru as Dictionary,
};

export const DEFAULT_LOCALE: Locale = "ru";
const STORAGE_KEY = "portfolio-lang";

/* ------------------------- tiny external store -------------------------- */

type Listener = () => void;
const listeners = new Set<Listener>();
let currentLocale: Locale | null = null; // lazily initialized on first read

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ru") return saved;
  } catch {
    /* private mode */
  }
  return navigator.language?.toLowerCase().startsWith("ru") ? "ru" : "en";
}

function getSnapshot(): Locale {
  if (currentLocale === null) currentLocale = readInitialLocale();
  return currentLocale;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writeLocale(next: Locale) {
  currentLocale = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = next;
  listeners.forEach((l) => l());
}

/* ------------------------------- context -------------------------------- */

interface I18nContextValue {
  locale: Locale;
  /** dot-path lookup, e.g. t("hero.viewProjects") */
  t: (path: string) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function lookup(dict: Dictionary, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      dict
    );
  return typeof value === "string" ? value : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep <html lang> in sync with the *effective* locale — including the
  // auto-detected one (navigator.language) and explicit toggles alike.
  // writeLocale() already sets it for user actions; this effect covers the
  // hydration path where the client snapshot (auto-detect) diverges from the
  // server default ("ru"), which previously left a stale lang attribute.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => writeLocale(next), []);
  const toggleLocale = useCallback(
    () => writeLocale(locale === "ru" ? "en" : "ru"),
    [locale]
  );
  const t = useCallback(
    (path: string) => lookup(dictionaries[locale], path),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, t, setLocale, toggleLocale }),
    [locale, t, setLocale, toggleLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}
