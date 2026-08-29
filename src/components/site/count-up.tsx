"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

/**
 * Animated number that counts up from 0 when scrolled into view.
 * Supports suffixes like "+" and formats thousands as "2.4k".
 */
export function CountUp({
  value,
  suffix = "",
  format = "plain",
  duration = 1.6,
  className,
}: {
  value: number;
  suffix?: string;
  /** plain: 1284 → 1284 · compact: 1284 → 1.3k */
  format?: "plain" | "compact";
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  const formatted =
    format === "compact" && display >= 1000
      ? `${(display / 1000).toFixed(1).replace(/\.0$/, "")}k`
      : format === "compact" && value >= 1000
        ? `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`
        : Math.round(display).toString();

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}
