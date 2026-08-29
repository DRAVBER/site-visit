"use client";

import { motion } from "framer-motion";

/**
 * Consistent section header: numbered eyebrow (01 / 02 / …), title,
 * subtitle, shimmer divider. The number gives the page an editorial
 * rhythm — sections are discoverable at a glance while scrolling.
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
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      ) : null}
      <div
        aria-hidden="true"
        className="shimmer-line mx-auto mt-7 h-px w-32 rounded-full"
      />
    </motion.div>
  );
}
