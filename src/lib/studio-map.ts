/**
 * The studio as a floor plan, in centimetres. Rooms sit on the plan; places
 * (racks, desks, stands, cases) sit in a room, positioned from the room's
 * top-left corner; devices sit on their place (racks by unit, others at a
 * point given in % of the place's width and depth).
 *
 * Anything not placed yet gets a sensible spot (rooms side by side, places
 * along the room's walls, devices in a grid), drawn dashed until the layout
 * is saved. Pure data and functions, shared by the server and the map.
 */
import type { Signal } from "@/lib/vocab";

export interface MapRoom {
  id: number;
  name: string;
  color: string;
  x: number;
  y: number;
  w: number;
  d: number;
  placed: boolean;
}

export interface MapPlace {
  id: number;
  name: string;
  kind: "rack" | "desk" | "shelf" | "wall" | "case" | "storage";
  /** Room it is in, or undefined (then x/y are on the plan). */
  room?: number;
  x: number;
  y: number;
  w: number;
  d: number;
  rot: number;
  rackUnits?: number;
  placed: boolean;
}

export interface MapDevice {
  id: number;
  name: string;
  code: string;
  category: string;
  state: string;
  place?: number;
  rackPos?: number;
  rackH?: number;
  /** % of the place's width / depth (non-rack places). */
  x?: number;
  y?: number;
  placed: boolean;
}

export interface MapCable {
  id: number;
  code: string;
  signal: Signal;
  a: { device: number; port: string };
  b: { device: number; port: string };
}

/** Footprints of new places, by kind (cm). */
export const DEFAULT_SIZE: Record<MapPlace["kind"], { w: number; d: number }> = {
  rack: { w: 60, d: 60 },
  desk: { w: 180, d: 80 },
  shelf: { w: 120, d: 45 },
  wall: { w: 150, d: 25 },
  case: { w: 80, d: 45 },
  storage: { w: 100, d: 50 },
};

const GAP = 40;

/** Gives every room, place and device without a position one. */
export function autoLayout(rooms: MapRoom[], places: MapPlace[], devices: MapDevice[]) {
  // Rooms: unplaced ones to the right of the others.
  let right = Math.max(0, ...rooms.filter((r) => r.placed).map((r) => r.x + r.w + 100));
  for (const r of rooms) {
    if (r.placed) continue;
    r.x = right;
    r.y = 0;
    right += r.w + 100;
  }

  // Places: unplaced ones packed in rows from the room's top-left corner.
  const byRoom = new Map<number | undefined, MapPlace[]>();
  for (const p of places) byRoom.set(p.room, [...(byRoom.get(p.room) ?? []), p]);
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const bottom = Math.max(0, ...rooms.map((r) => r.y + r.d)) + 120;
  for (const [roomId, list] of byRoom) {
    const room = roomId !== undefined ? roomById.get(roomId) : undefined;
    const width = room ? room.w : Math.max(600, right);
    let x = GAP;
    let y = GAP;
    let rowH = 0;
    // Racks first: they usually stand together along a wall.
    const todo = list.filter((p) => !p.placed).sort((a, b) => Number(b.kind === "rack") - Number(a.kind === "rack") || a.name.localeCompare(b.name));
    for (const p of todo) {
      if (x + p.w > width - GAP && x > GAP) {
        x = GAP;
        y += rowH + GAP;
        rowH = 0;
      }
      p.x = x;
      p.y = room ? y : bottom + y;
      x += p.w + GAP;
      rowH = Math.max(rowH, p.d);
    }
  }

  // Devices on non-rack places: a grid, keeping the ones already placed.
  const onPlace = new Map<number, MapDevice[]>();
  for (const dev of devices) if (dev.place !== undefined) onPlace.set(dev.place, [...(onPlace.get(dev.place) ?? []), dev]);
  for (const p of places) {
    if (p.kind === "rack") continue;
    const list = onPlace.get(p.id) ?? [];
    const free = list.filter((dev) => !dev.placed);
    if (!free.length) continue;
    const turned = Math.round(p.rot / 90) % 2 === 1;
    const grid = gridOf(list.length, turned ? p.d : p.w, turned ? p.w : p.d);
    free.forEach((dev, i) => {
      const k = list.length - free.length + i;
      const col = k % grid.cols;
      const row = Math.floor(k / grid.cols);
      dev.x = Math.round(((col + 0.5) / grid.cols) * 100);
      dev.y = Math.round(((row + 0.5) / grid.rows) * 100);
    });
  }
}

/** Columns and rows to lay n tiles on a w × d surface. */
export function gridOf(n: number, w: number, d: number) {
  const cols = Math.max(1, Math.min(n, Math.ceil(Math.sqrt((n * w) / d))));
  return { cols, rows: Math.max(1, Math.ceil(n / cols)) };
}

/** A place's rectangle on the plan (before rotation). */
export function placeRect(p: MapPlace, rooms: Map<number, MapRoom>) {
  const r = p.room !== undefined ? rooms.get(p.room) : undefined;
  return { x: (r?.x ?? 0) + p.x, y: (r?.y ?? 0) + p.y, w: p.w, d: p.d };
}

/** Bounding box of a rectangle rotated around its centre. */
export function rotatedBox(x: number, y: number, w: number, d: number, rot: number) {
  const a = (rot * Math.PI) / 180;
  const c = Math.abs(Math.cos(a));
  const s = Math.abs(Math.sin(a));
  const bw = w * c + d * s;
  const bd = w * s + d * c;
  const cx = x + w / 2;
  const cy = y + d / 2;
  return { x: cx - bw / 2, y: cy - bd / 2, w: bw, d: bd, cx, cy };
}

export interface Bundle {
  key: string;
  a: number;
  b: number;
  cables: MapCable[];
  bySignal: Partial<Record<Signal, number>>;
}

/**
 * Cables between two different places, grouped: the "main connections" of
 * the studio, one bundle per pair of places.
 */
export function bundles(cables: MapCable[], placeOf: (device: number) => number | undefined, signals?: Set<Signal>): Bundle[] {
  const map = new Map<string, Bundle>();
  for (const c of cables) {
    if (signals && !signals.has(c.signal)) continue;
    const pa = placeOf(c.a.device);
    const pb = placeOf(c.b.device);
    if (pa === undefined || pb === undefined || pa === pb) continue;
    const [a, b] = pa < pb ? [pa, pb] : [pb, pa];
    const key = `${a}-${b}`;
    const bundle = map.get(key) ?? { key, a, b, cables: [], bySignal: {} };
    bundle.cables.push(c);
    bundle.bySignal[c.signal] = (bundle.bySignal[c.signal] ?? 0) + 1;
    map.set(key, bundle);
  }
  return [...map.values()];
}

/** Where a line from a box's centre towards (tx, ty) leaves the box. */
export function exitPoint(box: { x: number; y: number; w: number; d: number }, tx: number, ty: number) {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.d / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const sx = dx !== 0 ? box.w / 2 / Math.abs(dx) : Infinity;
  const sy = dy !== 0 ? box.d / 2 / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);
  return { x: cx + dx * s, y: cy + dy * s };
}

/**
 * The card a place is drawn on when zoomed into: centred on the place, and
 * big enough to read whatever the place's real size. A rack becomes a front
 * view, unit by unit.
 */
export function detailCard(place: MapPlace, box: { cx: number; cy: number; w: number; d: number }, devices: MapDevice[]) {
  if (place.kind === "rack") {
    const units = place.rackUnits ?? Math.max(4, ...devices.map((d) => (d.rackPos ?? 1) + (d.rackH ?? 1) - 1));
    const w = 120;
    const d = units * 9 + 14;
    return { x: box.cx - w / 2, y: box.cy - d / 2, w, d, units };
  }
  const k = Math.min(3, Math.max(1, 100 / Math.min(box.w, box.d)));
  const w = box.w * k;
  const d = box.d * k;
  return { x: box.cx - w / 2, y: box.cy - d / 2, w, d, units: 0 };
}
