/**
 * Dates, times and numbers in the reader's language, still in the studio's
 * time zone. `dates(locale)` is bound once per request and passed around as
 * `d`, because there is no ambient locale on the server: every render has to
 * say which language it is in.
 */
import { localDate, STUDIO_TZ } from "@/lib/time";

import type { Locale } from "./locales";

/** The BCP 47 tag each of our languages formats with. */
const TAG: Record<Locale, string> = { en: "en-GB", fr: "fr-FR" };

export interface Formats {
  /** "Mon 26 Oct" / "lun. 26 oct." */
  day(iso: string | Date): string;
  /** "14:30" */
  time(iso: string | Date): string;
  /** "26 Oct 2026" / "26 oct. 2026" */
  dateTime(iso: string): string;
  /** A date-only attribute ("2026-10-26"), not moved across time zones. */
  date(date: string): string;
  /** "Mon 26 Oct · 10:00–14:00", or both days when it crosses midnight. */
  range(start: string, end: string): string;
  /** The month and year of a day, for headings. */
  month(iso: string | Date): string;
  /** Money in the studio's currency, no decimals. */
  money(value: number | null | undefined): string;
  /** A plain number, grouped for the language (1 234,5 in French). */
  number(value: number, maximumFractionDigits?: number): string;
  /** A length in metres. */
  metres(value: number | null | undefined): string;
}

const cache = new Map<Locale, Formats>();

export function dates(locale: Locale): Formats {
  const hit = cache.get(locale);
  if (hit) return hit;

  const tag = TAG[locale];
  const inStudio = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(tag, { timeZone: STUDIO_TZ, ...opts });
  const dayFmt = inStudio({ weekday: "short", day: "numeric", month: "short" });
  const timeFmt = inStudio({ hour: "2-digit", minute: "2-digit" });
  const dateFmt = inStudio({ day: "numeric", month: "short", year: "numeric" });
  const monthFmt = inStudio({ month: "long", year: "numeric" });
  const plainFmt = new Intl.DateTimeFormat(tag, { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
  const moneyFmt = new Intl.NumberFormat(tag, {
    style: "currency",
    currency: process.env.STUDIO_CURRENCY || "EUR",
    maximumFractionDigits: 0,
  });

  const formats: Formats = {
    day: (iso) => dayFmt.format(new Date(iso)),
    time: (iso) => timeFmt.format(new Date(iso)),
    dateTime: (iso) => `${dateFmt.format(new Date(iso))}, ${timeFmt.format(new Date(iso))}`,
    date: (date) => plainFmt.format(new Date(`${date.slice(0, 10)}T00:00:00Z`)),
    month: (iso) => monthFmt.format(new Date(iso)),
    range: (start, end) =>
      localDate(new Date(start)) === localDate(new Date(end))
        ? `${formats.day(start)} · ${formats.time(start)}–${formats.time(end)}`
        : `${formats.day(start)} ${formats.time(start)} → ${formats.day(end)} ${formats.time(end)}`,
    money: (value) => (value === null || value === undefined ? "—" : moneyFmt.format(value)),
    number: (value, maximumFractionDigits = 0) => new Intl.NumberFormat(tag, { maximumFractionDigits }).format(value),
    metres: (value) => (value === null || value === undefined ? "—" : `${new Intl.NumberFormat(tag, { maximumFractionDigits: 1 }).format(value)} m`),
  };
  cache.set(locale, formats);
  return formats;
}
