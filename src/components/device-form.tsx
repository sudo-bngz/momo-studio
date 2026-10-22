import { saveDevice } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { PortsWithTemplate } from "@/components/template-picker";
import { PhotoInput } from "@/components/photo-input";
import { ButtonLink, Card, Field, Input, Select, Textarea } from "@/components/ui";
import type { DeviceEntry, LocationEntry } from "@/lib/data";
import { refId } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { CATEGORIES, DEVICE_STATES, categoryLabel, deviceStateLabel, translatedOptions, type Category } from "@/lib/vocab";

export async function DeviceForm({ device, locations, category }: { device?: DeviceEntry; locations: LocationEntry[]; category?: Category }) {
  const { t } = await getI18n();
  // The cover first, then the rest of the gallery.
  const cover = device?.photo;
  const rest = (device?.photos ?? []).filter((m) => refId(m) !== refId(cover));
  const gallery = cover ? [cover, ...rest] : rest;
  return (
    <ActionForm
      action={saveDevice}
      submit={device ? t("assets.form.save") : t("assets.form.create")}
      footer={<ButtonLink href={device ? `/assets/${device.id}` : "/assets"}>{t("action.cancel")}</ButtonLink>}
    >
      {device ? <input type="hidden" name="id" value={device.id} /> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={t("assets.form.identity")} className="xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("assets.form.name")} hint={t("assets.form.name.hint")}>
              <Input name="name" required defaultValue={device?.name} />
            </Field>
            <Field label={t("assets.form.code")} hint={t("assets.form.code.hint")}>
              <Input name="code" required defaultValue={device?.code} placeholder="SYN-01" className="font-mono uppercase" />
            </Field>
            <Field label={t("assets.form.brand")}>
              <Input name="brand" defaultValue={device?.brand ?? ""} />
            </Field>
            <Field label={t("assets.form.model")}>
              <Input name="model" defaultValue={device?.model ?? ""} />
            </Field>
            <Field label={t("assets.form.category")}>
              <Select
                name="category"
                options={translatedOptions(t, CATEGORIES, categoryLabel)}
                defaultValue={device?.category ?? category ?? "synth"}
              />
            </Field>
            <Field label={t("assets.form.state")}>
              <Select name="state" options={translatedOptions(t, DEVICE_STATES, deviceStateLabel)} defaultValue={device?.state ?? "in_use"} />
            </Field>
            <Field label={t("assets.form.midi")} hint={t("assets.form.midi.hint")}>
              <Input name="midi_channel" type="number" min={1} max={16} defaultValue={device?.midi_channel ?? ""} />
            </Field>
            <Field label={t("assets.form.manual")}>
              <Input name="manual_url" type="url" defaultValue={device?.manual_url ?? ""} placeholder="https://" />
            </Field>
          </div>
        </Card>

        <Card title={t("assets.form.where")}>
          <div className="space-y-4">
            <Field label={t("assets.form.location")}>
              <Select
                name="location"
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
                empty={t("state.none")}
                defaultValue={refId(device?.location) ?? ""}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("assets.form.rackPosition")} hint={t("assets.form.rackPosition.hint")}>
                <Input name="rack_position" type="number" min={1} max={60} defaultValue={device?.rack_position ?? ""} />
              </Field>
              <Field label={t("assets.form.rackHeight")}>
                <Input name="rack_height" type="number" min={1} max={12} defaultValue={device?.rack_height ?? ""} />
              </Field>
            </div>
          </div>
        </Card>
      </div>

      <Card title={t("assets.form.photos")} className="mt-6">
        <p className="mb-4 text-sm text-dim">{t("assets.form.photos.hint")}</p>
        <PhotoInput existing={gallery} />
      </Card>

      <Card title={t("assets.form.ports")} className="mt-6">
        <p className="mb-4 text-sm text-dim">{t("assets.form.ports.hint")}</p>
        <PortsWithTemplate initial={device?.ports ?? []} isNew={!device} />
      </Card>

      <Card title={t("assets.form.purchase")} className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t("assets.form.serial")}>
            <Input name="serial_number" defaultValue={device?.serial_number ?? ""} className="font-mono" />
          </Field>
          <Field label={t("assets.form.boughtOn")}>
            <Input name="purchase_date" type="date" defaultValue={device?.purchase_date?.slice(0, 10) ?? ""} />
          </Field>
          <Field label={t("assets.form.supplier")}>
            <Input name="supplier" defaultValue={device?.supplier ?? ""} />
          </Field>
          <Field label={t("assets.form.price")}>
            <Input name="purchase_price" type="number" step="0.01" min={0} defaultValue={device?.purchase_price ?? ""} />
          </Field>
          <Field label={t("assets.form.value")} hint={t("assets.form.value.hint")}>
            <Input name="current_value" type="number" step="0.01" min={0} defaultValue={device?.current_value ?? ""} />
          </Field>
          <Field label={t("assets.form.warranty")}>
            <Input name="warranty_until" type="date" defaultValue={device?.warranty_until?.slice(0, 10) ?? ""} />
          </Field>
        </div>
        <Field label={t("assets.form.notes")} className="mt-4">
          <Textarea name="notes" rows={4} defaultValue={device?.notes ?? ""} />
        </Field>
      </Card>
    </ActionForm>
  );
}
