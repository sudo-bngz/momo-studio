/** GoHead entries as the plain data of src/lib/patch.ts. */
import { refId, type CableEntry, type DeviceEntry } from "@/lib/data";
import type { PlanCable, PlanDevice } from "@/lib/patch";

export function toPlanDevice(d: DeviceEntry): PlanDevice {
  const location = d.location && typeof d.location === "object" ? d.location.name : undefined;
  return {
    id: d.id,
    name: d.name,
    code: d.code,
    category: d.category,
    state: d.state,
    location,
    ports: (d.ports ?? []).map((p) => ({ name: p.name, direction: p.direction, signal: p.signal, connector: p.connector ?? null })),
    patch:
      d.category === "patchbay"
        ? {
            columns: patchColumns(d),
            modes: Object.fromEntries((d.patch_points ?? []).map((p) => [p.column, p.mode ?? undefined])),
          }
        : undefined,
  };
}

export function toPlanCable(c: CableEntry): PlanCable {
  const from = refId(c.from_device);
  const to = refId(c.to_device);
  return {
    id: c.id,
    code: c.code,
    signal: c.signal,
    state: c.state,
    from: from !== undefined && c.from_port ? { device: from, port: c.from_port } : undefined,
    to: to !== undefined && c.to_port ? { device: to, port: c.to_port } : undefined,
    color: c.color ?? null,
    length_m: c.length_m ?? null,
  };
}

/** A patchbay's column count: as set, or from its "Top N" rear ports. */
export function patchColumns(d: DeviceEntry): number {
  if (d.patch_columns) return d.patch_columns;
  let max = 0;
  for (const p of d.ports ?? []) {
    const m = /^(?:Top|Bottom) (\d+)$/.exec(p.name);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}
