/**
 * Device templates: every socket of a known piece of gear, or of a generic
 * console, interface or patchbay sized by a few numbers. The data is in
 * templates/devices.json (the sample studio is generated from the same file).
 */
import type { PortInput } from "@/gohead";
// A relative path with an import attribute, so this module can also be read
// by plain node (scripts/bootstrap-studio.mjs) without the bundler's alias.
import raw from "./templates/devices.json" with { type: "json" };
import type { Category } from "@/lib/vocab";

export interface ConsoleSpec {
  channels: number;
  groups: number;
  auxes: number;
  fx_returns: number;
  /** Groups come out of the track outs of channels g, g+groups, g+2·groups… (in-line desks). */
  groups_on_track_outs: boolean;
}

interface PortSpec extends Omit<PortInput, "name"> {
  name: string;
  each?: [number | string, number | string];
}

interface TemplateSpec {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category: Category;
  notes?: string;
  params?: Record<string, number>;
  console?: Record<string, number | string | boolean>;
  patch_columns?: number;
  ports?: PortSpec[];
  extends?: string;
}

export interface DeviceTemplate {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category: Category;
  notes?: string;
  /** Numbers the user can change before expanding (generic templates). */
  params: Record<string, number>;
}

const specs = (raw as { templates: TemplateSpec[] }).templates;

/** The templates offered, in the order of the file. */
export const TEMPLATES: DeviceTemplate[] = specs.map((t) => ({
  id: t.id,
  name: t.name,
  brand: t.brand,
  model: t.model,
  category: t.category,
  notes: t.notes,
  params: { ...(resolveSpec(t).params ?? {}), ...(t.params ?? {}) },
}));

function resolveSpec(t: TemplateSpec): TemplateSpec {
  if (!t.extends) return t;
  const base = specs.find((s) => s.id === t.extends);
  if (!base) throw new Error(`template ${t.id} extends unknown ${t.extends}`);
  const b = resolveSpec(base);
  return { ...b, ...t, ports: t.ports ?? b.ports, console: t.console ?? b.console, params: { ...(b.params ?? {}), ...(t.params ?? {}) } };
}

/** "{channels}+1" → a number, with the template's params. */
function num(v: number | string, params: Record<string, number>): number {
  if (typeof v === "number") return v;
  const expr = v.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? 0));
  if (!/^[\d+\-*\s]+$/.test(expr)) throw new Error(`bad range ${v}`);
  // Only + and - between integers.
  return expr.split("+").reduce((s, part) => s + part.split("-").reduce((a, b, i) => (i === 0 ? Number(b) : a - Number(b)), 0), 0);
}

export interface Expanded {
  ports: PortInput[];
  console?: ConsoleSpec;
  patch_columns?: number;
  brand?: string;
  model?: string;
  category: Category;
  notes?: string;
}

/** The ports (and console shape) of a template, for the given parameters. */
export function expandTemplate(id: string, params: Record<string, number> = {}): Expanded {
  const spec = specs.find((s) => s.id === id);
  if (!spec) throw new Error(`unknown template ${id}`);
  const t = resolveSpec(spec);
  const p = { ...(t.params ?? {}), ...params };
  // The GS3 16 reuses the 24's port list with fewer channels.
  if (t.console && typeof t.console.channels === "number" && p.channels === undefined) p.channels = t.console.channels;
  const groups = t.console ? num(t.console.groups as number | string, p) : 0;
  const ports: PortInput[] = [];
  for (const s of t.ports ?? []) {
    const { each, ...rest } = s;
    if (!each) {
      ports.push(rest);
      continue;
    }
    const from = num(each[0], p);
    let to = num(each[1], p);
    // A channel range of an exact template is capped by the chosen channel count.
    if (/^Ch \{n\}/.test(s.name) && p.channels) to = Math.min(to, p.channels);
    for (let n = from; n <= to; n++) {
      const g = groups ? ((n - 1) % groups) + 1 : n;
      const fill = (v: string) => v.replace(/\{n\}/g, String(n)).replace(/\{g\}/g, String(g));
      ports.push({ ...rest, name: fill(rest.name), note: rest.note ? fill(rest.note) : undefined });
    }
  }
  const console = t.console
    ? {
        channels: num(t.console.channels as number | string, p),
        groups,
        auxes: num(t.console.auxes as number | string, p),
        fx_returns: num(t.console.fx_returns as number | string, p),
        groups_on_track_outs: Boolean(t.console.groups_on_track_outs),
      }
    : undefined;
  return { ports, console, patch_columns: t.patch_columns, brand: t.brand, model: t.model, category: t.category, notes: t.notes };
}
