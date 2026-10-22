import type { Metadata } from "next";
import Link from "next/link";

import { Badge, ButtonLink, Card, Code, Empty, PageHeader } from "@/components/ui";
import { getDevices, getLocations, refId, type DeviceEntry, type LocationEntry } from "@/lib/data";
import { CATEGORIES, DEVICE_STATES, LOCATION_KINDS } from "@/lib/vocab";

export const metadata: Metadata = { title: "Racks & places" };

const U = 30; // px per rack unit

function Rack({ location, devices }: { location: LocationEntry; devices: DeviceEntry[] }) {
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
    <Card title={location.name} actions={<span className="text-xs text-faint">{used}/{units} U used</span>}>
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
              {d.state !== "in_use" ? <Badge tone={DEVICE_STATES[d.state].tone}>{DEVICE_STATES[d.state].label}</Badge> : null}
            </Link>
          ))}
        </div>
      </div>
      {overlaps.length || overflow.length ? (
        <p className="mt-3 text-xs text-warn">
          {overlaps.length ? `Two devices claim U${overlaps.join(", U")}. ` : ""}
          {overflow.length ? `${overflow.map((d) => d.name).join(", ")} go past U${units}.` : ""}
        </p>
      ) : null}
      {loose.length ? (
        <p className="mt-3 text-xs text-dim">
          In this rack without a position: {loose.map((d) => d.name).join(", ")}. Set their rack position to place them.
        </p>
      ) : null}
    </Card>
  );
}

function Spot({ location, devices }: { location: LocationEntry; devices: DeviceEntry[] }) {
  return (
    <Card title={location.name} actions={<span className="text-xs text-faint">{LOCATION_KINDS[location.kind]}</span>}>
      {devices.length ? (
        <ul className="space-y-1.5 text-sm">
          {devices.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2">
              <Link href={`/assets/${d.id}`} className="truncate hover:text-amber">
                <Code>{d.code}</Code> {d.name}
              </Link>
              <span className="whitespace-nowrap text-xs text-faint">{CATEGORIES[d.category]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-faint">Empty</p>
      )}
      {location.notes ? <p className="mt-3 border-t border-line pt-3 text-xs text-dim">{location.notes}</p> : null}
    </Card>
  );
}

export default async function RacksPage() {
  const [devices, locations] = await Promise.all([getDevices(), getLocations()]);
  const present = devices.filter((d) => d.state !== "sold");
  const at = (id: number) => present.filter((d) => refId(d.location) === id).sort((a, b) => (a.rack_position ?? 99) - (b.rack_position ?? 99));
  const nowhere = present.filter((d) => !refId(d.location));

  // Grouped by room, racks first.
  const rooms = new Map<string, LocationEntry[]>();
  for (const l of locations) {
    const room = l.room && typeof l.room === "object" ? l.room.name : "No room";
    rooms.set(room, [...(rooms.get(room) ?? []), l]);
  }

  return (
    <>
      <PageHeader
        title="Racks & places"
        subtitle="Where every machine sits. Rack positions count from U1 at the top."
        actions={
          <>
            <ButtonLink href="/map">Studio map</ButtonLink>
            <ButtonLink href="/places">Rooms & locations</ButtonLink>
          </>
        }
      />
      {locations.length === 0 ? <Empty>No locations yet: add your racks, desks and shelves under Rooms & locations.</Empty> : null}
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
        <Card title="Not placed">
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
