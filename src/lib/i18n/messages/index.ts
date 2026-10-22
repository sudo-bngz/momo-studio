/**
 * Every message, in every language.
 *
 * Keys are flat and dotted ("assets.title"), split into one file per area so
 * that two people — or two agents — editing different parts of the app never
 * touch the same file. English is the source: each French file is typed
 * against its English counterpart, so a missing or misspelt key is a compile
 * error rather than a word that silently stays in English.
 */
import { assets as enAssets } from "./en/assets";
import { bookings as enBookings } from "./en/bookings";
import { cables as enCables } from "./en/cables";
import { common as enCommon } from "./en/common";
import { console as enConsole } from "./en/console";
import { nav as enNav } from "./en/nav";
import { ops as enOps } from "./en/ops";
import { overview as enOverview } from "./en/overview";
import { patchbay as enPatchbay } from "./en/patchbay";
import { places as enPlaces } from "./en/places";
import { vocab as enVocab } from "./en/vocab";

import { assets as frAssets } from "./fr/assets";
import { bookings as frBookings } from "./fr/bookings";
import { cables as frCables } from "./fr/cables";
import { common as frCommon } from "./fr/common";
import { console as frConsole } from "./fr/console";
import { nav as frNav } from "./fr/nav";
import { ops as frOps } from "./fr/ops";
import { overview as frOverview } from "./fr/overview";
import { patchbay as frPatchbay } from "./fr/patchbay";
import { places as frPlaces } from "./fr/places";
import { vocab as frVocab } from "./fr/vocab";

import type { Locale } from "../locales";

export const en = {
  ...enCommon,
  ...enNav,
  ...enVocab,
  ...enOverview,
  ...enAssets,
  ...enPlaces,
  ...enCables,
  ...enPatchbay,
  ...enConsole,
  ...enBookings,
  ...enOps,
};

export type MessageKey = keyof typeof en;

export const fr: Record<MessageKey, string> = {
  ...frCommon,
  ...frNav,
  ...frVocab,
  ...frOverview,
  ...frAssets,
  ...frPlaces,
  ...frCables,
  ...frPatchbay,
  ...frConsole,
  ...frBookings,
  ...frOps,
};

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = { en, fr };

/**
 * The base of a message that has plural forms: "cables.count" when both
 * "cables.count.one" and "cables.count.other" exist.
 */
export type PluralKey = {
  [K in MessageKey]: K extends `${infer Base}.other` ? Base : never;
}[MessageKey];
