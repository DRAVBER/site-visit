"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Search input for the projects grid (title / description / tags). */
export function ProjectSearch({
  value,
  onChange,
  placeholder,
  clearLabel,
  resultCount,
  resultLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  clearLabel: string;
  resultCount: number;
  resultLabel: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <Search
        className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 rounded-full border-border/70 bg-secondary/40 pl-11 pr-24 text-sm shadow-none transition-all duration-300 placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none"
      />
      {/* result counter / clear button */}
      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1.5">
        {value ? (
          <>
            <span className="hidden rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary tabular-nums sm:block">
              {resultCount} {resultLabel}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label={clearLabel}
              title={clearLabel}
              className="grid h-7 w-7 place-items-center rounded-full bg-muted text-muted-foreground transition-all hover:rotate-90 hover:bg-primary/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
