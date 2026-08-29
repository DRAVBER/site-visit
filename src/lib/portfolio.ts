/**
 * Portfolio data layer.
 *
 * All content comes from flat JSON files in /data — adding a project or a
 * category is a matter of adding an entry there, no component changes needed:
 *   - data/projects.json      → projects grid
 *   - data/categories.json    → filter tabs (ordered by `order`)
 *   - data/profile.json       → owner info, skills, experience, social links
 *   - data/testimonials.json  → “what clients say” carousel
 */
import projectsJson from "../../data/projects.json";
import categoriesJson from "../../data/categories.json";
import profileJson from "../../data/profile.json";
import testimonialsJson from "../../data/testimonials.json";

export type Locale = "en" | "ru";

/** string | { en, ru } */
export type Localized = string | { en: string; ru: string };

export function resolveLocalized(value: Localized, locale: Locale): string {
  if (typeof value === "string") return value;
  return value[locale] ?? value.en;
}

/* ------------------------------ types ---------------------------------- */

export interface Category {
  id: string;
  label: Localized;
  order: number;
  /** name from the icon registry in components/site/category-icon.tsx */
  icon?: string;
}

export interface Project {
  id: string;
  title: string;
  description: Localized;
  /** must match a category id in data/categories.json */
  category: string;
  githubUrl: string;
  demoUrl?: string;
  tags: string[];
  /** local (public/) or remote image urls */
  screenshots: string[];
  featured?: boolean;
  /** fallback metadata — refreshed from the GitHub API when reachable */
  stars: number;
  language: string;
  lastCommit: string; // ISO date
  /** shell commands shown in the "How to run" block */
  run?: string;
}

export interface SkillGroup {
  label: Localized;
  items: string[];
}

export interface ExperienceItem {
  period: string;
  role: Localized;
  company: Localized;
  description: Localized;
}

export interface NowItem {
  emoji?: string;
  label: Localized;
}

export interface ActivityConfig {
  /** PRNG seed — change it to reshuffle the decorative graph */
  seed: number;
}

export interface Testimonial {
  id: string;
  quote: Localized;
  author: string;
  role: Localized;
  company: string;
  /** two-letter monogram shown in the avatar circle */
  initials: string;
  /** 1–5 stars rendered under the quote */
  rating?: number;
  /** related project title (informational chip) */
  project?: string;
}

export interface Profile {
  name: string;
  handle: string;
  initials: string;
  avatarUrl: string;
  socialLinks: {
    github: string;
    discord: string;
    telegram: string;
    email: string;
  };
  stats: {
    years: number;
    projects: number;
    openSource: number;
    stars: number;
  };
  /** IANA timezone used for the "local time" chip in BIO */
  timezone?: string;
  /** "Now" section — what the owner is currently working on */
  now?: NowItem[];
  /** decorative contribution graph config */
  activity?: ActivityConfig;
  skills: SkillGroup[];
  experience: ExperienceItem[];
}

/* ------------------------------ data ----------------------------------- */

export const projects: Project[] = projectsJson as Project[];

/** sorted by `order` so tabs always follow the config */
export const categories: Category[] = [...(categoriesJson as Category[])].sort(
  (a, b) => a.order - b.order
);

export const profile: Profile = profileJson as Profile;

/** client quotes — data/testimonials.json (section renders nothing if empty) */
export const testimonials: Testimonial[] =
  testimonialsJson as Testimonial[];

/** number of screenshots across all projects (used for stats / alt text) */
export const projectIds = projects.map((p) => p.id);

/** relative time like “3 days ago” in the active locale (client-side only) */
export function formatRelativeTime(
  isoDate: string,
  locale: Locale,
  now: Date = new Date()
): string {
  const rtf = new Intl.RelativeTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    numeric: "always",
  });
  const diffMs = new Date(isoDate).getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
  if (absMs >= YEAR) return rtf.format(Math.round(diffMs / YEAR), "year");
  if (absMs >= MONTH) return rtf.format(Math.round(diffMs / MONTH), "month");
  if (absMs >= WEEK) return rtf.format(Math.round(diffMs / WEEK), "week");
  if (absMs >= DAY) return rtf.format(Math.round(diffMs / DAY), "day");
  if (absMs >= HOUR) return rtf.format(Math.round(diffMs / HOUR), "hour");
  return rtf.format(Math.round(diffMs / MIN), "minute");
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
