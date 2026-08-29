"use client";

import { useSyncExternalStore } from "react";

/* ---------------------------------------------------------------------------
 * Shared minute clock — a single interval for every ticking timestamp on the
 * page (project cards, local-time chip), exposed via useSyncExternalStore.
 * The server snapshot is `null` so SSR/hydration render deterministic
 * fallbacks; the live clock kicks in right after mount.
 * ------------------------------------------------------------------------- */
const listeners = new Set<() => void>();
let current: Date | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === null) {
    current = new Date();
    timer = setInterval(() => {
      current = new Date();
      listeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
      current = null;
    }
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => null;

/** Current time refreshed once a minute — `null` on the server / first paint. */
export function useNow(): Date | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
