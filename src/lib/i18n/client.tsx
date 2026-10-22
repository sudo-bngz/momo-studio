"use client";

/**
 * The same translator, in a client component.
 *
 *   const { t, d } = useI18n();
 *
 * The locale is handed down once by the studio layout; the messages
 * themselves are in the bundle, so there is nothing to fetch and no flash of
 * English before French arrives.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { dates } from "./format";
import { DEFAULT_LOCALE, type Locale } from "./locales";
import { makeT, type I18n } from "./translate";

const Ctx = createContext<Locale>(DEFAULT_LOCALE);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const locale = useContext(Ctx);
  return useMemo(() => ({ ...makeT(locale), d: dates(locale) }), [locale]);
}

export function useLocale(): Locale {
  return useContext(Ctx);
}
