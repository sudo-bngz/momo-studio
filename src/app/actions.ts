"use server";

/**
 * Every write of the app. Each action runs as the signed-in GoHead user
 * (src/lib/session.ts), so GoHead checks permissions and validates values;
 * the checks here are about the studio: free ports, overlapping bookings.
 */
import { isGoHeadError } from "@gohead-cms/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { BookingInput, CableInput, ClientInput, DeviceInput, LocationInput, MaintenanceInput, PatchPointInput, PortInput, RoomInput } from "@/gohead";
import { getBookings, getCables, getDevices, refId } from "@/lib/data";
import { toDeviceInput, toLocationInput, toRoomInput } from "@/lib/device-input";
import { compact, failure, FieldError, Fields, type FormState } from "@/lib/form";
import { cablesByPort, portKey } from "@/lib/patch";
import { toPlanCable } from "@/lib/plan-data";
import { signIn, signOut, withSession } from "@/lib/session";
import {
  BOOKING_STATES,
  CABLE_STATES,
  CATEGORIES,
  CONNECTORS,
  DEVICE_STATES,
  DIRECTIONS,
  LOCATION_KINDS,
  PATCH_MODES,
  SESSION_TYPES,
  SIGNALS,
} from "@/lib/vocab";

// ---- Session ----

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const username = f.str("username");
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  if (!username || !password) return { error: "Enter your GoHead username and password." };
  try {
    await signIn(username, password);
  } catch (err) {
    if (isGoHeadError(err) && (err.status === 401 || err.status === 400)) return { error: "Wrong username or password." };
    if (isGoHeadError(err) && err.status === 429) return { error: "Too many attempts: wait a minute and try again." };
    return failure(err);
  }
  const next = f.str("next");
  redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout(): Promise<void> {
  await signOut();
  redirect("/login");
}

// ---- Gear ----

function parsePorts(raw: string | undefined): PortInput[] {
  if (!raw) return [];
  let list: unknown;
  try {
    list = JSON.parse(raw);
  } catch {
    throw new FieldError("The port list could not be read.");
  }
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const ports: PortInput[] = [];
  for (const item of list as Array<Record<string, unknown>>) {
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name) continue;
    if (seen.has(name)) throw new FieldError(`Two ports are named "${name}": port names must be unique on a device.`);
    seen.add(name);
    const direction = item.direction as PortInput["direction"];
    const signal = item.signal as PortInput["signal"];
    if (!(direction in DIRECTIONS)) throw new FieldError(`Port "${name}": choose a direction.`);
    if (!(signal in SIGNALS)) throw new FieldError(`Port "${name}": choose a signal.`);
    const connector = typeof item.connector === "string" && item.connector in CONNECTORS ? (item.connector as PortInput["connector"]) : undefined;
    const note = typeof item.note === "string" && item.note.trim() ? item.note.trim() : undefined;
    ports.push(compact({ name, direction, signal, connector, balanced: item.balanced === true ? true : undefined, note }));
  }
  return ports;
}

export async function saveDevice(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const id = f.id("id");
  let savedId: number;
  try {
    const ports = parsePorts(f.str("ports"));
    savedId = await withSession(async (g) => {
      let photo = f.bool("remove_photo") ? undefined : f.id("photo_id");
      const upload = f.file("photo");
      if (upload) {
        if (!upload.type.startsWith("image/")) throw new FieldError("The photo must be an image.");
        const [media] = await g.media.upload(upload, { alt: f.str("name") });
        photo = media?.id;
      }
      // Renaming a port would leave its cables pointing at the old name.
      if (id) {
        const renamed = await orphanedPorts(id, ports);
        if (renamed.length) {
          throw new FieldError(
            `Cables are still plugged into ${renamed.map((r) => `"${r.port}" (${r.cables.join(", ")})`).join(", ")}: ` +
              "move those cables first, or keep the port names.",
          );
        }
      }
      const data: DeviceInput = compact({
        name: f.required("name", "Name"),
        code: f.required("code", "Code"),
        brand: f.str("brand"),
        model: f.str("model"),
        category: f.oneOf("category", CATEGORIES) ?? "other",
        state: f.oneOf("state", DEVICE_STATES) ?? "in_use",
        location: f.id("location"),
        rack_position: f.int("rack_position"),
        rack_height: f.int("rack_height"),
        midi_channel: f.int("midi_channel"),
        ports,
        serial_number: f.str("serial_number"),
        purchase_date: f.str("purchase_date"),
        purchase_price: f.num("purchase_price"),
        current_value: f.num("current_value"),
        supplier: f.str("supplier"),
        warranty_until: f.str("warranty_until"),
        manual_url: f.str("manual_url"),
        photo,
        notes: f.str("notes"),
      });
      const devices = g.collection("devices");
      if (id) {
        // The patchbay layout is edited on its own page: keep it.
        const current = await devices.findOne(id, { level: 0 });
        if (current.patch_columns) data.patch_columns = current.patch_columns;
        if (current.patch_points?.length) data.patch_points = toDeviceInput(current).patch_points;
        // So is its place on the studio map.
        if (current.map_x != null) data.map_x = current.map_x;
        if (current.map_y != null) data.map_y = current.map_y;
      }
      const saved = id ? await devices.update(id, data, { level: 0 }) : await devices.create(data, { level: 0 });
      return saved.id;
    });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  redirect(`/gear/${savedId}`);
}

/** Ports a device is losing that still have connected cables. */
async function orphanedPorts(deviceId: number, ports: PortInput[]) {
  const names = new Set(ports.map((p) => p.name));
  const usage = cablesByPort((await getCables()).map(toPlanCable));
  const out: Array<{ port: string; cables: string[] }> = [];
  for (const [key, cables] of usage) {
    const [device, ...rest] = key.split("::");
    const port = rest.join("::");
    if (Number(device) === deviceId && !names.has(port)) out.push({ port, cables: cables.map((c) => c.code) });
  }
  return out;
}

export async function deleteDevice(_prev: FormState, form: FormData): Promise<FormState> {
  const id = new Fields(form).id("id");
  if (!id) return { error: "Missing device." };
  try {
    const cables = (await getCables()).filter((c) => refId(c.from_device) === id || refId(c.to_device) === id);
    if (cables.length) {
      return { error: `${cables.length} cable(s) still reference this device (${cables.map((c) => c.code).join(", ")}). Delete or move them first.` };
    }
    await withSession((g) => g.collection("devices").delete(id));
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  redirect("/gear");
}

export async function saveMaintenance(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const device = f.id("device");
  if (!device) return { error: "Missing device." };
  try {
    const data: MaintenanceInput = compact({
      device,
      date: f.required("date", "Date"),
      kind: f.oneOf("kind", { repair: 1, service: 1, calibration: 1, cleaning: 1, upgrade: 1, inspection: 1 }) ?? "repair",
      description: f.str("description"),
      cost: f.num("cost"),
      done_by: f.str("done_by"),
    });
    await withSession((g) => g.collection("maintenance").create(data, { level: 0 }));
  } catch (err) {
    return failure(err);
  }
  revalidatePath(`/gear/${device}`);
  return { ok: true };
}

export async function deleteMaintenance(form: FormData): Promise<void> {
  const f = new Fields(form);
  const id = f.id("id");
  if (!id) return;
  await withSession((g) => g.collection("maintenance").delete(id));
  revalidatePath(`/gear/${f.id("device") ?? ""}`);
}

// ---- Cables ----

function splitEnd(value: string | undefined): { device?: number; port?: string } {
  if (!value) return {};
  const i = value.indexOf("::");
  if (i < 0) return {};
  const device = Number(value.slice(0, i));
  return Number.isInteger(device) && device > 0 ? { device, port: value.slice(i + 2) } : {};
}

export async function saveCable(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const id = f.id("id");
  try {
    const from = splitEnd(f.str("from"));
    const to = splitEnd(f.str("to"));
    const state = f.oneOf("state", CABLE_STATES) ?? "connected";
    if (state === "connected" && (!from.device || !to.device)) {
      throw new FieldError("A connected cable needs both ends: pick a port on each side, or mark it spare.");
    }
    if (from.device && to.device && from.device === to.device && from.port === to.port) {
      throw new FieldError("Both ends are the same port.");
    }

    // A port takes one cable, unless the user says otherwise (a Y-cable, a MIDI thru box).
    if (state === "connected" && !f.bool("allow_shared")) {
      const usage = cablesByPort((await getCables()).filter((c) => c.id !== id).map(toPlanCable));
      const devices = new Map((await getDevices()).map((d) => [d.id, d.name]));
      for (const end of [from, to]) {
        const busy = usage.get(portKey(end.device!, end.port!));
        if (busy?.length) {
          throw new FieldError(
            `${devices.get(end.device!) ?? "That device"} · ${end.port} already has ${busy.map((c) => c.code).join(", ")}. ` +
              'Unplug it first, or tick "Allow a shared port".',
          );
        }
      }
    }

    const data: CableInput = compact({
      code: f.required("code", "Code"),
      signal: f.oneOf("signal", SIGNALS) ?? "audio",
      state,
      from_device: from.device,
      from_port: from.port,
      to_device: to.device,
      to_port: to.port,
      connector_a: f.oneOf("connector_a", CONNECTORS),
      connector_b: f.oneOf("connector_b", CONNECTORS),
      length_m: f.num("length_m"),
      color: f.str("color"),
      notes: f.str("notes"),
    });
    await withSession((g) => (id ? g.collection("cables").update(id, data, { level: 0 }) : g.collection("cables").create(data, { level: 0 })));
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  const back = f.str("return_to");
  redirect(back && back.startsWith("/") && !back.startsWith("//") ? back : "/cables");
}

export async function deleteCable(_prev: FormState, form: FormData): Promise<FormState> {
  const id = new Fields(form).id("id");
  if (!id) return { error: "Missing cable." };
  try {
    await withSession((g) => g.collection("cables").delete(id));
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  redirect("/cables");
}

// ---- Bookings ----

export async function saveBooking(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const id = f.id("id");
  try {
    const starts_at = f.datetime("starts_at");
    const ends_at = f.datetime("ends_at");
    if (!starts_at || !ends_at) throw new FieldError("Set when the session starts and ends.");
    if (ends_at <= starts_at) throw new FieldError("The session must end after it starts.");
    const room = f.id("room");
    const devices = f.ids("devices");
    const state = f.oneOf("state", BOOKING_STATES) ?? "tentative";

    if (state !== "cancelled" && !f.bool("allow_overlap")) {
      const overlapping = (await getBookings(starts_at, ends_at)).filter((b) => b.id !== id && b.state !== "cancelled");
      const roomClash = room ? overlapping.find((b) => refId(b.room) === room) : undefined;
      if (roomClash) {
        throw new FieldError(`The room is already booked for "${roomClash.title}". Tick "Book anyway" to keep both.`);
      }
      const wanted = new Set(devices);
      for (const b of overlapping) {
        const clash = (b.devices ?? []).map((d) => (typeof d === "number" ? { id: d, name: `#${d}` } : d)).filter((d) => wanted.has(d.id));
        if (clash.length) {
          throw new FieldError(`${clash.map((d) => d.name).join(", ")} already reserved by "${b.title}". Tick "Book anyway" to keep both.`);
        }
      }
    }

    const data: BookingInput = compact({
      title: f.required("title", "Title"),
      client: f.id("client"),
      room,
      starts_at,
      ends_at,
      state,
      session_type: f.oneOf("session_type", SESSION_TYPES),
      engineer: f.str("engineer"),
      devices,
      price: f.num("price"),
      paid: f.bool("paid"),
      notes: f.str("notes"),
    });
    await withSession((g) => (id ? g.collection("bookings").update(id, data, { level: 0 }) : g.collection("bookings").create(data, { level: 0 })));
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  const week = f.str("week");
  redirect(week ? `/bookings?week=${encodeURIComponent(week)}` : "/bookings");
}

export async function deleteBooking(_prev: FormState, form: FormData): Promise<FormState> {
  const id = new Fields(form).id("id");
  if (!id) return { error: "Missing booking." };
  try {
    await withSession((g) => g.collection("bookings").delete(id));
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  redirect("/bookings");
}

// ---- Clients, rooms, locations ----

export async function saveClient(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const id = f.id("id");
  try {
    const data: ClientInput = compact({
      name: f.required("name", "Name"),
      artist_name: f.str("artist_name"),
      email: f.str("email"),
      phone: f.str("phone"),
      notes: f.str("notes"),
    });
    await withSession((g) => (id ? g.collection("clients").update(id, data, { level: 0 }) : g.collection("clients").create(data, { level: 0 })));
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/clients");
  redirect("/clients");
}

export async function saveRoom(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const id = f.id("id");
  try {
    const name = f.required("name", "Name");
    const data: RoomInput = compact({
      name,
      slug: f.str("slug") ?? slugify(name),
      color: f.str("color"),
      description: f.str("description"),
      hourly_rate: f.num("hourly_rate"),
      daily_rate: f.num("daily_rate"),
      bookable: f.bool("bookable"),
      photo: f.id("photo_id"),
    });
    await withSession(async (g) => {
      if (!id) return g.collection("rooms").create(data, { level: 0 });
      // Keep the room's size and place on the studio map, edited there.
      const { map_x, map_y, width_cm, depth_cm } = toRoomInput(await g.collection("rooms").findOne(id, { level: 0 }));
      return g.collection("rooms").update(id, compact({ ...data, map_x, map_y, width_cm, depth_cm }), { level: 0 });
    });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  redirect("/places");
}

export async function saveLocation(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const id = f.id("id");
  try {
    const data: LocationInput = compact({
      name: f.required("name", "Name"),
      kind: f.oneOf("kind", LOCATION_KINDS) ?? "rack",
      room: f.id("room"),
      rack_units: f.int("rack_units"),
      notes: f.str("notes"),
    });
    await withSession(async (g) => {
      if (!id) return g.collection("locations").create(data, { level: 0 });
      const { map_x, map_y, width_cm, depth_cm, rotation } = toLocationInput(await g.collection("locations").findOne(id, { level: 0 }));
      return g.collection("locations").update(id, compact({ ...data, map_x, map_y, width_cm, depth_cm, rotation }), { level: 0 });
    });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  redirect("/places");
}

/** Deletes a client, room or location that nothing points to any more. */
export async function deletePlaceOrClient(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const id = f.id("id");
  const type = f.str("type");
  if (!id || (type !== "clients" && type !== "rooms" && type !== "locations")) return { error: "Nothing to delete." };
  try {
    if (type === "locations") {
      const used = (await getDevices()).filter((d) => refId(d.location) === id);
      if (used.length) return { error: `${used.length} device(s) are stored here: move them first.` };
    }
    await withSession((g) => g.collection(type).delete(id));
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  redirect(type === "clients" ? "/clients" : "/places");
}

function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "room";
}

// ---- Patchbays ----

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Saves a patchbay's column count and every column's labels, mode, DAW track, color and note. */
export async function savePatchPoints(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const id = f.id("id");
  if (!id) return { error: "Missing patchbay." };
  try {
    const columns = f.int("columns");
    if (!columns || columns < 1 || columns > 96) throw new FieldError("A patchbay has between 1 and 96 columns.");
    let raw: unknown;
    try {
      raw = JSON.parse(f.str("points") ?? "[]");
    } catch {
      throw new FieldError("The columns could not be read.");
    }
    const points: PatchPointInput[] = [];
    for (const item of Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : []) {
      const column = Number(item.column);
      if (!Number.isInteger(column) || column < 1 || column > columns) continue;
      const text = (k: string) => (typeof item[k] === "string" && (item[k] as string).trim() ? (item[k] as string).trim().slice(0, 120) : undefined);
      const mode = typeof item.mode === "string" && item.mode in PATCH_MODES ? (item.mode as PatchPointInput["mode"]) : undefined;
      const color = typeof item.color === "string" && HEX.test(item.color) ? item.color : undefined;
      const p = compact({ column, top_label: text("top_label"), bottom_label: text("bottom_label"), mode, daw_track: text("daw_track"), color, note: text("note") });
      if (Object.keys(p).length > 1) points.push(p);
    }
    await withSession(async (g) => {
      const devices = g.collection("devices");
      const current = await devices.findOne(id, { level: 0 });
      if (current.category !== "patchbay") throw new FieldError("This device isn't a patchbay.");
      const data = toDeviceInput(current);
      data.patch_columns = columns;
      data.patch_points = points.sort((a, b) => a.column - b.column);
      await devices.update(id, data, { level: 0 });
    });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Adds the rear ports "Top N" / "Bottom N" a patchbay is missing, so cables can plug into them. */
export async function createRearPorts(_prev: FormState, form: FormData): Promise<FormState> {
  const f = new Fields(form);
  const id = f.id("id");
  if (!id) return { error: "Missing patchbay." };
  try {
    await withSession(async (g) => {
      const devices = g.collection("devices");
      const current = await devices.findOne(id, { level: 0 });
      const data = toDeviceInput(current);
      const columns = current.patch_columns ?? f.int("columns") ?? 24;
      const ports = [...(data.ports ?? [])];
      const names = new Set(ports.map((p) => p.name));
      const signal = f.oneOf("signal", SIGNALS) ?? "audio";
      const connector = f.oneOf("connector", CONNECTORS) ?? "jack_trs";
      for (const row of ["Top", "Bottom"]) {
        for (let n = 1; n <= columns; n++) {
          const name = `${row} ${n}`;
          if (!names.has(name)) ports.push(compact({ name, direction: "io" as const, signal, connector, balanced: connector === "jack_trs" || connector === "xlr" || connector === "db25" ? true : undefined, note: "rear" }));
        }
      }
      // Keep the rear points in column order after the device's other ports.
      const rear = (p: PortInput) => /^(Top|Bottom) \d+$/.test(p.name);
      const key = (p: PortInput) => {
        const m = /^(Top|Bottom) (\d+)$/.exec(p.name)!;
        return (m[1] === "Top" ? 0 : 1000) + Number(m[2]);
      };
      data.ports = [...ports.filter((p) => !rear(p)), ...ports.filter(rear).sort((a, b) => key(a) - key(b))];
      data.patch_columns = columns;
      await devices.update(id, data, { level: 0 });
    });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---- Studio map ----

interface LayoutChange {
  rooms?: Array<{ id: number; x: number; y: number; w: number; d: number }>;
  locations?: Array<{ id: number; room?: number; x: number; y: number; w: number; d: number; rot: number }>;
  devices?: Array<{ id: number; x: number; y: number }>;
}

const clampInt = (v: unknown, min: number, max: number) => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) throw new FieldError("A position could not be read.");
  return Math.min(max, Math.max(min, n));
};

/** Saves what was moved on the studio map: rooms, places, and devices on their place. */
export async function saveMapLayout(_prev: FormState, form: FormData): Promise<FormState> {
  let change: LayoutChange;
  try {
    change = JSON.parse(new Fields(form).str("layout") ?? "{}") as LayoutChange;
  } catch {
    return { error: "The layout could not be read." };
  }
  try {
    await withSession(async (g) => {
      for (const r of change.rooms ?? []) {
        const current = await g.collection("rooms").findOne(r.id, { level: 0 });
        await g.collection("rooms").update(
          r.id,
          { ...toRoomInput(current), map_x: clampInt(r.x, -5000, 5000), map_y: clampInt(r.y, -5000, 5000), width_cm: clampInt(r.w, 50, 5000), depth_cm: clampInt(r.d, 50, 5000) },
          { level: 0 },
        );
      }
      for (const l of change.locations ?? []) {
        const current = await g.collection("locations").findOne(l.id, { level: 0 });
        const input = toLocationInput(current);
        await g.collection("locations").update(
          l.id,
          compact({
            ...input,
            room: l.room === undefined ? input.room : l.room > 0 ? l.room : undefined,
            map_x: clampInt(l.x, -5000, 5000),
            map_y: clampInt(l.y, -5000, 5000),
            width_cm: clampInt(l.w, 5, 2000),
            depth_cm: clampInt(l.d, 5, 2000),
            rotation: ((clampInt(l.rot, -720, 720) % 360) + 360) % 360,
          }),
          { level: 0 },
        );
      }
      for (const d of change.devices ?? []) {
        const current = await g.collection("devices").findOne(d.id, { level: 0 });
        await g.collection("devices").update(d.id, { ...toDeviceInput(current), map_x: clampInt(d.x, 0, 100), map_y: clampInt(d.y, 0, 100) }, { level: 0 });
      }
    });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
