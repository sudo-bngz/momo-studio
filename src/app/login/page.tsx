import type { Metadata } from "next";

import { login } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Logo } from "@/components/logo";
import { Field, Input } from "@/components/ui";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("ops.meta.login") };
}

// This page is outside the studio layout, so there is no I18nProvider above
// it: the client bits of the form get their words as props, already in the
// reader's language.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  const { t } = await getI18n();
  const { next, expired } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <Logo />
          <div>
            <div className="text-lg font-semibold">{t("app.name")}</div>
            <div className="text-xs text-dim">{t("ops.login.tagline")}</div>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-panel p-6">
          {expired ? <p className="mb-4 text-sm text-warn">{t("ops.login.expired")}</p> : null}
          <ActionForm action={login} submit={t("ops.login.submit")}>
            <input type="hidden" name="next" value={next ?? ""} />
            <div className="space-y-4">
              <Field label={t("ops.login.username")}>
                <Input name="username" autoComplete="username" required autoFocus />
              </Field>
              <Field label={t("ops.field.password")}>
                <Input name="password" type="password" autoComplete="current-password" required />
              </Field>
            </div>
          </ActionForm>
        </div>
        <p className="mt-4 text-xs text-faint">{t("ops.login.note")}</p>
      </div>
    </main>
  );
}
