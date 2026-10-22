import { saveBooking } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { ButtonLink, Card, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import type { BookingEntry, ClientEntry, DeviceEntry, RoomEntry } from "@/lib/data";
import { refId } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { toLocalInput } from "@/lib/time";
import {
  BOOKING_STATES,
  SESSION_TYPES,
  bookingStateLabel,
  categoryLabel,
  deviceStateLabel,
  sessionTypeLabel,
  translatedOptions,
  type Category,
} from "@/lib/vocab";

export async function BookingForm({
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
  const { t, d } = await getI18n();
  const reserved = new Set((booking?.devices ?? []).map((dev) => refId(dev)));
  const usable = devices.filter((dev) => dev.state !== "sold" || reserved.has(dev.id));
  const groups = new Map<Category, DeviceEntry[]>();
  for (const dev of usable) groups.set(dev.category, [...(groups.get(dev.category) ?? []), dev]);
  const bookable = rooms.filter((r) => r.bookable !== false || refId(booking?.room) === r.id);

  const rates = (r: RoomEntry) => {
    const parts = [r.hourly_rate ? t("bookings.form.perHour", { price: d.money(r.hourly_rate) }) : t("state.none")];
    if (r.daily_rate) parts.push(t("bookings.form.perDay", { price: d.money(r.daily_rate) }));
    return t("bookings.form.roomRate", { room: r.name, rates: parts.join(", ") });
  };

  return (
    <ActionForm
      action={saveBooking}
      submit={booking ? t("bookings.form.save") : t("bookings.form.book")}
      footer={<ButtonLink href={week ? `/bookings?week=${week}` : "/bookings"}>{t("action.cancel")}</ButtonLink>}
    >
      {booking ? <input type="hidden" name="id" value={booking.id} /> : null}
      {week ? <input type="hidden" name="week" value={week} /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={t("bookings.form.session")} className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("bookings.form.title")} className="sm:col-span-2">
              <Input name="title" required defaultValue={booking?.title} placeholder={t("bookings.form.titlePlaceholder")} />
            </Field>
            <Field label={t("bookings.form.starts")}>
              <Input name="starts_at" type="datetime-local" required defaultValue={booking ? toLocalInput(booking.starts_at) : defaults?.start} />
            </Field>
            <Field label={t("bookings.form.ends")}>
              <Input name="ends_at" type="datetime-local" required defaultValue={booking ? toLocalInput(booking.ends_at) : defaults?.end} />
            </Field>
            <Field label={t("bookings.form.room")} hint={bookable.map(rates).join(" · ")}>
              <Select
                name="room"
                options={bookable.map((r) => ({ value: r.id, label: r.name }))}
                empty={t("state.none")}
                defaultValue={refId(booking?.room) ?? bookable[0]?.id ?? ""}
              />
            </Field>
            <Field
              label={t("bookings.form.client")}
              hint={
                <a href="/clients?new=1" className="underline">
                  {t("bookings.clients.addOne")}
                </a>
              }
            >
              <Select
                name="client"
                options={clients.map((c) => ({ value: c.id, label: c.artist_name ? `${c.artist_name} (${c.name})` : c.name }))}
                empty={t("state.none")}
                defaultValue={refId(booking?.client) ?? ""}
              />
            </Field>
            <Field label={t("bookings.form.type")}>
              <Select
                name="session_type"
                options={translatedOptions(t, SESSION_TYPES, sessionTypeLabel)}
                empty={t("state.none")}
                defaultValue={booking?.session_type ?? ""}
              />
            </Field>
            <Field label={t("bookings.form.engineer")}>
              <Input name="engineer" defaultValue={booking?.engineer ?? ""} />
            </Field>
          </div>
          <Field label={t("bookings.notes")} className="mt-4" hint={t("bookings.form.notesHint")}>
            <Textarea name="notes" rows={4} defaultValue={booking?.notes ?? ""} />
          </Field>
        </Card>

        <Card title={t("bookings.form.statusPrice")}>
          <div className="space-y-4">
            <Field label={t("bookings.form.state")}>
              <Select name="state" options={translatedOptions(t, BOOKING_STATES, bookingStateLabel)} defaultValue={booking?.state ?? "confirmed"} />
            </Field>
            <Field label={t("bookings.form.price")}>
              <Input name="price" type="number" step="0.01" min={0} defaultValue={booking?.price ?? ""} />
            </Field>
            <Checkbox name="paid" label={t("bookings.form.paid")} defaultChecked={!!booking?.paid} />
            <div className="border-t border-line pt-4">
              <Checkbox name="allow_overlap" label={t("bookings.form.allowOverlap")} />
            </div>
          </div>
        </Card>
      </div>

      <Card title={t("bookings.form.assets")} className="mt-6">
        <p className="mb-4 text-sm text-dim">{t("bookings.form.assetsHint")}</p>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...groups.entries()].map(([cat, list]) => (
            <fieldset key={cat}>
              <legend className="mb-1.5 text-xs font-medium uppercase tracking-wider text-faint">{categoryLabel(t, cat)}</legend>
              <div className="space-y-1">
                {list.map((dev) => (
                  <label key={dev.id} className={`flex items-center gap-2 text-sm ${dev.state === "in_repair" || dev.state === "loaned" ? "text-faint" : ""}`}>
                    <input type="checkbox" name="devices" value={dev.id} defaultChecked={reserved.has(dev.id)} className="size-4 accent-amber" />
                    {dev.name}
                    {dev.state === "in_repair" ? (
                      <span className="text-xs text-warn">{deviceStateLabel(t, dev.state)}</span>
                    ) : dev.state === "loaned" ? (
                      <span className="text-xs text-info">{deviceStateLabel(t, dev.state)}</span>
                    ) : null}
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
