import Link from "next/link";

import { Badge, ButtonLink, Card, Code, Empty, PageHeader, Stat } from "@/components/ui";
import { getBookings, getCables, getDevices, getMaintenance, refId } from "@/lib/data";
import { findIssues } from "@/lib/patch";
import { toPlanCable, toPlanDevice } from "@/lib/plan-data";
import { formatDate, formatMoney, formatRange } from "@/lib/time";
import { BOOKING_STATES, DEVICE_STATES } from "@/lib/vocab";

export default async function OverviewPage() {
  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * 86_400_000);
  const [devices, cables, bookings, maintenance] = await Promise.all([
    getDevices(),
    getCables(),
    getBookings(now.toISOString(), in14.toISOString()),
    getMaintenance(),
  ]);

  const owned = devices.filter((d) => d.state !== "sold");
  const value = owned.reduce((s, d) => s + (d.current_value ?? d.purchase_price ?? 0), 0);
  const connected = cables.filter((c) => c.state === "connected").length;
  const broken = cables.filter((c) => c.state === "broken").length;
  const issues = findIssues(devices.map(toPlanDevice), cables.map(toPlanCable));
  const away = devices.filter((d) => d.state === "in_repair" || d.state === "loaned");
  const soon = new Date(now.getTime() + 60 * 86_400_000).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  const warranties = owned.filter((d) => d.warranty_until && d.warranty_until >= today && d.warranty_until <= soon);
  const upcoming = bookings.filter((b) => b.state !== "cancelled");
  const deviceName = new Map(devices.map((d) => [d.id, d.name]));

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="What's in the studio, how it's wired, and who's coming."
        actions={
          <>
            <ButtonLink href="/bookings/new">New booking</ButtonLink>
            <ButtonLink href="/assets/new" primary>
              Add an asset
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Assets" value={owned.length} hint={`${owned.filter((d) => d.state === "in_use").length} in use`} />
        <Stat label="Total value" value={formatMoney(value)} hint="current value, or purchase price" />
        <Stat label="Cables" value={connected} hint={`connected · ${cables.length - connected} spare or broken${broken ? ` (${broken} broken)` : ""}`} />
        <Stat
          label="Patch issues"
          value={<Link href="/cables#issues">{issues.length}</Link>}
          hint={issues.length ? "busy ports, unknown ports, mismatches" : "the plan is consistent"}
          tone={issues.length ? "warn" : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card title="Next 14 days" className="lg:col-span-3" actions={<Link href="/bookings" className="text-xs text-dim hover:text-ink">Calendar →</Link>}>
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.map((b) => {
                const room = b.room && typeof b.room === "object" ? b.room : undefined;
                const client = b.client && typeof b.client === "object" ? b.client : undefined;
                const gear = (b.devices ?? []).map((d) => (typeof d === "number" ? deviceName.get(d) : d.name)).filter(Boolean);
                return (
                  <li key={b.id} className="flex flex-wrap items-start justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link href={`/bookings/${b.id}`} className="font-medium hover:text-amber">
                        {b.title}
                      </Link>
                      <div className="mt-0.5 text-sm text-dim">
                        {formatRange(b.starts_at, b.ends_at)}
                        {room ? (
                          <>
                            {" · "}
                            <span style={{ color: room.color ?? undefined }}>{room.name}</span>
                          </>
                        ) : null}
                        {client ? ` · ${client.artist_name || client.name}` : null}
                      </div>
                      {gear.length ? <div className="mt-1 text-xs text-faint">Assets: {gear.join(", ")}</div> : null}
                    </div>
                    <Badge tone={BOOKING_STATES[b.state].tone}>{BOOKING_STATES[b.state].label}</Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>No sessions booked in the next two weeks.</Empty>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card title="Needs attention">
            {away.length || issues.length || warranties.length ? (
              <ul className="space-y-2 text-sm">
                {away.map((d) => (
                  <li key={`d${d.id}`} className="flex items-center justify-between gap-2">
                    <Link href={`/assets/${d.id}`} className="hover:text-amber">
                      {d.name}
                    </Link>
                    <Badge tone={DEVICE_STATES[d.state].tone}>{DEVICE_STATES[d.state].label}</Badge>
                  </li>
                ))}
                {warranties.map((d) => (
                  <li key={`w${d.id}`} className="flex items-center justify-between gap-2">
                    <Link href={`/assets/${d.id}`} className="hover:text-amber">
                      {d.name}
                    </Link>
                    <span className="text-xs text-warn">warranty ends {formatDate(d.warranty_until!)}</span>
                  </li>
                ))}
                {issues.slice(0, 6).map((i, k) => (
                  <li key={`i${k}`} className="text-warn">
                    <Link href={`/cables/${i.cable.id}`} className="hover:underline">
                      {i.message}
                    </Link>
                  </li>
                ))}
                {issues.length > 6 ? (
                  <li>
                    <Link href="/cables#issues" className="text-xs text-dim hover:text-ink">
                      {issues.length - 6} more issues →
                    </Link>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="text-sm text-dim">Nothing: every machine is home and the plan is consistent.</p>
            )}
          </Card>

          <Card title="Recent maintenance">
            {maintenance.length ? (
              <ul className="space-y-3 text-sm">
                {maintenance.slice(0, 5).map((m) => {
                  const id = refId(m.device);
                  return (
                    <li key={m.id}>
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/assets/${id}`} className="hover:text-amber">
                          {id ? deviceName.get(id) ?? "Unknown device" : "Unknown device"}
                        </Link>
                        <span className="text-xs text-faint">{formatDate(m.date)}</span>
                      </div>
                      <div className="text-dim">
                        <Code>{m.kind}</Code> {m.description}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-dim">No maintenance logged yet. Log repairs and services from a device&apos;s page.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
