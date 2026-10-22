/**
 * A patchbay as columns, the way it is labelled on the hardware: each
 * column has a top and a bottom rear point (ports "Top N" and "Bottom N"),
 * numbered on the front 1…N on the top row and N+1…2N on the bottom row.
 *
 * What a point is called comes from the cable plugged into its rear when
 * there is one (the device and port at the cable's other end), and from the
 * column's typed label otherwise, so moving a cable relabels the patchbay.
 */
import type { PatchPoint } from "@/gohead";
import { cablesByPort, isNormalled, portKey, type Issue, type PlanCable, type PlanDevice } from "@/lib/patch";
import type { Direction, PatchMode, Signal } from "@/lib/vocab";

export interface RearEnd {
  cableId: number;
  cableCode: string;
  deviceId?: number;
  deviceName: string;
  deviceCode?: string;
  port: string;
  direction?: Direction;
  signal: Signal;
}

export interface RearView {
  row: "top" | "bottom";
  /** Front number: 1…N on top, N+1…2N on the bottom. */
  number: number;
  port: string;
  hasPort: boolean;
  ends: RearEnd[];
  /** Label typed on the column (shown when no cable says otherwise). */
  text: string;
}

export interface ColumnView {
  column: number;
  top: RearView;
  bottom: RearView;
  mode?: PatchMode;
  daw_track: string;
  color: string;
  note: string;
  /** Which way the signal crosses a normalled column, when both far ends are known. */
  flow?: "down" | "up";
  /** Part of a feedback loop. */
  loop: boolean;
}

export interface PatchbayView {
  id: number;
  name: string;
  code: string;
  columns: number;
  rows: ColumnView[];
  /** Rear ports this patchbay is missing ("Top 3"…). */
  missingPorts: number;
}

export function patchbayView(pb: PlanDevice, points: PatchPoint[], devices: PlanDevice[], cables: PlanCable[], issues: Issue[]): PatchbayView {
  const columns = pb.patch?.columns ?? 0;
  const byId = new Map(devices.map((d) => [d.id, d]));
  const usage = cablesByPort(cables);
  const point = new Map(points.map((p) => [p.column, p]));
  const loopCables = new Set(issues.filter((i) => i.kind === "loop").flatMap((i) => [i.cable, ...(i.others ?? [])].map((c) => c.id)));
  let missingPorts = 0;

  const rear = (row: "top" | "bottom", column: number, text: string): RearView => {
    const port = `${row === "top" ? "Top" : "Bottom"} ${column}`;
    const hasPort = pb.ports.some((p) => p.name === port);
    if (!hasPort) missingPorts++;
    const ends: RearEnd[] = (usage.get(portKey(pb.id, port)) ?? []).map((c) => {
      const far = c.from?.device === pb.id && c.from.port === port ? c.to : c.from;
      const d = far ? byId.get(far.device) : undefined;
      return {
        cableId: c.id,
        cableCode: c.code,
        deviceId: d?.id,
        deviceName: d?.name ?? "?",
        deviceCode: d?.code,
        port: far?.port ?? "?",
        direction: d?.ports.find((p) => p.name === far?.port)?.direction,
        signal: c.signal,
      };
    });
    return { row, number: row === "top" ? column : column + columns, port, hasPort, ends, text };
  };

  const rows: ColumnView[] = [];
  for (let n = 1; n <= columns; n++) {
    const p = point.get(n);
    const top = rear("top", n, p?.top_label ?? "");
    const bottom = rear("bottom", n, p?.bottom_label ?? "");
    const mode = p?.mode ?? undefined;
    let flow: ColumnView["flow"];
    if (isNormalled(mode) && top.ends[0] && bottom.ends[0]) {
      if (top.ends[0].direction === "out" && bottom.ends[0].direction !== "out") flow = "down";
      else if (bottom.ends[0].direction === "out" && top.ends[0].direction !== "out") flow = "up";
    }
    rows.push({
      column: n,
      top,
      bottom,
      mode,
      daw_track: p?.daw_track ?? "",
      color: p?.color ?? "",
      note: p?.note ?? "",
      flow,
      loop: [...top.ends, ...bottom.ends].some((e) => loopCables.has(e.cableId)),
    });
  }
  return { id: pb.id, name: pb.name, code: pb.code, columns, rows, missingPorts };
}

/** What a rear point says: the device behind it, or the typed label. */
export function rearLabel(r: RearView): { main: string; sub?: string; free: boolean } {
  const e = r.ends[0];
  if (e) return { main: e.deviceName, sub: e.port, free: false };
  if (r.text) return { main: r.text, free: false };
  return { main: "FREE", free: true };
}

/** Cell values pasted from a spreadsheet row or column (tabs, new lines or semicolons). */
export function splitPasted(text: string): string[] {
  const t = text.replace(/\r/g, "").replace(/\n+$/, "");
  const parts = t.includes("\t") ? t.split(/\t|\n/) : t.includes("\n") ? t.split("\n") : t.split(";");
  return parts.map((s) => s.trim());
}

/** A pasted mode: N, H, T, or the full names, in English or French. */
export function parseMode(v: string): PatchMode | undefined {
  const s = v.trim().toLowerCase();
  if (!s) return undefined;
  if (s === "n" || s.startsWith("norm")) return "normal";
  if (s === "h" || s.startsWith("half") || s.startsWith("semi") || s.startsWith("demi")) return "half_normal";
  if (s === "t" || s.startsWith("thr") || s.startsWith("thru") || s.startsWith("denorm") || s.startsWith("dénorm")) return "thru";
  return undefined;
}
