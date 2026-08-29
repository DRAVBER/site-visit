"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which page section is currently in view (scrollspy).
 * Sections are ordered top→bottom; the active one is the last section
 * whose top has passed the offset line. Falls back to the first section.
 */
export function useScrollSpy(ids: readonly string[], offset = 120): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const onScroll = () => {
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }
      // near the very bottom — always highlight the last section
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 40) {
        current = ids[ids.length - 1] ?? current;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids, offset]);

  return active;
}
