"use client";

import { useI18n } from "@/lib/i18n";
import { useNow } from "@/lib/clock";
import { formatRelativeTime } from "@/lib/portfolio";

/**
 * Relative timestamp (“3 days ago”) — absolute date on the server and the
 * very first paint, upgraded to a locale-aware relative time right after
 * mount (kept honest by the shared minute clock).
 */
export function RelativeTime({
  isoDate,
  prefix,
  className,
}: {
  isoDate: string;
  /** e.g. "Updated" — prepended with a space when provided */
  prefix?: string;
  className?: string;
}) {
  const { locale } = useI18n();
  const now = useNow();

  const absolute = new Intl.DateTimeFormat(
    locale === "ru" ? "ru-RU" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  ).format(new Date(isoDate));

  return (
    <time dateTime={isoDate} className={className}>
      {now ? (
        <>
          {prefix ? `${prefix} ` : ""}
          {formatRelativeTime(isoDate, locale, now)}
        </>
      ) : (
        absolute
      )}
    </time>
  );
}
