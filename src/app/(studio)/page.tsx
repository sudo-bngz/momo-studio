import Link from "next/link";

import { Help } from "@/components/help";
import { Badge, ButtonLink, Card, Code, Empty, PageHeader, Stat } from "@/components/ui";
import { getBookings, getCables, getDevices, getMaintenance, refId } from "@/lib/data";
import { findIssues } from "@/lib/patch";
import { toPlanCable, toPlanDevice } from "@/lib/plan-data";
import { getI18n } from "@/lib/i18n";
import { issueMessage } from "@/lib/issues";
import { bookingStateLabel, bookingStateTone, deviceStateLabel, deviceStateTone } from "@/lib/vocab";

export default async function OverviewPage() {
  const { t, p, d } = await getI18n();
  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * 86_400_000);
  const [devices, cables, bookings, maintenance] = await Promise.all([
    getDevices(),
    getCables(),
    getBookings(now.toISOString(), in14.toISOString()),
    getMaintenance(),
  ]);

  const owned = devices.filter((x) => x.state !== "sold");
  const value = owned.reduce((sum, x) => sum + (x.current_value ?? x.purchase_price ?? 0), 0);
  const connected = cables.filter((c) => c.state === "connected").length;
  const broken = cables.filter((c) => c.state === "broken").length;
  const issues = findIssues(devices.map(toPlanDevice), cables.map(toPlanCable));
  const away = devices.filter((x) => x.state === "in_repair" || x.state === "loaned");
  const soon = new Date(now.getTime() + 60 * 86_400_000).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  const warranties = owned.filter((x) => x.warranty_until && x.warranty_until >= today && x.warranty_until <= soon);
  const upcoming = bookings.filter((b) => b.state !== "cancelled");
  const deviceName = new Map(devices.map((x) => [x.id, x.name]));

  return (
    <>
      <PageHeader
        title={t("overview.title")}
        subtitle={t("overview.subtitle")}
        actions={
          <>
            <ButtonLink href="/bookings/new">{t("overview.newBooking")}</ButtonLink>
            <ButtonLink href="/assets/new" primary>
              {t("overview.addAsset")}
            </ButtonLink>
          </>
        }
      />
      <Help topic="overview" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label={t("overview.stat.assets")}
          value={owned.length}
          hint={t("overview.stat.assets.hint", { count: owned.filter((x) => x.state === "in_use").length })}
        />
        <Stat label={t("overview.stat.value")} value={d.money(value)} hint={t("overview.stat.value.hint")} />
        <Stat
          label={t("overview.stat.cables")}
          value={connected}
          hint={t(broken ? "overview.stat.cables.hintBroken" : "overview.stat.cables.hint", { spare: cables.length - connected, broken })}
        />
        <Stat
          label={t("overview.stat.issues")}
          value={<Link href="/cables#issues">{issues.length}</Link>}
          hint={t(issues.length ? "overview.stat.issues.some" : "overview.stat.issues.none")}
          tone={issues.length ? "warn" : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card title={t("overview.next14")} className="lg:col-span-3" actions={<Link href="/bookings" className="text-xs text-dim hover:text-ink">{t("overview.calendar")}</Link>}>
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.map((b) => {
                const room = b.room && typeof b.room === "object" ? b.room : undefined;
                const client = b.client && typeof b.client === "object" ? b.client : undefined;
                const gear = (b.devices ?? []).map((g) => (typeof g === "number" ? deviceName.get(g) : g.name)).filter(Boolean);
                return (
                  <li key={b.id} className="flex flex-wrap items-start justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link href={`/bookings/${b.id}`} className="font-medium hover:text-amber">
                        {b.title}
                      </Link>
                      <div className="mt-0.5 text-sm text-dim">
                        {d.range(b.starts_at, b.ends_at)}
                        {room ? (
                          <>
                            {" · "}
                            <span style={{ color: room.color ?? undefined }}>{room.name}</span>
                          </>
                        ) : null}
                        {client ? ` · ${client.artist_name || client.name}` : null}
                      </div>
                      {gear.length ? <div className="mt-1 text-xs text-faint">{t("overview.assetsUsed", { list: gear.join(", ") })}</div> : null}
                    </div>
                    <Badge tone={bookingStateTone(b.state)}>{bookingStateLabel(t, b.state)}</Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>{t("overview.noSessions")}</Empty>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card title={t("overview.attention")}>
            {away.length || issues.length || warranties.length ? (
              <ul className="space-y-2 text-sm">
                {away.map((dev) => (
                  <li key={`d${dev.id}`} className="flex items-center justify-between gap-2">
                    <Link href={`/assets/${dev.id}`} className="hover:text-amber">
                      {dev.name}
                    </Link>
                    <Badge tone={deviceStateTone(dev.state)}>{deviceStateLabel(t, dev.state)}</Badge>
                  </li>
                ))}
                {warranties.map((dev) => (
                  <li key={`w${dev.id}`} className="flex items-center justify-between gap-2">
                    <Link href={`/assets/${dev.id}`} className="hover:text-amber">
                      {dev.name}
                    </Link>
                    <span className="text-xs text-warn">{t("overview.warrantyEnds", { date: d.date(dev.warranty_until!) })}</span>
                  </li>
                ))}
                {issues.slice(0, 6).map((i, k) => (
                  <li key={`i${k}`} className="text-warn">
                    <Link href={`/cables/${i.cable.id}`} className="hover:underline">
                      {issueMessage(t, i)}
                    </Link>
                  </li>
                ))}
                {issues.length > 6 ? (
                  <li>
                    <Link href="/cables#issues" className="text-xs text-dim hover:text-ink">
                      {p("overview.moreIssues", issues.length - 6)}
                    </Link>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="text-sm text-dim">{t("overview.allWell")}</p>
            )}
          </Card>

          <Card title={t("overview.maintenance")}>
            {maintenance.length ? (
              <ul className="space-y-3 text-sm">
                {maintenance.slice(0, 5).map((m) => {
                  const id = refId(m.device);
                  return (
                    <li key={m.id}>
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/assets/${id}`} className="hover:text-amber">
                          {(id ? deviceName.get(id) : undefined) ?? t("overview.unknownDevice")}
                        </Link>
                        <span className="text-xs text-faint">{d.date(m.date)}</span>
                      </div>
                      <div className="text-dim">
                        <Code>{m.kind}</Code> {m.description}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-dim">{t("overview.noMaintenance")}</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
