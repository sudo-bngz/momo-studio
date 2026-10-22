import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConsoleBoard } from "@/components/console-board";
import { getI18n } from "@/lib/i18n";
import { issueMessage } from "@/lib/issues";
import { Help } from "@/components/help";
import { LoopWarnings } from "@/components/patchbay-bits";
import { Badge, ButtonLink, PageHeader } from "@/components/ui";
import { getConsoles } from "@/lib/console-data";
import { getDevice } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("console.meta.detail") };
}

export default async function ConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getI18n();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [{ views, issues }, device] = await Promise.all([getConsoles(), getDevice(id)]);
  const view = views.find((v) => v.id === id);
  if (!view || !device) notFound();
  const mine = issues.get(id) ?? [];
  const loops = mine.filter((i) => i.kind === "loop");
  const others = mine.filter((i) => i.kind !== "loop");
  const location = device.location && typeof device.location === "object" ? device.location : undefined;
  return (
    <>
      <PageHeader
        title={view.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-amber">{view.code}</span>
            {location ? <span>{location.name}</span> : null}
            <Badge>{t("console.shape.badge", { ch: view.channels, grp: view.groups, aux: view.auxes })}</Badge>
            {device.notes ? <span className="text-faint">{device.notes}</span> : null}
          </span>
        }
        actions={
          <>
            <ButtonLink href={`/plan?focus=${id}`}>{t("action.showInPlan")}</ButtonLink>
            <ButtonLink href={`/cables/labels?device=${id}`}>{t("action.cableLabels")}</ButtonLink>
            <ButtonLink href={`/consoles/${id}/strip`}>{t("console.printScribble")}</ButtonLink>
            <ButtonLink href={`/assets/${id}/edit`}>{t("console.editDevice")}</ButtonLink>
          </>
        }
      />
      <Help topic="console" />
      {loops.length ? <LoopWarnings loops={loops} /> : null}
      {others.length ? (
        <ul className="mb-6 space-y-1 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          {others.map((i, k) => (
            <li key={k}>{issueMessage(t, i)}</li>
          ))}
        </ul>
      ) : null}
      <ConsoleBoard view={view} editable />
    </>
  );
}
