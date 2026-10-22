/**
 * A mixing console as channel strips and a master section, read from its
 * ports: "Ch 3 Line", "Ch 3 Insert", "Ch 3 Track Out" belong to strip 3;
 * "Group 1 Insert", "Aux 2 Out", "Mix Out L", "FX Return 1 L"… form the
 * master section. Templates name ports this way; a console typed by hand
 * works as long as its ports follow the same words.
 *
 * Each strip's routing (direct out, group pair, mix, auxes in use) is kept
 * in the device's `channel_strips`, so the signal can be followed through
 * the desk: in at a channel, out at the right track out, group or aux.
 */
import type { ChannelStrip } from "@/gohead";
import { cablesByPort, isNormalled, portKey, rearPoint, type Issue, type PlanCable, type PlanDevice, type PlanPort } from "@/lib/patch";
import { PASS_THROUGH, type Category } from "@/lib/vocab";

export type SocketRole = "mic" | "line" | "tape" | "insert" | "out" | "other";

export interface FarEnd {
  cableId: number;
  cableCode: string;
  deviceId?: number;
  deviceName: string;
  deviceCode?: string;
  port: string;
  direction?: PlanPort["direction"];
}

export interface Socket {
  port: string;
  role: SocketRole;
  direction: PlanPort["direction"];
  ends: FarEnd[];
}

export interface StripView {
  number: number;
  label: string;
  source?: "mic" | "line" | "tape";
  route: string;
  direct: boolean;
  aux: number[];
  color: string;
  note: string;
  sockets: Socket[];
  /** Where this channel's signal leaves the desk, given its routing. */
  outputs: string[];
  loop: boolean;
}

export interface Section {
  title: string;
  sockets: Socket[];
}

export interface ConsoleView {
  id: number;
  name: string;
  code: string;
  channels: number;
  groups: number;
  auxes: number;
  groupsOnTrackOuts: boolean;
  strips: StripView[];
  sections: Section[];
}

const CH = /^Ch(?:annel)?\s+(\d+)\s+(.*)$/i;

/** Whether a port belongs to a channel strip: its number and role. */
export function stripPort(name: string): { number: number; role: SocketRole } | undefined {
  const m = CH.exec(name);
  if (!m) return undefined;
  const rest = m[2]!.toLowerCase();
  const role: SocketRole = /insert/.test(rest)
    ? "insert"
    : /direct|track out|\bout\b/.test(rest)
      ? "out"
      : /tape|monitor|return/.test(rest)
        ? "tape"
        : /mic/.test(rest)
          ? "mic"
          : /line/.test(rest)
            ? "line"
            : "other";
  return { number: Number(m[1]), role };
}

/** Numbers in a route like "1-2", "3/4", "mix", "5": the groups it feeds. */
export function routeGroups(route: string): number[] {
  return [...new Set((route.match(/\d+/g) ?? []).map(Number))];
}
export const routesToMix = (route: string) => /mix|l\/?r|stereo|main/i.test(route);
export const parseAux = (aux: string | null | undefined) => [...new Set((aux ?? "").match(/\d+/g)?.map(Number) ?? [])];

const SECTION_ORDER = ["Groups", "Aux sends", "Cue", "Mix", "FX returns", "2-Track", "Monitors", "Headphones", "MIDI", "Power", "Other"];

function sectionOf(name: string): string {
  const n = name.toLowerCase();
  if (/^group/.test(n)) return "Groups";
  if (/^aux/.test(n)) return "Aux sends";
  if (/^cue/.test(n)) return "Cue";
  if (/^mix|^main|^master|^stereo/.test(n)) return "Mix";
  if (/^fx|^effect|return/.test(n)) return "FX returns";
  if (/2.?track|tape/.test(n)) return "2-Track";
  if (/monitor|control room|alt/.test(n)) return "Monitors";
  if (/phones/.test(n)) return "Headphones";
  if (/midi/.test(n)) return "MIDI";
  if (/power|psu|mains/.test(n)) return "Power";
  return "Other";
}

/** How many groups and auxes a console has, from its port names. */
export function consoleShape(device: PlanDevice) {
  let channels = 0;
  let groups = 0;
  let auxes = 0;
  let groupOuts = false;
  for (const p of device.ports) {
    const s = stripPort(p.name);
    if (s) channels = Math.max(channels, s.number);
    const g = /^Group\s+(\d+)/i.exec(p.name);
    if (g) {
      groups = Math.max(groups, Number(g[1]));
      if (/out/i.test(p.name)) groupOuts = true;
    }
    const a = /^Aux\s+(\d+)/i.exec(p.name);
    if (a) auxes = Math.max(auxes, Number(a[1]));
  }
  return { channels, groups, auxes, groupsOnTrackOuts: groups > 0 && !groupOuts };
}

export const isConsole = (device: PlanDevice) => device.category === "mixer" && device.ports.some((p) => stripPort(p.name));

/**
 * The ports a channel's signal leaves the desk by, given its strip. Direct:
 * its own out. A group: the group's out jack, or (in-line desks) the track
 * outs of the channels the group is paralleled on. Mix: the mix outs. Auxes
 * in use: their outs.
 */
export function stripOutputs(device: PlanDevice, strip: Pick<ChannelStrip, "number" | "route" | "direct" | "aux">, shape = consoleShape(device)): string[] {
  const names = new Set(device.ports.map((p) => p.name));
  const out: string[] = [];
  const has = (n: string) => names.has(n);
  const ownOut = device.ports.find((p) => {
    const s = stripPort(p.name);
    return s?.number === strip.number && s.role === "out";
  })?.name;
  const route = strip.route ?? "";
  if (strip.direct && ownOut) out.push(ownOut);
  for (const g of routeGroups(route)) {
    if (g < 1 || (shape.groups && g > shape.groups)) continue;
    if (has(`Group ${g} Out`)) out.push(`Group ${g} Out`);
    else if (shape.groupsOnTrackOuts && shape.groups) {
      for (let n = g; n <= shape.channels; n += shape.groups) {
        const t = device.ports.find((p) => {
          const s = stripPort(p.name);
          return s?.number === n && s.role === "out";
        });
        if (t) out.push(t.name);
      }
    }
  }
  if (routesToMix(route) || (!strip.direct && !routeGroups(route).length)) {
    for (const n of ["Mix Out L", "Mix Out R", "Main Out L", "Main Out R"]) if (has(n)) out.push(n);
  }
  for (const a of parseAux(strip.aux)) if (has(`Aux ${a} Out`)) out.push(`Aux ${a} Out`);
  return [...new Set(out)];
}

/** Where a signal entering `port` leaves the device, for devices the signal passes through. */
export function internalOutputs(device: PlanDevice, port: string, strips: Map<number, ChannelStrip>): string[] {
  if (device.patch) {
    const r = rearPoint(device, port);
    if (!r || !isNormalled(device.patch.modes[r.column])) return [];
    return [`${r.row === "top" ? "Bottom" : "Top"} ${r.column}`];
  }
  if (PASS_THROUGH.includes(device.category as Category)) {
    return device.ports.filter((p) => p.direction === "out" && p.signal === "audio").map((p) => p.name);
  }
  if (isConsole(device)) {
    const s = stripPort(port);
    if (s && (s.role === "mic" || s.role === "line" || s.role === "tape" || s.role === "insert")) {
      const strip = strips.get(s.number) ?? { number: s.number };
      return stripOutputs(device, strip);
    }
    if (/^FX Return|^Group \d+ Insert|^Mix Insert/i.test(port)) {
      return device.ports.filter((p) => /^Mix Out|^Main Out/i.test(p.name)).map((p) => p.name);
    }
  }
  return [];
}

export interface Step {
  device: number;
  port: string;
  cable?: PlanCable;
}

/**
 * Follows a signal from an output port: along its cable, through whatever
 * passes it on (normalled patchbay points, pedals, the console's routing),
 * until it reaches something that doesn't (an interface, a monitor), or a
 * device already on the path. Returns every path found.
 */
export function tracePaths(devices: PlanDevice[], cables: PlanCable[], start: Step, strips: Map<number, Map<number, ChannelStrip>>, limit = 16): Step[][] {
  const byId = new Map(devices.map((d) => [d.id, d]));
  const usage = cablesByPort(cables);
  const paths: Step[][] = [];
  // A signal may cross the same patchbay or desk several times, at different
  // sockets; it stops when it comes back to a socket it already went through.
  const walk = (path: Step[], seen: Set<string>) => {
    const here = path[path.length - 1]!;
    if (path.length > limit) {
      paths.push(path);
      return;
    }
    const links = usage.get(portKey(here.device, here.port)) ?? [];
    let went = false;
    for (const c of links) {
      if (c.id === here.cable?.id) continue;
      const far = c.from?.device === here.device && c.from.port === here.port ? c.to : c.from;
      if (!far) continue;
      const dev = byId.get(far.device);
      if (!dev) continue;
      const arrived: Step = { device: far.device, port: far.port, cable: c };
      const key = portKey(far.device, far.port);
      const outs = internalOutputs(dev, far.port, strips.get(dev.id) ?? new Map());
      went = true;
      if (!outs.length || seen.has(key)) {
        paths.push([...path, arrived]);
        continue;
      }
      for (const o of outs) walk([...path, arrived, { device: dev.id, port: o }], new Set([...seen, key, portKey(dev.id, o)]));
    }
    if (!went) paths.push(path);
  };
  walk([start], new Set([portKey(start.device, start.port)]));
  return paths;
}

/**
 * Aux feedback: an aux send that comes back into a channel whose strip says
 * it sends to that same aux (through pedals and patchbays). The classic way
 * to howl, and to cook a pedal.
 */
export function findConsoleLoops(devices: PlanDevice[], cables: PlanCable[], strips: Map<number, Map<number, ChannelStrip>>): Issue[] {
  const issues: Issue[] = [];
  const reported = new Set<string>();
  for (const c of devices) {
    if (!isConsole(c)) continue;
    const mine = strips.get(c.id) ?? new Map<number, ChannelStrip>();
    for (const p of c.ports) {
      const a = /^Aux\s+(\d+)\s+Out/i.exec(p.name);
      if (!a) continue;
      const aux = Number(a[1]);
      for (const path of tracePaths(devices, cables, { device: c.id, port: p.name }, strips)) {
        const back = path.findIndex((s, i) => i > 0 && s.device === c.id && stripPort(s.port) && ["mic", "line", "tape"].includes(stripPort(s.port)!.role));
        if (back < 0) continue;
        const n = stripPort(path[back]!.port)!.number;
        const strip = mine.get(n);
        if (!strip || !parseAux(strip.aux).includes(aux)) continue;
        // One report per aux and channel, whatever the number of paths through it.
        const key = `${c.id}:${aux}:${n}`;
        if (reported.has(key)) continue;
        reported.add(key);
        const cablesOnPath = path.flatMap((s) => (s.cable ? [s.cable] : []));
        const through = path
          .slice(1, back)
          .filter((s, i, arr) => s.cable && (i === 0 || arr[i - 1]!.device !== s.device))
          .map((s) => devices.find((d) => d.id === s.device)?.name ?? "?");
        issues.push({
          kind: "loop",
          cable: cablesOnPath[0]!,
          others: cablesOnPath.slice(1),
          message: `Aux ${aux} feedback on ${c.name}: Aux ${aux} Out → ${[...new Set(through)].join(" → ")} → Ch ${n} (${strip.label || "unnamed"}), which sends to Aux ${aux}. Turn that channel's Aux ${aux} down, or route the return to an FX return.`,
        });
      }
    }
  }
  return issues;
}

// ---- The view ----

export function consoleView(device: PlanDevice, stripData: ChannelStrip[], devices: PlanDevice[], cables: PlanCable[], issues: Issue[]): ConsoleView {
  const shape = consoleShape(device);
  const byId = new Map(devices.map((d) => [d.id, d]));
  const usage = cablesByPort(cables);
  const loopCables = new Set(issues.filter((i) => i.kind === "loop").flatMap((i) => [i.cable, ...(i.others ?? [])].map((c) => c.id)));
  const socket = (p: PlanPort, role: SocketRole): Socket => ({
    port: p.name,
    role,
    direction: p.direction,
    ends: (usage.get(portKey(device.id, p.name)) ?? []).map((c) => {
      const far = c.from?.device === device.id && c.from.port === p.name ? c.to : c.from;
      const d = far ? byId.get(far.device) : undefined;
      return {
        cableId: c.id,
        cableCode: c.code,
        deviceId: d?.id,
        deviceName: d?.name ?? "?",
        deviceCode: d?.code,
        port: far?.port ?? "?",
        direction: d?.ports.find((x) => x.name === far?.port)?.direction,
      };
    }),
  });

  const byStrip = new Map<number, Socket[]>();
  const sections = new Map<string, Socket[]>();
  for (const p of device.ports) {
    const s = stripPort(p.name);
    if (s) {
      byStrip.set(s.number, [...(byStrip.get(s.number) ?? []), socket(p, s.role)]);
    } else {
      const sec = sectionOf(p.name);
      sections.set(sec, [...(sections.get(sec) ?? []), socket(p, "other")]);
    }
  }
  const data = new Map(stripData.map((s) => [s.number, s]));
  const channels = Math.max(shape.channels, ...stripData.map((s) => s.number));
  const strips: StripView[] = [];
  for (let n = 1; n <= channels; n++) {
    const s = data.get(n);
    const sockets = byStrip.get(n) ?? [];
    strips.push({
      number: n,
      label: s?.label ?? "",
      source: s?.source ?? undefined,
      route: s?.route ?? "",
      direct: !!s?.direct,
      aux: parseAux(s?.aux),
      color: s?.color ?? "",
      note: s?.note ?? "",
      sockets,
      outputs: stripOutputs(device, s ?? { number: n }, shape),
      loop: sockets.some((k) => k.ends.some((e) => loopCables.has(e.cableId))),
    });
  }
  return {
    id: device.id,
    name: device.name,
    code: device.code,
    channels,
    groups: shape.groups,
    auxes: shape.auxes,
    groupsOnTrackOuts: shape.groupsOnTrackOuts,
    strips,
    sections: SECTION_ORDER.filter((t) => sections.has(t)).map((title) => ({ title, sockets: sections.get(title)! })),
  };
}
