import { saveDevice } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { PortsEditor } from "@/components/ports-editor";
import { ButtonLink, Card, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import type { DeviceEntry, LocationEntry } from "@/lib/data";
import { refId } from "@/lib/data";
import { mediaSrc } from "@/lib/media";
import { CATEGORIES, DEVICE_STATES, options, type Category } from "@/lib/vocab";

export function DeviceForm({ device, locations, category }: { device?: DeviceEntry; locations: LocationEntry[]; category?: Category }) {
  const photo = mediaSrc(device?.photo);
  const photoId = device?.photo && typeof device.photo === "object" ? device.photo.id : typeof device?.photo === "number" ? device.photo : undefined;
  return (
    <ActionForm
      action={saveDevice}
      submit={device ? "Save changes" : "Add to the studio"}
      footer={<ButtonLink href={device ? `/gear/${device.id}` : "/gear"}>Cancel</ButtonLink>}
    >
      {device ? <input type="hidden" name="id" value={device.id} /> : null}
      {photoId ? <input type="hidden" name="photo_id" value={photoId} /> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Identity" className="xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" hint="As you call it in the studio: “Prophet”, “Rack JV”">
              <Input name="name" required defaultValue={device?.name} />
            </Field>
            <Field label="Code" hint="Printed on its label, used by cables: SYN-01, FX-02…">
              <Input name="code" required defaultValue={device?.code} placeholder="SYN-01" className="font-mono uppercase" />
            </Field>
            <Field label="Brand">
              <Input name="brand" defaultValue={device?.brand ?? ""} />
            </Field>
            <Field label="Model">
              <Input name="model" defaultValue={device?.model ?? ""} />
            </Field>
            <Field label="Category">
              <Select name="category" options={options(CATEGORIES)} defaultValue={device?.category ?? category ?? "synth"} />
            </Field>
            <Field label="State">
              <Select name="state" options={options(DEVICE_STATES)} defaultValue={device?.state ?? "in_use"} />
            </Field>
            <Field label="MIDI channel" hint="1–16, if it listens on one">
              <Input name="midi_channel" type="number" min={1} max={16} defaultValue={device?.midi_channel ?? ""} />
            </Field>
            <Field label="Manual or product page">
              <Input name="manual_url" type="url" defaultValue={device?.manual_url ?? ""} placeholder="https://" />
            </Field>
          </div>
        </Card>

        <Card title="Where it lives">
          <div className="space-y-4">
            <Field label="Location">
              <Select name="location" options={locations.map((l) => ({ value: l.id, label: l.name }))} empty="—" defaultValue={refId(device?.location) ?? ""} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rack position" hint="Top unit, counting from 1 at the top">
                <Input name="rack_position" type="number" min={1} max={60} defaultValue={device?.rack_position ?? ""} />
              </Field>
              <Field label="Height (U)">
                <Input name="rack_height" type="number" min={1} max={12} defaultValue={device?.rack_height ?? ""} />
              </Field>
            </div>
            <Field label="Photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {photo ? <img src={photo} alt="" className="mb-2 max-h-40 rounded-md border border-line object-cover" /> : null}
              <input name="photo" type="file" accept="image/*" className="block w-full text-sm text-dim file:mr-3 file:rounded file:border-0 file:bg-raised file:px-3 file:py-1.5 file:text-ink" />
            </Field>
            {photo ? <Checkbox name="remove_photo" label="Remove the photo" /> : null}
          </div>
        </Card>
      </div>

      <Card title="Ports" className="mt-6">
        <p className="mb-4 text-sm text-dim">
          The sockets you patch. Cables plug into ports by name, so name them as printed on the device (“Out L”, “MIDI In”, “CV In 2”).
        </p>
        <PortsEditor initial={device?.ports ?? []} />
      </Card>

      <Card title="Purchase & value" className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Serial number">
            <Input name="serial_number" defaultValue={device?.serial_number ?? ""} className="font-mono" />
          </Field>
          <Field label="Bought on">
            <Input name="purchase_date" type="date" defaultValue={device?.purchase_date?.slice(0, 10) ?? ""} />
          </Field>
          <Field label="Supplier">
            <Input name="supplier" defaultValue={device?.supplier ?? ""} />
          </Field>
          <Field label="Purchase price">
            <Input name="purchase_price" type="number" step="0.01" min={0} defaultValue={device?.purchase_price ?? ""} />
          </Field>
          <Field label="Current value" hint="For insurance and the studio's total">
            <Input name="current_value" type="number" step="0.01" min={0} defaultValue={device?.current_value ?? ""} />
          </Field>
          <Field label="Warranty until">
            <Input name="warranty_until" type="date" defaultValue={device?.warranty_until?.slice(0, 10) ?? ""} />
          </Field>
        </div>
        <Field label="Notes" className="mt-4">
          <Textarea name="notes" rows={4} defaultValue={device?.notes ?? ""} />
        </Field>
      </Card>
    </ActionForm>
  );
}
