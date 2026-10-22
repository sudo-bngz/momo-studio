/**
 * A device as it was read, turned back into what a write takes. GoHead's
 * update replaces the whole entry, so a page that changes one part (the
 * patchbay points) sends everything else back unchanged.
 */
import type { DeviceInput, LocationInput, RoomInput } from "@/gohead";
import { compact } from "@/lib/form";
import type { DeviceEntry, LocationEntry, RoomEntry } from "@/lib/data";

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
    map_x: d.map_x ?? undefined,
    map_y: d.map_y ?? undefined,
    midi_channel: d.midi_channel ?? undefined,
    ports: (d.ports ?? []).map(strip),
    patch_columns: d.patch_columns ?? undefined,
    patch_points: d.patch_points ? d.patch_points.map(strip) : undefined,
    console_channels: d.console_channels ?? undefined,
    channel_strips: d.channel_strips ? d.channel_strips.map(strip) : undefined,
    serial_number: d.serial_number ?? undefined,
    purchase_date: d.purchase_date ? d.purchase_date.slice(0, 10) : undefined,
    purchase_price: d.purchase_price ?? undefined,
    current_value: d.current_value ?? undefined,
    supplier: d.supplier ?? undefined,
    warranty_until: d.warranty_until ? d.warranty_until.slice(0, 10) : undefined,
    manual_url: d.manual_url ?? undefined,
    photo: id(d.photo),
    photos: d.photos?.length ? d.photos.map(id).filter((n): n is number => n !== undefined) : undefined,
    notes: d.notes ?? undefined,
  });
}

const idOf = (v: unknown) => (v && typeof v === "object" && "id" in v ? (v as { id: number }).id : typeof v === "number" ? v : undefined);
const opt = <T,>(v: T | null | undefined) => (v === null ? undefined : v);

export function toRoomInput(r: RoomEntry): RoomInput {
  return compact({
    name: r.name,
    slug: r.slug,
    color: opt(r.color),
    description: opt(r.description),
    hourly_rate: opt(r.hourly_rate),
    daily_rate: opt(r.daily_rate),
    bookable: opt(r.bookable),
    photo: idOf(r.photo),
    map_x: opt(r.map_x),
    map_y: opt(r.map_y),
    width_cm: opt(r.width_cm),
    depth_cm: opt(r.depth_cm),
  });
}

export function toLocationInput(l: LocationEntry): LocationInput {
  return compact({
    name: l.name,
    kind: l.kind,
    room: idOf(l.room),
    rack_units: opt(l.rack_units),
    notes: opt(l.notes),
    map_x: opt(l.map_x),
    map_y: opt(l.map_y),
    width_cm: opt(l.width_cm),
    depth_cm: opt(l.depth_cm),
    rotation: opt(l.rotation),
  });
}
