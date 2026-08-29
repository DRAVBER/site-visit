"use client";

import { ArrowDownWideNarrow } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortMode = "featured" | "stars" | "name" | "updated";

/** Compact pill select for the projects grid ordering. */
export function SortSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  /** sr-only label */
  label: string;
  options: { value: SortMode; label: string }[];
}) {
  return (
    <div className="relative">
      <ArrowDownWideNarrow
        className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Select value={value} onValueChange={(v) => onChange(v as SortMode)}>
        <SelectTrigger
          aria-label={label}
          className="h-11 w-auto gap-1.5 rounded-full border-border/70 bg-secondary/40 pl-9 pr-4 text-sm font-medium text-muted-foreground shadow-none transition-all duration-300 hover:border-primary/40 hover:text-foreground data-[state=open]:border-primary/50 data-[state=open]:text-foreground [&>svg:last-child]:opacity-70"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          align="end"
          className="min-w-[180px] rounded-xl border-border/70 [&_[data-highlighted]]:bg-primary/10 [&_[data-highlighted]]:text-primary [&_[data-state=checked]]:text-primary"
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="rounded-lg font-medium"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
