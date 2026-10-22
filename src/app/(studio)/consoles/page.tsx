import type { Metadata } from "next";
import Link from "next/link";

import { ConsoleBoard } from "@/components/console-board";
import { Help } from "@/components/help";
import { LoopWarnings } from "@/components/patchbay-bits";
import { ButtonLink, Empty, PageHeader } from "@/components/ui";
import { getConsoles } from "@/lib/console-data";
import { getI18n } from "@/lib/i18n";
import { categoryLabel } from "@/lib/vocab";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("console.meta.list") };
}

export default async function ConsolesPage() {
  const { t, p } = await getI18n();
  const { views, issues } = await getConsoles();
  const loops = [...new Set([...issues.values()].flat().filter((i) => i.kind === "loop"))];
  return (
    <>
      <PageHeader
        title={t("console.list.title")}
        subtitle={t("console.list.subtitle")}
        actions={<ButtonLink href="/assets/new?category=mixer">{t("console.list.add")}</ButtonLink>}
      />
      <Help topic="consoles" />
      {loops.length ? <LoopWarnings loops={loops} /> : null}
      {views.length ? (
        <div className="space-y-8">
          {views.map((v) => (
            <section key={v.id}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  <Link href={`/consoles/${v.id}`} className="hover:text-amber">
                    {v.name}
                  </Link>{" "}
                  <span className="font-mono text-xs text-amber">{v.code}</span>
                </h2>
                <span className="flex gap-3 text-sm">
                  <span className="text-dim">
                    {p("console.shape.channels", v.channels)} · {p("console.shape.groups", v.groups)} ·{" "}
                    {p("console.shape.auxes", v.auxes)} ·{" "}
                    {p("console.shape.inUse", v.strips.filter((s) => s.sockets.some((k) => k.ends.length)).length)}
                  </span>
                  <Link href={`/consoles/${v.id}`} className="text-amber hover:underline">
                    {t("console.list.edit")}
                  </Link>
                </span>
              </div>
              <ConsoleBoard view={v} />
            </section>
          ))}
        </div>
      ) : (
        <Empty>{t("console.list.empty", { category: categoryLabel(t, "mixer") })}</Empty>
      )}
    </>
  );
}
