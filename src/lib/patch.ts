/**
 * The cable plan as a graph: which port each cable joins, which ports are
 * free, and what looks wrong. Pure functions over plain data, used by the
 * server pages and by the plan diagram in the browser.
 */
import type { Direction, Signal } from "@/lib/vocab";

export interface PlanPort {
  name: string;
  direction: Direction;
  signal: Signal;
  connector?: string | null;
}

export interface PlanDevice {
  id: number;
  name: string;
  code: string;
  category: string;
  state: string;
  location?: string;
  ports: PlanPort[];
}

export interface PlanCable {
  id: number;
  code: string;
  signal: Signal;
  state: "connected" | "spare" | "broken";
  from?: { device: number; port: string };
  to?: { device: number; port: string };
  color?: string | null;
  length_m?: number | null;
}

export const portKey = (device: number, port: string) => `${device}::${port}`;

/** Connected cables by port. */
export function cablesByPort(cables: PlanCable[]): Map<string, PlanCable[]> {
  const map = new Map<string, PlanCable[]>();
  for (const c of cables) {
    if (c.state !== "connected") continue;
    for (const end of [c.from, c.to]) {
      if (!end) continue;
      const k = portKey(end.device, end.port);
      const list = map.get(k);
      if (list) list.push(c);
      else map.set(k, [c]);
    }
  }
  return map;
}

export type IssueKind = "busy_port" | "unknown_port" | "missing_device" | "signal_mismatch" | "direction" | "loose_end";

export interface Issue {
  kind: IssueKind;
  cable: PlanCable;
  message: string;
  /** Other cables involved (busy ports). */
  others?: PlanCable[];
}

/** What looks wrong in the plan: things worth checking before a session. */
export function findIssues(devices: PlanDevice[], cables: PlanCable[]): Issue[] {
  const byId = new Map(devices.map((d) => [d.id, d]));
  const issues: Issue[] = [];
  const reportedBusy = new Set<string>();
  const usage = cablesByPort(cables);

  for (const c of cables) {
    if (c.state !== "connected") continue;
    if (!c.from || !c.to) {
      issues.push({ kind: "loose_end", cable: c, message: `${c.code} is marked connected but one end is not set` });
      continue;
    }
    const ends: Array<["from" | "to", { device: number; port: string }]> = [["from", c.from], ["to", c.to]];
    const resolved: Array<PlanPort | undefined> = [];
    for (const [side, end] of ends) {
      const device = byId.get(end.device);
      if (!device) {
        issues.push({ kind: "missing_device", cable: c, message: `${c.code}: the ${side === "from" ? "source" : "destination"} device no longer exists` });
        resolved.push(undefined);
        continue;
      }
      const port = device.ports.find((p) => p.name === end.port);
      resolved.push(port);
      if (!port) {
        issues.push({ kind: "unknown_port", cable: c, message: `${c.code}: ${device.name} has no port "${end.port}"` });
        continue;
      }
      if (port.signal !== c.signal) {
        issues.push({
          kind: "signal_mismatch",
          cable: c,
          message: `${c.code} carries ${c.signal} but ${device.name} · ${port.name} is ${port.signal}`,
        });
      }
      const key = portKey(end.device, end.port);
      const others = usage.get(key) ?? [];
      if (others.length > 1 && !reportedBusy.has(key)) {
        reportedBusy.add(key);
        issues.push({
          kind: "busy_port",
          cable: c,
          others: others.filter((o) => o.id !== c.id),
          message: `${device.name} · ${port.name} has ${others.length} cables: ${others.map((o) => o.code).join(", ")}`,
        });
      }
    }
    const [a, b] = resolved;
    if (a && b && ((a.direction === "in" && b.direction === "in") || (a.direction === "out" && b.direction === "out"))) {
      issues.push({ kind: "direction", cable: c, message: `${c.code} joins two ${a.direction === "in" ? "inputs" : "outputs"}` });
    }
  }
  return issues;
}

// ---- Layout of the plan diagram ----

export interface LayoutOptions {
  signals: Set<Signal>;
  /** Show every port, not only the patched ones. */
  allPorts: boolean;
  /** Hide devices without a visible cable. */
  hideIdle: boolean;
}

export interface NodeBox {
  device: PlanDevice;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
  inputs: Array<{ port: PlanPort; y: number }>;
  outputs: Array<{ port: PlanPort; y: number }>;
}

export interface Edge {
  cable: PlanCable;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Layout {
  nodes: NodeBox[];
  edges: Edge[];
  width: number;
  height: number;
}

export const NODE_W = 210;
const COL_GAP = 150;
const HEADER = 40;
const ROW = 18;
const PAD = 10;
const NODE_GAP = 22;
const MARGIN = 24;

/**
 * Lays devices out in columns that follow the signal: sources on the left
 * (synths, sequencers), what they feed further right (patchbays, the
 * interface, monitors). A column is a device's longest chain of upstream
 * devices; cycles (send/return loops) are broken where they are met. Inside
 * a column, devices are ordered by where their neighbours are, to keep lines
 * from crossing.
 */
export function layoutPlan(devices: PlanDevice[], cables: PlanCable[], opts: LayoutOptions): Layout {
  const visible = cables.filter(
    (c) => c.state === "connected" && c.from && c.to && opts.signals.has(c.signal) && c.from.device !== c.to.device,
  );
  const byId = new Map(devices.map((d) => [d.id, d]));
  const shown = visible.filter((c) => byId.has(c.from!.device) && byId.has(c.to!.device));

  const active = new Set<number>();
  for (const c of shown) {
    active.add(c.from!.device);
    active.add(c.to!.device);
  }
  const nodes = devices.filter((d) => (opts.hideIdle ? active.has(d.id) : true));

  // Which end of a cable is upstream: an output feeds an input. For in/out
  // ports (USB, network, patchbay points) the cable's from → to order wins.
  const portOf = (end: { device: number; port: string }) => byId.get(end.device)?.ports.find((p) => p.name === end.port);
  const directed = shown.map((c) => {
    const a = portOf(c.from!);
    const b = portOf(c.to!);
    const reversed = (a?.direction === "in" && b?.direction !== "in") || (b?.direction === "out" && a?.direction !== "out");
    return reversed ? { cable: c, src: c.to!, dst: c.from! } : { cable: c, src: c.from!, dst: c.to! };
  });

  // Longest path rank with cycle breaking (DFS on upstream edges).
  const upstream = new Map<number, Set<number>>();
  for (const e of directed) {
    if (!upstream.has(e.dst.device)) upstream.set(e.dst.device, new Set());
    upstream.get(e.dst.device)!.add(e.src.device);
  }
  const rank = new Map<number, number>();
  const visiting = new Set<number>();
  const rankOf = (id: number): number => {
    const known = rank.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return 0; // a loop: stop climbing here
    visiting.add(id);
    let r = 0;
    for (const u of upstream.get(id) ?? []) r = Math.max(r, rankOf(u) + 1);
    visiting.delete(id);
    rank.set(id, r);
    return r;
  };
  for (const d of nodes) rankOf(d.id);

  // Idle devices go to a last column of their own.
  const maxRank = Math.max(0, ...nodes.filter((d) => active.has(d.id)).map((d) => rank.get(d.id) ?? 0));
  const columnOf = (d: PlanDevice) => (active.has(d.id) ? (rank.get(d.id) ?? 0) : maxRank + 1);

  // Ports drawn on each node: inputs on the left edge, outputs on the right.
  const used = new Set<string>();
  for (const e of directed) {
    used.add(portKey(e.src.device, e.src.port));
    used.add(portKey(e.dst.device, e.dst.port));
  }
  // A port is drawn on the side its cables use; one used both ways (an
  // in/out point) is drawn on both sides.
  const outSide = new Set(directed.map((e) => portKey(e.src.device, e.src.port)));
  const inSide = new Set(directed.map((e) => portKey(e.dst.device, e.dst.port)));

  const boxes = new Map<number, NodeBox>();
  for (const d of nodes) {
    const ports = d.ports.filter((p) =>
      opts.allPorts ? opts.signals.has(p.signal) || used.has(portKey(d.id, p.name)) : used.has(portKey(d.id, p.name)),
    );
    const inputs: PlanPort[] = [];
    const outputs: PlanPort[] = [];
    for (const p of ports) {
      const k = portKey(d.id, p.name);
      const out = outSide.has(k);
      const inn = inSide.has(k);
      if (out) outputs.push(p);
      if (inn) inputs.push(p);
      if (!out && !inn) (p.direction === "out" ? outputs : inputs).push(p);
    }
    const rows = Math.max(inputs.length, outputs.length, 1);
    boxes.set(d.id, {
      device: d,
      column: columnOf(d),
      x: 0,
      y: 0,
      width: NODE_W,
      height: HEADER + rows * ROW + PAD,
      inputs: inputs.map((port) => ({ port, y: 0 })),
      outputs: outputs.map((port) => ({ port, y: 0 })),
    });
  }

  // Columns, ordered by the average row of their neighbours (a few sweeps).
  const columns = new Map<number, NodeBox[]>();
  for (const b of boxes.values()) {
    if (!columns.has(b.column)) columns.set(b.column, []);
    columns.get(b.column)!.push(b);
  }
  const colIndexes = [...columns.keys()].sort((a, b) => a - b);
  const order = new Map<number, number>();
  for (const ci of colIndexes) {
    columns.get(ci)!.sort((a, b) => a.device.code.localeCompare(b.device.code)).forEach((b, i) => order.set(b.device.id, i));
  }
  const neighbours = new Map<number, number[]>();
  for (const e of directed) {
    neighbours.set(e.src.device, [...(neighbours.get(e.src.device) ?? []), e.dst.device]);
    neighbours.set(e.dst.device, [...(neighbours.get(e.dst.device) ?? []), e.src.device]);
  }
  for (let sweep = 0; sweep < 4; sweep++) {
    const cols = sweep % 2 === 0 ? colIndexes : [...colIndexes].reverse();
    for (const ci of cols) {
      const col = columns.get(ci)!;
      const score = (b: NodeBox) => {
        const ns = (neighbours.get(b.device.id) ?? []).map((n) => order.get(n)).filter((v): v is number => v !== undefined);
        return ns.length ? ns.reduce((s, v) => s + v, 0) / ns.length : (order.get(b.device.id) ?? 0);
      };
      col.sort((a, b) => score(a) - score(b) || a.device.code.localeCompare(b.device.code));
      col.forEach((b, i) => order.set(b.device.id, i));
    }
  }

  // Coordinates.
  let height = 0;
  colIndexes.forEach((ci, i) => {
    let y = MARGIN;
    for (const b of columns.get(ci)!) {
      b.x = MARGIN + i * (NODE_W + COL_GAP);
      b.y = y;
      b.inputs.forEach((p, k) => (p.y = b.y + HEADER + k * ROW + ROW / 2));
      b.outputs.forEach((p, k) => (p.y = b.y + HEADER + k * ROW + ROW / 2));
      y += b.height + NODE_GAP;
    }
    height = Math.max(height, y);
  });
  const width = MARGIN * 2 + colIndexes.length * NODE_W + Math.max(0, colIndexes.length - 1) * COL_GAP;

  const edges: Edge[] = [];
  for (const e of directed) {
    const a = boxes.get(e.src.device);
    const b = boxes.get(e.dst.device);
    if (!a || !b) continue;
    const pa = a.outputs.find((p) => p.port.name === e.src.port);
    const pb = b.inputs.find((p) => p.port.name === e.dst.port);
    if (!pa || !pb) continue;
    edges.push({ cable: e.cable, x1: a.x + a.width, y1: pa.y, x2: b.x, y2: pb.y });
  }
  return { nodes: [...boxes.values()], edges, width: Math.max(width, 400), height: Math.max(height, 200) };
}
