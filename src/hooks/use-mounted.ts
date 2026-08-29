"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * `true` only on the client after hydration (server snapshot is `false`).
 * The canonical way to gate date/random-dependent rendering without
 * hydration mismatches or setState-in-effect cascades.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
