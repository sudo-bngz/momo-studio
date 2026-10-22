import type { ReactNode } from "react";

import { logout } from "@/app/actions";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/logo";
import { Nav } from "@/components/nav";
import { getI18n } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/client";

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const { locale, t } = await getI18n();
  return (
    <I18nProvider locale={locale}>
      <div className="md:flex">
        <aside className="no-print border-b border-line bg-panel md:sticky md:top-0 md:h-dvh md:w-56 md:shrink-0 md:border-r md:border-b-0">
          <div className="flex items-center gap-3 px-4 py-4">
            <Logo />
            <span className="font-semibold">{t("app.name")}</span>
          </div>
          <div className="px-2 pb-3">
            <Nav />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 pb-3 md:absolute md:inset-x-0 md:bottom-4 md:pb-0">
            <form action={logout}>
              <button className="text-xs text-faint hover:text-ink">{t("action.signOut")}</button>
            </form>
            <LocaleSwitcher locale={locale} t={t} />
          </div>
        </aside>
        <main className="print-sheet min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </I18nProvider>
  );
}
