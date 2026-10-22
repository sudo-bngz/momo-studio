/**
 * Looking a message up and filling its blanks. Works on the server and in the
 * browser; `getI18n()` binds it on the server, `useI18n()` in a client
 * component.
 */
import { MESSAGES, type MessageKey, type PluralKey } from "./messages";
import { DEFAULT_LOCALE, type Locale } from "./locales";

export type Vars = Record<string, string | number>;

/** Translates one message, filling {name} from vars. */
export type T = (key: MessageKey, vars?: Vars) => string;

/**
 * Translates a counted message: `p("cables.count", 3)` reads
 * "cables.count.other" in English and in French, "cables.count.one" for 1.
 * The count is available to the message as {count}.
 */
export type P = (key: PluralKey, count: number, vars?: Vars) => string;

const fill = (text: string, vars?: Vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (all, name: string) => (name in vars ? String(vars[name]) : all)) : text;

export interface Translator {
  locale: Locale;
  t: T;
  p: P;
}

/** What a component gets: the translator plus the bound formatters. */
export interface I18n extends Translator {
  d: import("./format").Formats;
}

export function makeT(locale: Locale): Translator {
  const table = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
  const rules = new Intl.PluralRules(locale);

  // A key with no message falls back to English, then to the key itself, so a
  // half-translated build shows a word rather than a blank or a crash.
  const t: T = (key, vars) => fill(table[key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key, vars);

  const p: P = (key, count, vars) => {
    const form = rules.select(count);
    const exact = `${key}.${form}` as MessageKey;
    const other = `${key}.other` as MessageKey;
    const text = table[exact] ?? table[other] ?? MESSAGES[DEFAULT_LOCALE][other] ?? key;
    return fill(text, { count, ...vars });
  };

  return { locale, t, p };
}
