import { createClient } from "@gohead-cms/client";
import { cookies } from "next/headers";

import type { Booking } from "@/gohead";
import { GOHEAD_URL, SESSION_COOKIE } from "@/lib/session";
import { SESSION_TYPES } from "@/lib/vocab";

/**
 * The studio's bookings as a calendar feed, for Google Calendar, Apple
 * Calendar or a phone ("subscribe to a calendar from a URL").
 *
 * Calendar apps fetch it from their own servers, with no cookie, so a feed
 * meant for them is unlocked by a secret in the URL: set STUDIO_ICS_SECRET
 * and subscribe to /bookings.ics?key=<secret>. Without that variable the feed
 * is only served to someone signed in, which is the safe default.
 *
 * Note that Google refreshes a subscribed calendar on its own schedule, often
 * only every several hours: it is good for seeing the week, not for a change
 * you made a minute ago.
 */
export const dynamic = "force-dynamic";

const WINDOW_BACK_DAYS = 90;
const WINDOW_FORWARD_DAYS = 400;

function fold(line: string): string {
  // RFC 5545: lines are at most 75 octets, continued with a leading space.
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

const escape = (v: string) => v.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const stamp = (iso: string) => `${new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`;

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  const secret = process.env.STUDIO_ICS_SECRET;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const feedToken = process.env.GOHEAD_FEED_TOKEN;
  const bySecret = Boolean(secret && key && key === secret);
  if (!bySecret && !token) return new Response("sign in, or use the feed's key", { status: 401 });
  if (bySecret && !token && !feedToken) {
    // The key is right but nothing can read GoHead without a person's session.
    return new Response("the feed needs GOHEAD_FEED_TOKEN: run `npm run gohead:access` and restart the app", { status: 503 });
  }

  // A calendar app sends no cookie: it reads with the feed's own read-only
  // token. Someone signed in reads as themselves.
  const client = createClient({
    url: GOHEAD_URL,
    token: bySecret && feedToken ? feedToken : token,
    level: 1,
    init: { cache: "no-store" },
  });

  const now = Date.now();
  const from = new Date(now - WINDOW_BACK_DAYS * 86_400_000).toISOString();
  const to = new Date(now + WINDOW_FORWARD_DAYS * 86_400_000).toISOString();

  let bookings;
  try {
    bookings = await client.collection("bookings").findAll({
      filters: { starts_at: { $lt: to }, ends_at: { $gt: from } },
      sort: ["starts_at"],
      pageSize: 100,
      level: 1,
    });
  } catch {
    return new Response("the bookings could not be read", { status: 502 });
  }

  const host = new URL(request.url).host;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//studio manager//bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escape("Studio bookings")}`,
    "X-PUBLISHED-TTL:PT30M",
    "REFRESH-INTERVAL;VALUE=DURATION:PT30M",
  ];

  for (const b of bookings as Array<Booking & { id: number; updatedAt?: string }>) {
    const room = b.room && typeof b.room === "object" ? b.room.name : undefined;
    const client_ = b.client && typeof b.client === "object" ? b.client.artist_name || b.client.name : undefined;
    const description = [
      client_ ? `Client: ${client_}` : null,
      b.session_type ? `Type: ${SESSION_TYPES[b.session_type]}` : null,
      b.engineer ? `Engineer: ${b.engineer}` : null,
      b.price ? `Price: ${b.price}` : null,
      b.notes || null,
    ]
      .filter(Boolean)
      .join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:booking-${b.id}@${host}`,
      `DTSTAMP:${stamp(b.updatedAt ?? b.starts_at)}`,
      `DTSTART:${stamp(b.starts_at)}`,
      `DTEND:${stamp(b.ends_at)}`,
      fold(`SUMMARY:${escape(b.state === "tentative" ? `(tentative) ${b.title}` : b.title)}`),
      ...(room ? [fold(`LOCATION:${escape(room)}`)] : []),
      ...(description ? [fold(`DESCRIPTION:${escape(description)}`)] : []),
      `STATUS:${b.state === "cancelled" ? "CANCELLED" : b.state === "tentative" ? "TENTATIVE" : "CONFIRMED"}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": 'inline; filename="studio-bookings.ics"',
    },
  });
}
