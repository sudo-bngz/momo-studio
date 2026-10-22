import type { Metadata } from "next";
import Link from "next/link";

import { deletePlaceOrClient, saveLocation, saveRoom } from "@/app/actions";
import { ActionForm, DeleteForm } from "@/components/action-form";
import { Help } from "@/components/help";
import { ButtonLink, Card, Checkbox, Empty, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { getDevices, getLocations, getRooms, refId } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { LOCATION_KINDS, locationKindLabel, translatedOptions } from "@/lib/vocab";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("places.meta.places") };
}

export default async function PlacesPage({ searchParams }: { searchParams: Promise<{ room?: string; location?: string }> }) {
  const { t, p, d } = await getI18n();
  const sp = await searchParams;
  const [rooms, locations, devices] = await Promise.all([getRooms(), getLocations(), getDevices()]);
  const room = sp.room === "new" ? null : rooms.find((r) => r.id === Number(sp.room));
  const location = sp.location === "new" ? null : locations.find((l) => l.id === Number(sp.location));
  const editingRoom = sp.room === "new" || room !== undefined;
  const editingLocation = sp.location === "new" || location !== undefined;

  return (
    <>
      <PageHeader title={t("places.title")} subtitle={t("places.subtitle")} actions={<ButtonLink href="/racks">{t("places.backToRacks")}</ButtonLink>} />
      <Help topic="places" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t("places.rooms")} actions={<Link href="/places?room=new" className="text-xs text-dim hover:text-ink">{t("places.addRoom")}</Link>}>
          {rooms.length ? (
            <ul className="divide-y divide-line">
              {rooms.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-3 rounded-sm" style={{ background: r.color ?? "#6b6e76" }} />
                    {r.name}
                    {r.bookable ? null : <span className="text-xs text-faint">{t("places.notBookable")}</span>}
                  </span>
                  <span className="flex items-center gap-3 text-xs text-dim">
                    {r.hourly_rate ? t("places.perHour", { amount: d.money(r.hourly_rate) }) : null}
                    {r.daily_rate ? t("places.perDay", { amount: d.money(r.daily_rate) }) : null}
                    <Link href={`/places?room=${r.id}`} className="hover:text-ink">
                      {t("action.edit")}
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>{t("places.noRooms")}</Empty>
          )}
        </Card>

        <Card title={t("places.locations")} actions={<Link href="/places?location=new" className="text-xs text-dim hover:text-ink">{t("places.addLocation")}</Link>}>
          {locations.length ? (
            <ul className="divide-y divide-line">
              {locations.map((l) => {
                const count = devices.filter((x) => refId(x.location) === l.id).length;
                const r = l.room && typeof l.room === "object" ? l.room : undefined;
                return (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span>
                      {l.name} <span className="text-xs text-faint">{locationKindLabel(t, l.kind)}{l.rack_units ? ` · ${l.rack_units}U` : ""}{r ? ` · ${r.name}` : ""}</span>
                    </span>
                    <span className="flex items-center gap-3 text-xs text-dim">
                      {p("places.machineCount", count)}
                      <Link href={`/places?location=${l.id}`} className="hover:text-ink">
                        {t("action.edit")}
                      </Link>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>{t("places.noLocations")}</Empty>
          )}
        </Card>
      </div>

      {editingRoom ? (
        <Card title={room ? t("places.editRoom", { name: room.name }) : t("places.newRoom")} className="mt-6">
          <ActionForm action={saveRoom} footer={<ButtonLink href="/places">{t("action.cancel")}</ButtonLink>}>
            {room ? <input type="hidden" name="id" value={room.id} /> : null}
            {room ? <input type="hidden" name="slug" value={room.slug} /> : null}
            {room?.photo && typeof room.photo === "object" ? <input type="hidden" name="photo_id" value={room.photo.id} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={t("places.field.name")}>
                <Input name="name" required defaultValue={room?.name} />
              </Field>
              <Field label={t("places.field.color")} hint={t("places.field.color.hint")}>
                <Input name="color" type="color" defaultValue={room?.color ?? "#f2a541"} className="h-[38px] p-1" />
              </Field>
              <Field label={t("places.field.hourlyRate")}>
                <Input name="hourly_rate" type="number" step="0.01" min={0} defaultValue={room?.hourly_rate ?? ""} />
              </Field>
              <Field label={t("places.field.dailyRate")}>
                <Input name="daily_rate" type="number" step="0.01" min={0} defaultValue={room?.daily_rate ?? ""} />
              </Field>
              <Field label={t("places.field.description")} className="sm:col-span-2 lg:col-span-4">
                <Textarea name="description" defaultValue={room?.description ?? ""} />
              </Field>
            </div>
            <div className="mt-3">
              <Checkbox name="bookable" label={t("places.field.bookable")} defaultChecked={room?.bookable ?? true} />
            </div>
          </ActionForm>
          {room ? (
            <div className="mt-6 border-t border-line pt-4">
              <DeleteForm
                action={deletePlaceOrClient}
                id={room.id}
                extra={{ type: "rooms" }}
                label={t("places.deleteRoom")}
                confirm={t("places.deleteRoom.confirm", { name: room.name })}
              />
            </div>
          ) : null}
        </Card>
      ) : null}

      {editingLocation ? (
        <Card title={location ? t("places.editLocation", { name: location.name }) : t("places.newLocation")} className="mt-6">
          <ActionForm action={saveLocation} footer={<ButtonLink href="/places">{t("action.cancel")}</ButtonLink>}>
            {location ? <input type="hidden" name="id" value={location.id} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={t("places.field.name")}>
                <Input name="name" required defaultValue={location?.name} placeholder="Rack A" />
              </Field>
              <Field label={t("places.field.kind")}>
                <Select name="kind" options={translatedOptions(t, LOCATION_KINDS, locationKindLabel)} defaultValue={location?.kind ?? "rack"} />
              </Field>
              <Field label={t("places.field.room")}>
                <Select name="room" options={rooms.map((r) => ({ value: r.id, label: r.name }))} empty={t("state.none")} defaultValue={refId(location?.room) ?? ""} />
              </Field>
              <Field label={t("places.field.rackUnits")} hint={t("places.field.rackUnits.hint")}>
                <Input name="rack_units" type="number" min={1} max={60} defaultValue={location?.rack_units ?? ""} />
              </Field>
              <Field label={t("places.field.notes")} className="sm:col-span-2 lg:col-span-4">
                <Textarea name="notes" defaultValue={location?.notes ?? ""} />
              </Field>
            </div>
          </ActionForm>
          {location ? (
            <div className="mt-6 border-t border-line pt-4">
              <DeleteForm
                action={deletePlaceOrClient}
                id={location.id}
                extra={{ type: "locations" }}
                label={t("places.deleteLocation")}
                confirm={t("places.deleteLocation.confirm", { name: location.name })}
              />
            </div>
          ) : null}
        </Card>
      ) : null}
    </>
  );
}
