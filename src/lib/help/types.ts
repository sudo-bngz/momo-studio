/**
 * The shape of the in-app manual, and which chapters exist — the parts that
 * are the same whatever language you read it in. The words themselves are in
 * en.ts and fr.ts.
 */

export interface HelpPoint {
  /** What's on screen: a column, a badge, a field, a term. */
  term: string;
  text: string;
}

/** Every topic there is, in the order they appear in the guide. */
export const GUIDE_ORDER = [
  "model",
  "overview",
  "assets",
  "asset",
  "asset-form",
  "racks",
  "places",
  "map",
  "cables",
  "cable-form",
  "cable-labels",
  "patchbays",
  "patchbay",
  "patchbay-strip",
  "consoles",
  "console",
  "console-strip",
  "plan",
  "bookings",
  "booking-form",
  "clients",
  "activity",
  "history",
  "people",
] as const;

export type TopicId = (typeof GUIDE_ORDER)[number];

export interface HelpTopic {
  /** Chapter heading in the guide, and the panel's "more about…" label. */
  title: string;
  /** One or two sentences, always visible on the page. */
  lede: string;
  /** What the things on screen mean. */
  points?: HelpPoint[];
  /** The common task, in order. */
  steps?: string[];
  /** Paragraphs shown only in the guide. */
  long?: string[];
  /** Other topics worth reading next. */
  see?: TopicId[];
}

/** The parts of the guide, and which chapters belong to each. */
export const PART_TOPICS = [
  { id: "idea", topics: ["model", "overview"] },
  { id: "gear", topics: ["assets", "asset", "asset-form", "racks", "places", "map"] },
  {
    id: "wiring",
    topics: ["cables", "cable-form", "cable-labels", "patchbays", "patchbay", "patchbay-strip", "consoles", "console", "console-strip", "plan"],
  },
  { id: "business", topics: ["bookings", "booking-form", "clients"] },
  { id: "running", topics: ["activity", "history", "people"] },
] as const satisfies ReadonlyArray<{ id: string; topics: readonly TopicId[] }>;

export type PartId = (typeof PART_TOPICS)[number]["id"];

/** Terms the `Tip` component looks up, so the same word reads the same everywhere. */
export const GLOSSARY_IDS = [
  "normal",
  "half_normal",
  "thru",
  "insert",
  "in-line",
  "track-out",
  "group",
  "aux",
  "direct-out",
  "strip",
  "pfl",
  "recall",
  "port",
  "revision",
] as const;

export type GlossaryId = (typeof GLOSSARY_IDS)[number];

/** One language's manual. */
export interface HelpContent {
  topics: Record<TopicId, HelpTopic>;
  parts: Record<PartId, { title: string; blurb: string }>;
  glossary: Record<GlossaryId, HelpPoint>;
}

export const isTopic = (v: string): v is TopicId => (GUIDE_ORDER as readonly string[]).includes(v);
