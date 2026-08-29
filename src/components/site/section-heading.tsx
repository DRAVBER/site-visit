"use client";

import { motion } from "framer-motion";

/**
 * Consistent section header: numbered eyebrow (01 / 02 / …), title,
 * subtitle, shimmer divider. The number gives the page an editorial
 * rhythm — sections are discoverable at a glance while scrolling.
 *
 * The title reveals word-by-word (clip-path mask + slide-up) with a small
 * stagger — an editorial touch that respects reduced-motion via MotionConfig.
 */
export function SectionHeading({
  id,
  number,
  title,
  subtitle,
}: {
  id: string;
  /** editorial index shown next to the eyebrow, e.g. "01" */
  number?: string;
  title: string;
  subtitle?: string;
}) {
  const words = title.split(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mb-10 max-w-2xl text-center sm:mb-14"
    >
      <p className="flex items-center justify-center gap-3 text-sm font-semibold tracking-[0.25em] text-primary/70 uppercase">
        {number ? (
          <span
            aria-hidden="true"
            className="rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-xs tracking-normal text-primary"
          >
            {number}
          </span>
        ) : null}
        {id}
      </p>

      {/* word-by-word reveal — each word rises out of its clip mask */}
      <h2
        aria-label={title}
        className="mt-3 flex flex-wrap items-baseline justify-center gap-x-[0.3em] text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl"
      >
        {words.map((word, i) => (
          <span key={`${word}-${i}`} aria-hidden="true" className="overflow-hidden pb-[0.08em]">
            <motion.span
              className="inline-block will-change-transform"
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.55,
                delay: 0.08 + i * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h2>

      {subtitle ? (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.25 + words.length * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-pretty text-muted-foreground sm:text-lg"
        >
          {subtitle}
        </motion.p>
      ) : null}
      <div
        aria-hidden="true"
        className="shimmer-line mx-auto mt-7 h-px w-32 rounded-full"
      />
    </motion.div>
  );
}
