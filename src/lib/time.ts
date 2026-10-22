/**
 * Dates in the studio's time zone (STUDIO_TIMEZONE, default Europe/Paris).
 * GoHead stores datetimes in UTC; people read and type them in local time.
 */
export const STUDIO_TZ = process.env.STUDIO_TIMEZONE || "Europe/Paris";

/** Minutes the zone is ahead of UTC at that instant (Paris: 60 or 120). */
export function tzOffset(at: Date, tz = STUDIO_TZ): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year!, +parts.month! - 1, +parts.day!, +parts.hour!, +parts.minute!, +parts.second!);
  return Math.round((asUtc - Math.floor(at.getTime() / 1000) * 1000) / 60_000);
}

/** A wall-clock time of the studio ("2026-10-26T10:00") as a UTC Date. */
export function fromLocal(local: string, tz = STUDIO_TZ): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(local);
  if (!m) throw new RangeError(`not a local date: ${local}`);
  const wall = Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, +(m[4] ?? 0), +(m[5] ?? 0));
  let utc = wall - tzOffset(new Date(wall), tz) * 60_000;
  utc = wall - tzOffset(new Date(utc), tz) * 60_000; // across a DST change
  return new Date(utc);
}

/** A UTC instant as the studio's wall clock, for datetime-local inputs. */
export function toLocalInput(iso: string | null | undefined, tz = STUDIO_TZ): string {
  if (!iso) return "";
  const d = new Date(iso);
  const local = new Date(d.getTime() + tzOffset(d, tz) * 60_000);
  return local.toISOString().slice(0, 16);
}

/** The studio's calendar date (YYYY-MM-DD) of an instant. */
export function localDate(at: Date, tz = STUDIO_TZ): string {
  return new Date(at.getTime() + tzOffset(at, tz) * 60_000).toISOString().slice(0, 10);
}

/** Minutes since local midnight of an instant. */
export function localMinutes(at: Date, tz = STUDIO_TZ): number {
  const local = new Date(at.getTime() + tzOffset(at, tz) * 60_000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

/** Adds days to a YYYY-MM-DD date. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The Monday of the week of a YYYY-MM-DD date. */
export function mondayOf(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  return addDays(date, -dow);
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: STUDIO_TZ, ...opts });
const dayFmt = fmt({ weekday: "short", day: "numeric", month: "short" });
const timeFmt = fmt({ hour: "2-digit", minute: "2-digit" });
const dateFmt = fmt({ day: "numeric", month: "short", year: "numeric" });

export const formatDay = (iso: string | Date) => dayFmt.format(new Date(iso));
export const formatTime = (iso: string | Date) => timeFmt.format(new Date(iso));
/** A date-only attribute ("2026-10-26"), shown without moving it across zones. */
export const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
export const formatDateTime = (iso: string) => `${dateFmt.format(new Date(iso))}, ${timeFmt.format(new Date(iso))}`;
export const formatRange = (start: string, end: string) => {
  const sameDay = localDate(new Date(start)) === localDate(new Date(end));
  return sameDay
    ? `${formatDay(start)} · ${formatTime(start)}–${formatTime(end)}`
    : `${formatDay(start)} ${formatTime(start)} → ${formatDay(end)} ${formatTime(end)}`;
};

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: process.env.STUDIO_CURRENCY || "EUR", maximumFractionDigits: 0 }).format(value);
}
