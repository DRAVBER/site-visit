"use client";

import { motion } from "framer-motion";

/** Consistent section header: eyebrow number, title, subtitle, shimmer divider. */
export function SectionHeading({
  id,
  title,
  subtitle,
}: {
  id: string;
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
      <p className="text-sm font-semibold tracking-[0.25em] text-primary/70 uppercase">
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
