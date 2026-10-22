import type { Metadata } from "next";

import { Help } from "@/components/help";
import { PlanDiagram } from "@/components/plan-diagram";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getCables, getDevices } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { findIssues } from "@/lib/patch";
import { toPlanCable, toPlanDevice } from "@/lib/plan-data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("cables.plan.title") };
}

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { t, p } = await getI18n();
  const { focus } = await searchParams;
  const [devices, cables] = await Promise.all([getDevices(), getCables()]);
  const planDevices = devices.filter((d) => d.state !== "sold").map(toPlanDevice);
  const planCables = cables.map(toPlanCable);
  const issues = findIssues(planDevices, planCables);
  const focusId = Number(focus) || undefined;
  return (
    <>
      <PageHeader
        title={t("cables.plan.title")}
        subtitle={issues.length ? p("cables.plan.issues", issues.length) : t("cables.plan.subtitle")}
        actions={
          <>
            <ButtonLink href="/cables#issues">{t("cables.plan.issuesLink")}</ButtonLink>
            <ButtonLink href="/cables/new" primary>
              {t("cables.add")}
            </ButtonLink>
          </>
        }
      />
      <Help topic="plan" />
      <PlanDiagram key={focusId ?? "all"} devices={planDevices} cables={planCables} focus={planDevices.some((d) => d.id === focusId) ? focusId : undefined} />
    </>
  );
}
