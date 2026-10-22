/**
 * A device as it was read, turned back into what a write takes. GoHead's
 * update replaces the whole entry, so a page that changes one part (the
 * patchbay points) sends everything else back unchanged.
 */
import type { DeviceInput } from "@/gohead";
import { compact } from "@/lib/form";
import type { DeviceEntry } from "@/lib/data";

const strip = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== "")) as T;

export function toDeviceInput(d: DeviceEntry): DeviceInput {
  const id = (v: unknown) => (v && typeof v === "object" && "id" in v ? (v as { id: number }).id : typeof v === "number" ? v : undefined);
  return compact({
    name: d.name,
    code: d.code,
    brand: d.brand ?? undefined,
    model: d.model ?? undefined,
    category: d.category,
    state: d.state,
    location: id(d.location),
    rack_position: d.rack_position ?? undefined,
    rack_height: d.rack_height ?? undefined,
    midi_channel: d.midi_channel ?? undefined,
    ports: (d.ports ?? []).map(strip),
    patch_columns: d.patch_columns ?? undefined,
    patch_points: d.patch_points ? d.patch_points.map(strip) : undefined,
    serial_number: d.serial_number ?? undefined,
    purchase_date: d.purchase_date ? d.purchase_date.slice(0, 10) : undefined,
    purchase_price: d.purchase_price ?? undefined,
    current_value: d.current_value ?? undefined,
    supplier: d.supplier ?? undefined,
    warranty_until: d.warranty_until ? d.warranty_until.slice(0, 10) : undefined,
    manual_url: d.manual_url ?? undefined,
    photo: id(d.photo),
    notes: d.notes ?? undefined,
  });
}
