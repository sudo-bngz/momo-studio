import type { Metadata } from "next";
import Link from "next/link";

import { Help } from "@/components/help";
import { Badge, ButtonLink, Card, Code, Empty, PageHeader } from "@/components/ui";
import { getDevices, getLocations, refId, type DeviceEntry, type LocationEntry } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { categoryLabel, deviceStateLabel, deviceStateTone, locationKindLabel } from "@/lib/vocab";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("places.meta.racks") };
}

const U = 30; // px per rack unit

async function Rack({ location, devices }: { location: LocationEntry; devices: DeviceEntry[] }) {
  const { t, p } = await getI18n();
  const units = location.rack_units ?? Math.max(1, ...devices.map((d) => (d.rack_position ?? 1) + (d.rack_height ?? 1) - 1));
  const placed = devices.filter((d) => d.rack_position);
  const loose = devices.filter((d) => !d.rack_position);
  // Units claimed by more than one device.
  const claims = new Map<number, number>();
  for (const d of placed) for (let u = d.rack_position!; u < d.rack_position! + (d.rack_height ?? 1); u++) claims.set(u, (claims.get(u) ?? 0) + 1);
  const overlaps = [...claims.entries()].filter(([, n]) => n > 1).map(([u]) => u);
  const overflow = placed.filter((d) => d.rack_position! + (d.rack_height ?? 1) - 1 > units);
  const used = [...claims.keys()].filter((u) => u <= units).length;

  return (
    <Card title={location.name} actions={<span className="text-xs text-faint">{t("places.racks.unitsUsed", { used, units })}</span>}>
      <div className="flex gap-2">
        <div className="flex flex-col text-right font-mono text-[10px] text-faint" aria-hidden>
          {Array.from({ length: units }, (_, i) => (
            <div key={i} style={{ height: U }} className="flex items-center justify-end pr-1">
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative flex-1 rounded border-x-4 border-line-strong bg-bg" style={{ height: units * U }}>
          {Array.from({ length: units }, (_, i) => (
            <div key={i} className="absolute inset-x-0 border-t border-dashed border-line" style={{ top: i * U }} />
          ))}
          {placed.map((d) => (
            <Link
              key={d.id}
              href={`/assets/${d.id}`}
              className="absolute inset-x-1 flex items-center justify-between gap-2 overflow-hidden rounded-sm border border-line-strong bg-raised px-2 hover:border-amber"
              style={{ top: (d.rack_position! - 1) * U + 2, height: (d.rack_height ?? 1) * U - 4 }}
            >
              <span className="truncate text-sm">
                <Code>{d.code}</Code> {d.name}
              </span>
              {d.state !== "in_use" ? <Badge tone={deviceStateTone(d.state)}>{deviceStateLabel(t, d.state)}</Badge> : null}
            </Link>
          ))}
        </div>
      </div>
      {overlaps.length || overflow.length ? (
        <p className="mt-3 text-xs text-warn">
          {overlaps.length ? `${t("places.racks.overlap", { units: overlaps.map((u) => `U${u}`).join(", ") })} ` : ""}
          {overflow.length ? p("places.racks.overflow", overflow.length, { names: overflow.map((d) => d.name).join(", "), units }) : ""}
        </p>
      ) : null}
      {loose.length ? (
        <p className="mt-3 text-xs text-dim">{p("places.racks.loose", loose.length, { names: loose.map((d) => d.name).join(", ") })}</p>
      ) : null}
    </Card>
  );
}

async function Spot({ location, devices }: { location: LocationEntry; devices: DeviceEntry[] }) {
  const { t } = await getI18n();
  return (
    <Card title={location.name} actions={<span className="text-xs text-faint">{locationKindLabel(t, location.kind)}</span>}>
      {devices.length ? (
        <ul className="space-y-1.5 text-sm">
          {devices.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2">
              <Link href={`/assets/${d.id}`} className="truncate hover:text-amber">
                <Code>{d.code}</Code> {d.name}
              </Link>
              <span className="whitespace-nowrap text-xs text-faint">{categoryLabel(t, d.category)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-faint">{t("places.racks.empty")}</p>
      )}
      {location.notes ? <p className="mt-3 border-t border-line pt-3 text-xs text-dim">{location.notes}</p> : null}
    </Card>
  );
}

export default async function RacksPage() {
  const { t } = await getI18n();
  const [devices, locations] = await Promise.all([getDevices(), getLocations()]);
  const present = devices.filter((d) => d.state !== "sold");
  const at = (id: number) => present.filter((d) => refId(d.location) === id).sort((a, b) => (a.rack_position ?? 99) - (b.rack_position ?? 99));
  const nowhere = present.filter((d) => !refId(d.location));

  // Grouped by room, racks first.
  const rooms = new Map<string, LocationEntry[]>();
  for (const l of locations) {
    const room = l.room && typeof l.room === "object" ? l.room.name : t("places.racks.noRoom");
    rooms.set(room, [...(rooms.get(room) ?? []), l]);
  }

  return (
    <>
      <PageHeader
        title={t("places.racks.title")}
        subtitle={t("places.racks.subtitle")}
        actions={
          <>
            <ButtonLink href="/map">{t("places.action.studioMap")}</ButtonLink>
            <ButtonLink href="/places">{t("places.action.roomsLocations")}</ButtonLink>
          </>
        }
      />
      <Help topic="racks" />
      {locations.length === 0 ? <Empty>{t("places.racks.none")}</Empty> : null}
      {[...rooms.entries()].map(([room, locs]) => (
        <section key={room} className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">{room}</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {locs
              .sort((a, b) => Number(b.kind === "rack") - Number(a.kind === "rack") || a.name.localeCompare(b.name))
              .map((l) => (l.kind === "rack" ? <Rack key={l.id} location={l} devices={at(l.id)} /> : <Spot key={l.id} location={l} devices={at(l.id)} />))}
          </div>
        </section>
      ))}
      {nowhere.length ? (
        <Card title={t("places.racks.notPlaced")}>
          <ul className="flex flex-wrap gap-2 text-sm">
            {nowhere.map((d) => (
              <li key={d.id}>
                <Link href={`/assets/${d.id}/edit`} className="rounded border border-line px-2 py-1 hover:border-amber">
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
