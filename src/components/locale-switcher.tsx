/**
 * EN | FR in the sidebar. A form per language rather than a select, so it
 * works without JavaScript and needs no client component: each button is a
 * one-field post to the action that writes the cookie.
 */
import { setLocale } from "@/app/actions";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/locales";
import type { T } from "@/lib/i18n/translate";

export function LocaleSwitcher({ locale, t }: { locale: Locale; t: T }) {
  return (
    <div className="no-print inline-flex overflow-hidden rounded-md border border-line" role="group" aria-label={t("lang.label")}>
      {LOCALES.map((l) => {
        const current = l === locale;
        return (
          <form key={l} action={setLocale}>
            <input type="hidden" name="locale" value={l} />
            <button
              type="submit"
              aria-current={current ? "true" : undefined}
              title={current ? LOCALE_NAMES[l] : t("lang.switchTo", { language: LOCALE_NAMES[l] })}
              className={`px-2 py-1 text-[11px] font-medium uppercase tracking-wider ${
                current ? "bg-raised text-amber" : "text-faint hover:text-ink"
              }`}
            >
              {l}
            </button>
          </form>
        );
      })}
    </div>
  );
}
