"use client";

/**
 * Fullscreen image viewer (lightbox) — used by the project dialog gallery.
 *
 * - opens on top of the Radix dialog (z-[70]) without closing it
 * - Escape / arrows are captured in the capture-phase so the parent dialog
 *   never reacts to keys meant for the viewer
 * - prev/next arrows wrap around, counter “2 / 3” bottom-center
 * - backdrop click closes, body scroll is locked while open
 */
import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function Lightbox({
  images,
  index,
  onIndexChange,
  open,
  onOpenChange,
  altBase,
  labels,
}: {
  images: string[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** base alt text, screenshots are numbered on top of it */
  altBase: string;
  labels: { close: string; prev: string; next: string };
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const go = useCallback(
    (delta: number) => {
      if (images.length === 0) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [images.length, index, onIndexChange]
  );

  /* capture-phase key handling on WINDOW — window precedes document in the
     capture path, so this beats Radix's own capture listeners on document
     (react-use-escape-keydown). The viewer therefore always wins: Escape
     closes only the viewer, arrows only navigate it, and the project dialog
     underneath never reacts while the viewer is open. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, close, go]);

  /* lock body scroll + move focus inside, restore it on close */
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  if (images.length === 0) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={altBase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/92 backdrop-blur-sm print:hidden"
          onClick={close}
        >
          {/* close */}
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={labels.close}
            className="absolute top-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-all duration-300 hover:bg-black/80 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* counter */}
          <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-4 py-1.5 font-mono text-xs tracking-widest text-white/90 backdrop-blur-md">
            {index + 1} / {images.length}
          </p>

          {/* image — stop click propagation so backdrop close doesn't fire */}
          <motion.img
            key={images[index]}
            src={images[index]}
            alt={`${altBase} ${index + 1}`}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          />

          {/* prev / next — always visible in the viewer */}
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label={labels.prev}
                className="absolute top-1/2 left-3 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-all duration-300 hover:bg-black/80 hover:-translate-x-0.5 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label={labels.next}
                className="absolute top-1/2 right-3 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-all duration-300 hover:bg-black/80 hover:translate-x-0.5 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-6"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
