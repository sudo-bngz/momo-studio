/** Names for the entries a revision points at, so the trail reads in words. */
import "server-only";

import { getBookings, getCables, getClients, getDevices, getLocations, getMaintenance, getRooms } from "@/lib/data";

export type NameLookup = (typeName: string, id: number) => string | undefined;

export async function entryNames(): Promise<NameLookup> {
  const [devices, cables, rooms, locations, clients, bookings, maintenance] = await Promise.all([
    getDevices(),
    getCables(),
    getRooms(),
    getLocations(),
    getClients(),
    getBookings("2000-01-01T00:00:00Z", "2100-01-01T00:00:00Z"),
    getMaintenance(),
  ]);
  const map = new Map<string, string>();
  const put = (type: string, id: number, name: string) => map.set(`${type}:${id}`, name);
  for (const d of devices) put("devices", d.id, `${d.code} · ${d.name}`);
  for (const c of cables) put("cables", c.id, c.code);
  for (const r of rooms) put("rooms", r.id, r.name);
  for (const l of locations) put("locations", l.id, l.name);
  for (const c of clients) put("clients", c.id, c.artist_name || c.name);
  for (const b of bookings) put("bookings", b.id, b.title);
  for (const m of maintenance) put("maintenance", m.id, `${m.kind} on ${m.date.slice(0, 10)}`);
  return (typeName, id) => map.get(`${typeName}:${id}`);
}
