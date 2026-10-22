/**
 * Reading sense into what the machine says is plugged in.
 *
 * The browser hands over port names, not gear: "Prophet-5 Port 1", "Elektron
 * Digitakt", "Fireface UFX II (24079103)". These helpers turn that into one
 * entry per machine, guess what kind of thing it is, and look for a template
 * that already knows its sockets.
 *
 * Pure functions, so they can be tested without a browser or a MIDI cable.
 */
import { TEMPLATES } from "@/lib/templates";
import type { Category } from "@/lib/vocab";

export type ScanSource = "midi" | "audio";

/** One port as the browser reported it. */
export interface RawPort {
  source: ScanSource;
  name: string;
  manufacturer?: string;
  direction: "in" | "out";
}

/** One machine, after the ports belonging to it have been gathered up. */
export interface Found {
  /** Stable within a scan, for React keys and the selection. */
  key: string;
  name: string;
  brand?: string;
  source: ScanSource;
  category: Category;
  /** Which directions were seen, so we know what sockets it certainly has. */
  midiIn: boolean;
  midiOut: boolean;
  audioIn: boolean;
  audioOut: boolean;
  /** The ports as reported, for the ones that are not obvious. */
  ports: string[];
  /** A template whose gear this looks like. */
  templateId?: string;
}

/**
 * The noise a port name carries around the gear's actual name: the port
 * number a multi-port interface adds, the serial a driver appends, the
 * "(Built-in)" macOS likes.
 */
const NOISE = [
  /\s*[-–(]\s*(?:port|bus|midi|usb)\s*\d+\s*\)?$/i,
  /\s+(?:port|bus)\s*\d+$/i,
  /\s*\(\s*\d{4,}\s*\)\s*$/, // a serial number in brackets
  /\s*\((?:built-in|intégré|integrated)\)\s*$/i,
  /\s*[-–]\s*(?:in|out|input|output|entrée|sortie)\s*\d*$/i,
  /\s*\b(?:midi\s*)?(?:in|out)\s*\d*$/i,
];

/** "Digitakt MIDI Out 2" → "Digitakt". */
export function cleanName(raw: string): string {
  let name = raw.trim();
  for (const re of NOISE) name = name.replace(re, "").trim();
  return name.replace(/\s{2,}/g, " ") || raw.trim();
}

/** Lower-case, no punctuation: for comparing names that are nearly the same. */
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * What kind of thing this is likely to be, from its name. A guess, shown so
 * it can be corrected — never saved without being seen.
 */
export function guessCategory(name: string, source: ScanSource): Category {
  const n = name.toLowerCase();
  const has = (...words: string[]) => words.some((w) => n.includes(w));
  if (has("fireface", "scarlett", "apollo", "babyface", "clarett", "motu", "audient", "interface", "ufx")) return "audio_interface";
  if (has("iconnect", "midisport", "mioxl", "mio", "midi interface", "unitor", "midihub")) return "midi_interface";
  if (has("digitakt", "digitone", "octatrack", "mpc", "sp-404", "groovebox", "rytm")) return "sampler";
  if (has("tr-8", "tr8", "drumbrute", "rytm", "tempest", "lxr", "machinedrum")) return "drum_machine";
  if (has("keystep", "beatstep", "launchpad", "push", "maschine", "controller", "faderfox", "nanokontrol")) return "controller";
  if (has("prophet", "juno", "jupiter", "moog", "sub 37", "minilogue", "blofeld", "virus", "ms-20", "matriarch", "synth")) return "synth";
  if (has("jv-", "jv1", "integra", "motif-rack", "nord rack", "expander", "module")) return "expander";
  if (has("macbook", "mac studio", "imac", "mac mini", "display", "built-in", "thunderbolt")) return "computer";
  if (has("genelec", "adam ", "yamaha hs", "monitor", "speaker", "enceinte")) return "monitor";
  if (has("headphone", "casque")) return "headphones";
  if (has("eurorack", "doepfer", "es-9", "expert sleepers")) return "eurorack";
  if (has("gs3", "gs-r", "mixer", "mixing", "console", "desk", "soundcraft", "mackie", "midas", "allen & heath", "allen and heath")) return "mixer";
  if (has("patchbay", "patch bay", "bantam", "tt patch")) return "patchbay";
  return source === "midi" ? "synth" : "audio_interface";
}

/** A template for this gear, if one of them is clearly the same machine. */
export function matchTemplate(name: string, brand?: string): string | undefined {
  const target = key(`${brand ?? ""}${name}`);
  const bare = key(name);
  let best: { id: string; score: number } | undefined;
  for (const tpl of TEMPLATES) {
    const candidates = [key(`${tpl.brand ?? ""}${tpl.model ?? ""}`), key(tpl.model ?? ""), key(tpl.name)].filter(Boolean);
    for (const c of candidates) {
      if (!c || c.length < 3) continue;
      // One has to contain the other: "juno106" matches "rolandjuno106",
      // and a template called "Synth, stereo out" matches nothing.
      const hit = target.includes(c) || bare.includes(c) || c.includes(bare);
      if (!hit) continue;
      const score = Math.min(c.length, bare.length);
      if (!best || score > best.score) best = { id: tpl.id, score };
    }
  }
  return best?.id;
}

const templateCategory = (id: string | undefined): Category | undefined =>
  id ? TEMPLATES.find((t) => t.id === id)?.category : undefined;

/**
 * One entry per machine from the ports the browser listed. MIDI reports a
 * port per direction and sometimes several per machine, so they are gathered
 * by name; audio devices are reported once per direction too.
 */
export function gather(ports: RawPort[]): Found[] {
  const byMachine = new Map<string, Found>();
  for (const port of ports) {
    const name = cleanName(port.name);
    if (!name) continue;
    const brand = port.manufacturer?.trim() && !/^generic$/i.test(port.manufacturer) ? port.manufacturer.trim() : undefined;
    const id = `${port.source}:${key(brand ?? "")}:${key(name)}`;
    const found =
      byMachine.get(id) ??
      ({
        key: id,
        name,
        brand,
        source: port.source,
        // A template knows what the machine is; the keyword guess is only
        // for the gear no template covers.
        category: templateCategory(matchTemplate(name, brand)) ?? guessCategory(`${brand ?? ""} ${name}`, port.source),
        midiIn: false,
        midiOut: false,
        audioIn: false,
        audioOut: false,
        ports: [],
        templateId: matchTemplate(name, brand),
      } satisfies Found);
    if (port.source === "midi") {
      if (port.direction === "in") found.midiIn = true;
      else found.midiOut = true;
    } else if (port.direction === "in") found.audioIn = true;
    else found.audioOut = true;
    if (!found.ports.includes(port.name)) found.ports.push(port.name);
    byMachine.set(id, found);
  }
  return [...byMachine.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The sockets we can be sure of without a template or a manual: a machine
 * that answered on a MIDI port has that MIDI port. Audio sockets are left
 * alone, because the count and the kind are exactly what we cannot know.
 */
export function certainPorts(found: Found): Array<{ name: string; direction: "in" | "out"; signal: "midi"; connector: "din5" }> {
  const ports: Array<{ name: string; direction: "in" | "out"; signal: "midi"; connector: "din5" }> = [];
  if (found.midiIn) ports.push({ name: "MIDI In", direction: "in", signal: "midi", connector: "din5" });
  if (found.midiOut) ports.push({ name: "MIDI Out", direction: "out", signal: "midi", connector: "din5" });
  return ports;
}

/** A code suggested from the name: "Roland Juno-106" → "JUN-01". */
export function suggestCode(name: string, taken: Set<string>): string {
  const letters = (name.replace(/[^A-Za-z]/g, "").slice(0, 3) || "GEN").toUpperCase();
  for (let n = 1; n < 100; n++) {
    const code = `${letters}-${String(n).padStart(2, "0")}`;
    if (!taken.has(code)) return code;
  }
  return letters;
}
