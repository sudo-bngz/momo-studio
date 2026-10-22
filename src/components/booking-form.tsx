import { saveBooking } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { ButtonLink, Card, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import type { BookingEntry, ClientEntry, DeviceEntry, RoomEntry } from "@/lib/data";
import { refId } from "@/lib/data";
import { formatMoney, toLocalInput } from "@/lib/time";
import { BOOKING_STATES, CATEGORIES, SESSION_TYPES, options, type Category } from "@/lib/vocab";

export function BookingForm({
  booking,
  rooms,
  clients,
  devices,
  defaults,
  week,
}: {
  booking?: BookingEntry;
  rooms: RoomEntry[];
  clients: ClientEntry[];
  devices: DeviceEntry[];
  defaults?: { start?: string; end?: string };
  week?: string;
}) {
  const reserved = new Set((booking?.devices ?? []).map((d) => refId(d)));
  const usable = devices.filter((d) => d.state !== "sold" || reserved.has(d.id));
  const groups = new Map<Category, DeviceEntry[]>();
  for (const d of usable) groups.set(d.category, [...(groups.get(d.category) ?? []), d]);
  const bookable = rooms.filter((r) => r.bookable !== false || refId(booking?.room) === r.id);

  return (
    <ActionForm action={saveBooking} submit={booking ? "Save booking" : "Book it"} footer={<ButtonLink href={week ? `/bookings?week=${week}` : "/bookings"}>Cancel</ButtonLink>}>
      {booking ? <input type="hidden" name="id" value={booking.id} /> : null}
      {week ? <input type="hidden" name="week" value={week} /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Session" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <Input name="title" required defaultValue={booking?.title} placeholder="Artist – EP tracking" />
            </Field>
            <Field label="Starts">
              <Input name="starts_at" type="datetime-local" required defaultValue={booking ? toLocalInput(booking.starts_at) : defaults?.start} />
            </Field>
            <Field label="Ends">
              <Input name="ends_at" type="datetime-local" required defaultValue={booking ? toLocalInput(booking.ends_at) : defaults?.end} />
            </Field>
            <Field label="Room" hint={bookable.map((r) => `${r.name}: ${r.hourly_rate ? `${formatMoney(r.hourly_rate)}/h` : "—"}${r.daily_rate ? `, ${formatMoney(r.daily_rate)}/day` : ""}`).join(" · ")}>
              <Select name="room" options={bookable.map((r) => ({ value: r.id, label: r.name }))} empty="—" defaultValue={refId(booking?.room) ?? bookable[0]?.id ?? ""} />
            </Field>
            <Field label="Client" hint={<a href="/clients?new=1" className="underline">Add a client</a>}>
              <Select name="client" options={clients.map((c) => ({ value: c.id, label: c.artist_name ? `${c.artist_name} (${c.name})` : c.name }))} empty="—" defaultValue={refId(booking?.client) ?? ""} />
            </Field>
            <Field label="Type">
              <Select name="session_type" options={options(SESSION_TYPES)} empty="—" defaultValue={booking?.session_type ?? ""} />
            </Field>
            <Field label="Engineer">
              <Input name="engineer" defaultValue={booking?.engineer ?? ""} />
            </Field>
          </div>
          <Field label="Notes" className="mt-4" hint="What to prepare: patching, mics, files to load…">
            <Textarea name="notes" rows={4} defaultValue={booking?.notes ?? ""} />
          </Field>
        </Card>

        <Card title="Status & price">
          <div className="space-y-4">
            <Field label="State">
              <Select name="state" options={options(BOOKING_STATES)} defaultValue={booking?.state ?? "confirmed"} />
            </Field>
            <Field label="Price">
              <Input name="price" type="number" step="0.01" min={0} defaultValue={booking?.price ?? ""} />
            </Field>
            <Checkbox name="paid" label="Paid" defaultChecked={!!booking?.paid} />
            <div className="border-t border-line pt-4">
              <Checkbox name="allow_overlap" label="Book anyway if the room or a machine is taken" />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Assets to reserve" className="mt-6">
        <p className="mb-4 text-sm text-dim">Machines the session needs. A machine reserved by two overlapping sessions is refused unless you book anyway.</p>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...groups.entries()].map(([cat, list]) => (
            <fieldset key={cat}>
              <legend className="mb-1.5 text-xs font-medium uppercase tracking-wider text-faint">{CATEGORIES[cat]}</legend>
              <div className="space-y-1">
                {list.map((d) => (
                  <label key={d.id} className={`flex items-center gap-2 text-sm ${d.state === "in_repair" || d.state === "loaned" ? "text-faint" : ""}`}>
                    <input type="checkbox" name="devices" value={d.id} defaultChecked={reserved.has(d.id)} className="size-4 accent-amber" />
                    {d.name}
                    {d.state === "in_repair" ? <span className="text-xs text-warn">in repair</span> : d.state === "loaned" ? <span className="text-xs text-info">loaned</span> : null}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </Card>
    </ActionForm>
  );
}
