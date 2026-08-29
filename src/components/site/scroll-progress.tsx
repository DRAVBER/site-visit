"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin violet progress line fixed under the header, grows with scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-16 z-50 h-[2px] origin-left bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 shadow-[0_0_8px_rgba(139,92,246,0.7)]"
    />
  );
}
