/** Server side: the studio's rooms, places, machines and cables, ready for the map. */
import "server-only";

import { getCables, getDevices, getLocations, getRooms, refId } from "@/lib/data";
import { autoLayout, DEFAULT_SIZE, type MapCable, type MapDevice, type MapPlace, type MapRoom } from "@/lib/studio-map";

export async function getStudioMap() {
  const [roomEntries, locations, deviceEntries, cableEntries] = await Promise.all([getRooms(), getLocations(), getDevices(), getCables()]);

  const rooms: MapRoom[] = roomEntries.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color ?? "#6b6e76",
    x: r.map_x ?? 0,
    y: r.map_y ?? 0,
    w: r.width_cm ?? 500,
    d: r.depth_cm ?? 400,
    placed: r.map_x != null && r.map_y != null,
  }));
  const roomIds = new Set(rooms.map((r) => r.id));
  const places: MapPlace[] = locations.map((l) => {
    const size = DEFAULT_SIZE[l.kind];
    const room = refId(l.room);
    return {
      id: l.id,
      name: l.name,
      kind: l.kind,
      room: room !== undefined && roomIds.has(room) ? room : undefined,
      x: l.map_x ?? 0,
      y: l.map_y ?? 0,
      w: l.width_cm ?? size.w,
      d: l.depth_cm ?? size.d,
      rot: l.rotation ?? 0,
      rackUnits: l.rack_units ?? undefined,
      placed: l.map_x != null && l.map_y != null,
    };
  });
  const devices: MapDevice[] = deviceEntries.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    category: d.category,
    state: d.state,
    place: refId(d.location),
    rackPos: d.rack_position ?? undefined,
    rackH: d.rack_height ?? undefined,
    x: d.map_x ?? undefined,
    y: d.map_y ?? undefined,
    placed: d.map_x != null && d.map_y != null,
  }));
  const cables: MapCable[] = cableEntries.flatMap((c) => {
    const a = refId(c.from_device);
    const b = refId(c.to_device);
    if (c.state !== "connected" || a === undefined || b === undefined || !c.from_port || !c.to_port) return [];
    return [{ id: c.id, code: c.code, signal: c.signal, a: { device: a, port: c.from_port }, b: { device: b, port: c.to_port } }];
  });

  autoLayout(rooms, places, devices);
  return { rooms, places, devices, cables };
}
