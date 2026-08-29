/**
 * Portfolio data layer.
 *
 * All content comes from flat JSON files in /data — adding a project or a
 * category is a matter of adding an entry there, no component changes needed:
 *   - data/projects.json    → projects grid
 *   - data/categories.json  → filter tabs (ordered by `order`)
 *   - data/profile.json     → owner info, skills, experience, social links
 *
 * Localized fields accept either a plain string (same in every language) or
 * an { en, ru } object resolved against the active locale.
 */
import projectsJson from "../../data/projects.json";
import categoriesJson from "../../data/categories.json";
import profileJson from "../../data/profile.json";

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

/** number of screenshots across all projects (used for stats / alt text) */
export const projectIds = projects.map((p) => p.id);

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
