"use client";

import type { MouseEvent } from "react";

/**
 * Mouse-tracking spotlight for cards.
 *
 * Writes `--mx` / `--my` CSS custom properties (pointer position relative
 * to the element) which the `.card-spotlight::after` overlay in
 * globals.css turns into a soft radial glow. Spread the returned props on
 * the card root element.
 *
 * - no re-renders: values go straight to inline CSS variables
 * - touch devices: the hover overlay is hidden via `@media (hover: none)`,
 *   so stale coordinates never matter there
 */
export function spotlightProps<T extends HTMLElement>() {
  const onMouseMove = (e: MouseEvent<T>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };
  return { onMouseMove };
}
