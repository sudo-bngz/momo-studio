import type { Metadata } from "next";
import Link from "next/link";

import { deletePlaceOrClient, saveLocation, saveRoom } from "@/app/actions";
import { ActionForm, DeleteForm } from "@/components/action-form";
import { Help } from "@/components/help";
import { ButtonLink, Card, Checkbox, Empty, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { getDevices, getLocations, getRooms, refId } from "@/lib/data";
import { formatMoney } from "@/lib/time";
import { LOCATION_KINDS, options } from "@/lib/vocab";

export const metadata: Metadata = { title: "Rooms & locations" };

export default async function PlacesPage({ searchParams }: { searchParams: Promise<{ room?: string; location?: string }> }) {
  const sp = await searchParams;
  const [rooms, locations, devices] = await Promise.all([getRooms(), getLocations(), getDevices()]);
  const room = sp.room === "new" ? null : rooms.find((r) => r.id === Number(sp.room));
  const location = sp.location === "new" ? null : locations.find((l) => l.id === Number(sp.location));
  const editingRoom = sp.room === "new" || room !== undefined;
  const editingLocation = sp.location === "new" || location !== undefined;

  return (
    <>
      <PageHeader title="Rooms & locations" subtitle="Rooms are what you book; locations are where the machines sit (racks, desks, shelves, cases)." actions={<ButtonLink href="/racks">Back to racks</ButtonLink>} />
      <Help topic="places" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Rooms" actions={<Link href="/places?room=new" className="text-xs text-dim hover:text-ink">+ Room</Link>}>
          {rooms.length ? (
            <ul className="divide-y divide-line">
              {rooms.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-3 rounded-sm" style={{ background: r.color ?? "#6b6e76" }} />
                    {r.name}
                    {r.bookable ? null : <span className="text-xs text-faint">not bookable</span>}
                  </span>
                  <span className="flex items-center gap-3 text-xs text-dim">
                    {r.hourly_rate ? `${formatMoney(r.hourly_rate)}/h` : null}
                    {r.daily_rate ? `${formatMoney(r.daily_rate)}/day` : null}
                    <Link href={`/places?room=${r.id}`} className="hover:text-ink">
                      Edit
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No rooms yet.</Empty>
          )}
        </Card>

        <Card title="Locations" actions={<Link href="/places?location=new" className="text-xs text-dim hover:text-ink">+ Location</Link>}>
          {locations.length ? (
            <ul className="divide-y divide-line">
              {locations.map((l) => {
                const count = devices.filter((d) => refId(d.location) === l.id).length;
                const r = l.room && typeof l.room === "object" ? l.room : undefined;
                return (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span>
                      {l.name} <span className="text-xs text-faint">{LOCATION_KINDS[l.kind]}{l.rack_units ? ` · ${l.rack_units}U` : ""}{r ? ` · ${r.name}` : ""}</span>
                    </span>
                    <span className="flex items-center gap-3 text-xs text-dim">
                      {count} device(s)
                      <Link href={`/places?location=${l.id}`} className="hover:text-ink">
                        Edit
                      </Link>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>No locations yet.</Empty>
          )}
        </Card>
      </div>

      {editingRoom ? (
        <Card title={room ? `Edit ${room.name}` : "New room"} className="mt-6">
          <ActionForm action={saveRoom} footer={<ButtonLink href="/places">Cancel</ButtonLink>}>
            {room ? <input type="hidden" name="id" value={room.id} /> : null}
            {room ? <input type="hidden" name="slug" value={room.slug} /> : null}
            {room?.photo && typeof room.photo === "object" ? <input type="hidden" name="photo_id" value={room.photo.id} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Name">
                <Input name="name" required defaultValue={room?.name} />
              </Field>
              <Field label="Color" hint="Shown in the calendar">
                <Input name="color" type="color" defaultValue={room?.color ?? "#f2a541"} className="h-[38px] p-1" />
              </Field>
              <Field label="Hourly rate">
                <Input name="hourly_rate" type="number" step="0.01" min={0} defaultValue={room?.hourly_rate ?? ""} />
              </Field>
              <Field label="Daily rate">
                <Input name="daily_rate" type="number" step="0.01" min={0} defaultValue={room?.daily_rate ?? ""} />
              </Field>
              <Field label="Description" className="sm:col-span-2 lg:col-span-4">
                <Textarea name="description" defaultValue={room?.description ?? ""} />
              </Field>
            </div>
            <div className="mt-3">
              <Checkbox name="bookable" label="Can be booked" defaultChecked={room?.bookable ?? true} />
            </div>
          </ActionForm>
          {room ? (
            <div className="mt-6 border-t border-line pt-4">
              <DeleteForm action={deletePlaceOrClient} id={room.id} extra={{ type: "rooms" }} label="Delete room" confirm={`Delete ${room.name}? Bookings and locations in it lose their room.`} />
            </div>
          ) : null}
        </Card>
      ) : null}

      {editingLocation ? (
        <Card title={location ? `Edit ${location.name}` : "New location"} className="mt-6">
          <ActionForm action={saveLocation} footer={<ButtonLink href="/places">Cancel</ButtonLink>}>
            {location ? <input type="hidden" name="id" value={location.id} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Name">
                <Input name="name" required defaultValue={location?.name} placeholder="Rack A" />
              </Field>
              <Field label="Kind">
                <Select name="kind" options={options(LOCATION_KINDS)} defaultValue={location?.kind ?? "rack"} />
              </Field>
              <Field label="Room">
                <Select name="room" options={rooms.map((r) => ({ value: r.id, label: r.name }))} empty="—" defaultValue={refId(location?.room) ?? ""} />
              </Field>
              <Field label="Rack units" hint="Racks only: its height in U">
                <Input name="rack_units" type="number" min={1} max={60} defaultValue={location?.rack_units ?? ""} />
              </Field>
              <Field label="Notes" className="sm:col-span-2 lg:col-span-4">
                <Textarea name="notes" defaultValue={location?.notes ?? ""} />
              </Field>
            </div>
          </ActionForm>
          {location ? (
            <div className="mt-6 border-t border-line pt-4">
              <DeleteForm action={deletePlaceOrClient} id={location.id} extra={{ type: "locations" }} label="Delete location" confirm={`Delete ${location.name}?`} />
            </div>
          ) : null}
        </Card>
      ) : null}
    </>
  );
}
