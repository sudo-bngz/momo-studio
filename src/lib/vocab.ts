/**
 * Labels and colors of the content model's options. The keys are the enum
 * options of gohead/model.json; keep them in sync when the model changes
 * (`npm run typecheck` tells you which are missing).
 */
import type { Booking, Cable, Device, Location, PatchPoint, Port } from "@/gohead";
import type { T } from "@/lib/i18n/translate";

export type Signal = Port["signal"];
export type Connector = NonNullable<Port["connector"]>;
export type Direction = Port["direction"];
export type Category = Device["category"];
export type DeviceState = Device["state"];
export type CableState = Cable["state"];
export type LocationKind = Location["kind"];
export type BookingState = Booking["state"];
export type SessionType = NonNullable<Booking["session_type"]>;

export const SIGNALS: Record<Signal, { label: string; color: string }> = {
  audio: { label: "Audio", color: "#f2a541" },
  midi: { label: "MIDI", color: "#a78bfa" },
  cv: { label: "CV", color: "#4ade80" },
  gate: { label: "Gate / trig", color: "#22d3ee" },
  clock: { label: "Clock / sync", color: "#f472b6" },
  digital_audio: { label: "Digital audio", color: "#fb7185" },
  usb: { label: "USB", color: "#60a5fa" },
  network: { label: "Network", color: "#94a3b8" },
  power: { label: "Power", color: "#ef4444" },
  control: { label: "Control / pedal", color: "#facc15" },
  other: { label: "Other", color: "#a3a3a3" },
};

export const CONNECTORS: Record<Connector, string> = {
  jack_ts: '6.35 mm TS',
  jack_trs: '6.35 mm TRS',
  minijack: "3.5 mm",
  xlr: "XLR",
  rca: "RCA",
  din5: "MIDI DIN",
  usb_a: "USB-A",
  usb_b: "USB-B",
  usb_c: "USB-C",
  adat: "ADAT / Toslink",
  spdif_coax: "S/PDIF coax",
  bnc: "BNC",
  ethernet: "Ethernet",
  iec: "IEC",
  dc: "DC",
  banana: "Banana",
  speakon: "Speakon",
  db25: "DB25",
  other: "Other",
};

export const DIRECTIONS: Record<Direction, string> = { in: "In", out: "Out", io: "In/Out" };

export const CATEGORIES: Record<Category, string> = {
  synth: "Synth",
  expander: "Expander / module",
  drum_machine: "Drum machine",
  sampler: "Sampler / groovebox",
  sequencer: "Sequencer",
  eurorack: "Eurorack",
  effect: "Effect",
  dynamics_eq: "Compressor / EQ",
  preamp: "Preamp",
  audio_interface: "Audio interface",
  mixer: "Mixer",
  patchbay: "Patchbay",
  monitor: "Monitor",
  headphones: "Headphones",
  microphone: "Microphone",
  controller: "Controller",
  computer: "Computer",
  midi_interface: "MIDI interface",
  power: "Power",
  other: "Other",
};

export const DEVICE_STATES: Record<DeviceState, { label: string; tone: Tone }> = {
  in_use: { label: "In use", tone: "ok" },
  spare: { label: "Spare", tone: "muted" },
  in_repair: { label: "In repair", tone: "warn" },
  loaned: { label: "Loaned", tone: "info" },
  for_sale: { label: "For sale", tone: "info" },
  sold: { label: "Sold", tone: "muted" },
};

export const CABLE_STATES: Record<CableState, { label: string; tone: Tone }> = {
  connected: { label: "Connected", tone: "ok" },
  spare: { label: "Spare", tone: "muted" },
  broken: { label: "Broken", tone: "bad" },
};

export const LOCATION_KINDS: Record<LocationKind, string> = {
  rack: "Rack",
  desk: "Desk",
  shelf: "Shelf / stand",
  wall: "Wall",
  case: "Case",
  storage: "Storage",
};

export const BOOKING_STATES: Record<BookingState, { label: string; tone: Tone }> = {
  tentative: { label: "Tentative", tone: "info" },
  confirmed: { label: "Confirmed", tone: "ok" },
  completed: { label: "Completed", tone: "muted" },
  cancelled: { label: "Cancelled", tone: "bad" },
};

export const SESSION_TYPES: Record<SessionType, string> = {
  recording: "Recording",
  production: "Production",
  mixing: "Mixing",
  mastering: "Mastering",
  rehearsal: "Rehearsal",
  rental: "Gear rental",
  other: "Other",
};

export type Tone = "ok" | "warn" | "bad" | "info" | "muted";

// ---- The same options, in the reader's language ----
//
// The records above keep the colours and tones, which are the same in every
// language; the words live in the message files. `t` comes from getI18n() on
// the server or useI18n() in a client component.

export const signalLabel = (t: T, v: Signal) => t(`signal.${v}`);
export const signalColor = (v: Signal) => SIGNALS[v].color;
export const connectorLabel = (t: T, v: Connector) => t(`connector.${v}`);
export const directionLabel = (t: T, v: Direction) => t(`direction.${v}`);
export const categoryLabel = (t: T, v: Category) => t(`category.${v}`);
export const deviceStateLabel = (t: T, v: DeviceState) => t(`deviceState.${v}`);
export const deviceStateTone = (v: DeviceState) => DEVICE_STATES[v].tone;
export const cableStateLabel = (t: T, v: CableState) => t(`cableState.${v}`);
export const cableStateTone = (v: CableState) => CABLE_STATES[v].tone;
export const locationKindLabel = (t: T, v: LocationKind) => t(`locationKind.${v}`);
export const bookingStateLabel = (t: T, v: BookingState) => t(`bookingState.${v}`);
export const bookingStateTone = (v: BookingState) => BOOKING_STATES[v].tone;
export const sessionTypeLabel = (t: T, v: SessionType) => t(`sessionType.${v}`);

/** A patchbay column's mode: its name, what's printed on the switch, and what it does. */
export const patchModeLabel = (t: T, v: PatchMode) => ({
  label: t(`patchMode.${v}`),
  short: t(`patchMode.${v}.short`),
  help: t(`patchMode.${v}.help`),
  color: PATCH_MODES[v].color,
});

/** `<Select options={...}>` for an enum of the content model, translated and in the model's order. */
export function translatedOptions<K extends string>(t: T, record: Record<K, unknown>, label: (t: T, value: K) => string) {
  return (Object.keys(record) as K[]).map((value) => ({ value, label: label(t, value) }));
}

export const options = <K extends string>(record: Record<K, string | { label: string }>) =>
  (Object.entries(record) as [K, string | { label: string }][]).map(([value, v]) => ({
    value,
    label: typeof v === "string" ? v : v.label,
  }));

export function isKey<K extends string>(record: Record<K, unknown>, value: unknown): value is K {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(record, value);
}

export type PatchMode = NonNullable<PatchPoint["mode"]>;

/**
 * How a patchbay column joins its two rear points when nothing is plugged in
 * the front. Short names are what's printed on most patchbays' mode switches.
 */
export const PATCH_MODES: Record<PatchMode, { label: string; short: string; color: string; help: string }> = {
  normal: {
    label: "Normal",
    short: "N",
    color: "#4ade80",
    help: "Top and bottom are connected. Plugging into either front jack breaks the link.",
  },
  half_normal: {
    label: "Half-normal",
    short: "H",
    color: "#facc15",
    help: "Top and bottom are connected. The top front jack takes a copy; only the bottom front jack breaks the link.",
  },
  thru: {
    label: "Thru",
    short: "T",
    color: "#22d3ee",
    help: "Not connected: each rear point only reaches its own front jack. Patch with a cord.",
  },
};

/** Effects that pass their input to their output: a loop through them feeds back. */
export const PASS_THROUGH: Category[] = ["effect", "dynamics_eq", "preamp"];
