import type { Metadata } from "next";
import Link from "next/link";

import { Badge, ButtonLink, Card, Empty, PageHeader } from "@/components/ui";
import { getBookings, getRooms, refId, type BookingEntry } from "@/lib/data";
import { addDays, formatDay, formatMoney, formatRange, fromLocal, localDate, localMinutes, mondayOf } from "@/lib/time";
import { BOOKING_STATES, SESSION_TYPES } from "@/lib/vocab";

export const metadata: Metadata = { title: "Bookings" };

const HOUR_PX = 36;

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ week?: string; room?: string }> }) {
  const sp = await searchParams;
  const today = localDate(new Date());
  const week = mondayOf(/^\d{4}-\d{2}-\d{2}$/.test(sp.week ?? "") ? sp.week! : today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const from = fromLocal(week).toISOString();
  const to = fromLocal(addDays(week, 7)).toISOString();
  const [all, rooms] = await Promise.all([getBookings(from, to), getRooms()]);
  const roomFilter = Number(sp.room) || undefined;
  const bookings = all.filter((b) => !roomFilter || refId(b.room) === roomFilter);

  // Hours shown: 8:00–24:00, stretched to fit early or late sessions.
  let startHour = 8;
  let endHour = 24;
  for (const b of bookings) {
    for (const day of days) {
      const seg = segment(b, day);
      if (!seg) continue;
      startHour = Math.min(startHour, Math.floor(seg.start / 60));
      endHour = Math.max(endHour, Math.ceil(seg.end / 60));
    }
  }
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const income = bookings.filter((b) => b.state !== "cancelled").reduce((s, b) => s + (b.price ?? 0), 0);
  const query = (w: string) => `/bookings?week=${w}${roomFilter ? `&room=${roomFilter}` : ""}`;

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle={`Week of ${formatDay(fromLocal(week))} · ${bookings.filter((b) => b.state !== "cancelled").length} sessions · ${formatMoney(income)}`}
        actions={
          <>
            <ButtonLink href={query(addDays(week, -7))}>←</ButtonLink>
            <ButtonLink href={query(mondayOf(today))}>This week</ButtonLink>
            <ButtonLink href={query(addDays(week, 7))}>→</ButtonLink>
            <ButtonLink href={`/bookings/new?week=${week}`} primary>
              New booking
            </ButtonLink>
          </>
        }
      />

      {rooms.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <Link href={`/bookings?week=${week}`} className={`rounded-full border px-3 py-1 ${!roomFilter ? "border-amber text-amber" : "border-line text-dim"}`}>
            All rooms
          </Link>
          {rooms.map((r) => (
            <Link
              key={r.id}
              href={`/bookings?week=${week}&room=${r.id}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${roomFilter === r.id ? "border-amber text-amber" : "border-line text-dim"}`}
            >
              <span className="size-2 rounded-full" style={{ background: r.color ?? "#6b6e76" }} />
              {r.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-line bg-panel">
        <div className="grid min-w-[760px]" style={{ gridTemplateColumns: `48px repeat(7, 1fr)` }}>
          <div className="border-b border-line" />
          {days.map((d) => (
            <div key={d} className={`border-b border-l border-line px-2 py-2 text-xs ${d === today ? "text-amber" : "text-dim"}`}>
              <Link href={`/bookings/new?date=${d}`} className="hover:text-ink" title="Book this day">
                {formatDay(fromLocal(d))}
              </Link>
            </div>
          ))}
          <div className="relative" style={{ height: hours.length * HOUR_PX }}>
            {hours.map((h, i) => (
              <div key={h} className="absolute right-1 text-[10px] text-faint" style={{ top: i * HOUR_PX - 6 }}>
                {i ? `${String(h % 24).padStart(2, "0")}:00` : ""}
              </div>
            ))}
          </div>
          {days.map((d) => (
            <div key={d} className={`relative border-l border-line ${d === today ? "bg-amber/[0.03]" : ""}`} style={{ height: hours.length * HOUR_PX }}>
              {hours.map((h, i) => (
                <div key={h} className="absolute inset-x-0 border-t border-line/60" style={{ top: i * HOUR_PX }} />
              ))}
              {bookings.map((b) => {
                const seg = segment(b, d);
                if (!seg) return null;
                const room = b.room && typeof b.room === "object" ? b.room : undefined;
                const client = b.client && typeof b.client === "object" ? b.client : undefined;
                const color = room?.color ?? "#6b6e76";
                const top = ((seg.start - startHour * 60) / 60) * HOUR_PX;
                const height = Math.max(18, ((seg.end - seg.start) / 60) * HOUR_PX - 2);
                return (
                  <Link
                    key={b.id}
                    href={`/bookings/${b.id}`}
                    className={`absolute inset-x-1 overflow-hidden rounded px-1.5 py-1 text-[11px] leading-tight hover:brightness-125 ${b.state === "cancelled" ? "line-through opacity-50" : ""}`}
                    style={{
                      top,
                      height,
                      background: `color-mix(in srgb, ${color} ${b.state === "tentative" ? 14 : 28}%, #18191c)`,
                      borderLeft: `3px ${b.state === "tentative" ? "dashed" : "solid"} ${color}`,
                    }}
                  >
                    <div className="font-medium text-ink">{b.title}</div>
                    <div className="text-dim">
                      {fmtMin(seg.start)}–{fmtMin(seg.end)}
                      {client ? ` · ${client.artist_name || client.name}` : ""}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Card title="This week" className="mt-6">
        {bookings.length ? (
          <ul className="divide-y divide-line">
            {bookings.map((b) => {
              const room = b.room && typeof b.room === "object" ? b.room : undefined;
              const client = b.client && typeof b.client === "object" ? b.client : undefined;
              return (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                  <div>
                    <Link href={`/bookings/${b.id}`} className="font-medium hover:text-amber">
                      {b.title}
                    </Link>
                    <div className="text-xs text-dim">
                      {formatRange(b.starts_at, b.ends_at)}
                      {room ? ` · ${room.name}` : ""}
                      {client ? ` · ${client.name}` : ""}
                      {b.session_type ? ` · ${SESSION_TYPES[b.session_type]}` : ""}
                      {b.engineer ? ` · with ${b.engineer}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.price ? <span className="text-xs tabular-nums text-dim">{formatMoney(b.price)}{b.paid ? " · paid" : ""}</span> : null}
                    <Badge tone={BOOKING_STATES[b.state].tone}>{BOOKING_STATES[b.state].label}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>Nothing booked this week.</Empty>
        )}
      </Card>
    </>
  );
}

/** The part of a booking on a local day, in minutes from that day's midnight. */
function segment(b: BookingEntry, day: string): { start: number; end: number } | null {
  const start = new Date(b.starts_at);
  const end = new Date(b.ends_at);
  const dayStart = fromLocal(day);
  const dayEnd = fromLocal(addDays(day, 1));
  if (end <= dayStart || start >= dayEnd) return null;
  const s = start < dayStart ? 0 : localMinutes(start);
  const e = end >= dayEnd ? 24 * 60 : localMinutes(end);
  return e > s ? { start: s, end: e } : null;
}

function fmtMin(m: number) {
  return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
