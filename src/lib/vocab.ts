/**
 * Labels and colors of the content model's options. The keys are the enum
 * options of gohead/model.json; keep them in sync when the model changes
 * (`npm run typecheck` tells you which are missing).
 */
import type { Booking, Cable, Device, Location, Port } from "@/gohead";

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

export const options = <K extends string>(record: Record<K, string | { label: string }>) =>
  (Object.entries(record) as [K, string | { label: string }][]).map(([value, v]) => ({
    value,
    label: typeof v === "string" ? v : v.label,
  }));

export function isKey<K extends string>(record: Record<K, unknown>, value: unknown): value is K {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(record, value);
}
