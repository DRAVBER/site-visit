/**
 * Recently-viewed projects — a tiny localStorage-backed list (max 5 ids,
 * most recent first), exposed as an external store so components can read
 * it with useSyncExternalStore (hydration-safe, no effects needed).
 *
 * Written by the ui-store whenever a project dialog opens (card click,
 * palette, deep-link, related-project switch); read by the command palette
 * to surface a "Recently viewed" group.
 */
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "portfolio-recent";
const MAX_ITEMS = 5;

type Listener = () => void;
const listeners = new Set<Listener>();
const EMPTY: string[] = [];
let cache: string[] | null = null; // lazily initialized on first client read

function readStorage(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): string[] {
  if (cache === null) cache = readStorage();
  return cache;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** prepend an id (deduped, capped) and notify subscribers */
export function pushRecentId(id: string): void {
  if (typeof window === "undefined") return;
  const next = [id, ...getSnapshot().filter((x) => x !== id)].slice(
    0,
    MAX_ITEMS
  );
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l());
}

/** reactive hook — re-renders whenever the recent list changes */
export function useRecentProjectIds(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
