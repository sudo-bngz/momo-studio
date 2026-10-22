/**
 * The reader's language, on the server.
 *
 *   const { t, d } = await getI18n();
 *   <h1>{t("assets.title")}</h1>
 *   <p>{d.money(total)}</p>
 *
 * The locale comes from the cookie the switcher writes, and failing that from
 * the browser's Accept-Language, so a French browser gets French on its first
 * visit without choosing anything. `cache` makes the cookie read once per
 * request however many components ask.
 */
import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import { dates } from "./format";
import { isLocale, pickLocale, LOCALE_COOKIE, type Locale } from "./locales";
import { makeT, type I18n } from "./translate";

export const getLocale = cache(async (): Promise<Locale> => {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;
  return pickLocale((await headers()).get("accept-language"));
});

export const getI18n = cache(async (): Promise<I18n> => {
  const locale = await getLocale();
  return { ...makeT(locale), d: dates(locale) };
});

export { dates } from "./format";
export { LOCALES, LOCALE_COOKIE, LOCALE_NAMES, isLocale, type Locale } from "./locales";
export { makeT, type T, type P, type I18n } from "./translate";
export type { MessageKey } from "./messages";
