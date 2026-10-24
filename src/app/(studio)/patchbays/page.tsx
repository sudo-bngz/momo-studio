import type { Metadata } from "next";
import Link from "next/link";

import { Help } from "@/components/help";
import { PatchbayBoard } from "@/components/patchbay-board";
import { LoopWarnings, ModeLegend } from "@/components/patchbay-bits";
import { ButtonLink, Empty, PageHeader } from "@/components/ui";
import { getI18n } from "@/lib/i18n";
import { getPatchbays } from "@/lib/patchbay-data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("patchbay.meta.title") };
}

export default async function PatchbaysPage() {
  const { t, p } = await getI18n();
  const { views, loops } = await getPatchbays();
  return (
    <>
      <PageHeader
        title={t("patchbay.title")}
        subtitle={t("patchbay.subtitle")}
        actions={<ButtonLink href="/assets/new?category=patchbay">{t("patchbay.add")}</ButtonLink>}
      />
      <Help topic="patchbays" walkthrough="patchbay" />
      <ModeLegend />
      {loops.length ? <LoopWarnings loops={loops} /> : null}
      {views.length ? (
        <div className="space-y-8">
          {views.map((v) => (
            <section key={v.id}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  <Link href={`/patchbays/${v.id}`} className="hover:text-amber">
                    {v.name}
                  </Link>{" "}
                  <span className="font-mono text-xs text-amber">{v.code}</span>
                </h2>
                <span className="flex gap-3 text-sm">
                  <span className="text-dim">
                    {p("patchbay.columnsUsed", v.columns, {
                      used: v.rows.filter((r) => r.top.ends.length || r.bottom.ends.length || r.top.text || r.bottom.text).length,
                    })}
                  </span>
                  <Link href={`/patchbays/${v.id}`} className="text-amber hover:underline">
                    {t("patchbay.edit")}
                  </Link>
                </span>
              </div>
              {v.columns ? <PatchbayBoard view={v} /> : <Empty>{t("patchbay.noColumns")}</Empty>}
            </section>
          ))}
        </div>
      ) : (
        <Empty>{t("patchbay.none")}</Empty>
      )}
    </>
  );
}
