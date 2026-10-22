/** The languages the app is available in. */
export const LOCALES = ["en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

/** Used when nothing else says otherwise. */
export const DEFAULT_LOCALE: Locale = "en";

/** The cookie the switcher writes; read on every request. */
export const LOCALE_COOKIE = "studio_lang";

/** What each language calls itself, for the switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/**
 * The best of our languages for an Accept-Language header
 * ("fr-FR,fr;q=0.9,en;q=0.8" → "fr"). Quality values are respected; anything
 * we don't have is skipped.
 */
export function pickLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const wanted = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => /^q=([\d.]+)$/.exec(p.trim())?.[1]).find(Boolean);
      return { tag: (tag ?? "").toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((l) => l.tag)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of wanted) {
    const base = tag.split("-")[0]!;
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
