import type { Metadata } from "next";

import { PlanDiagram } from "@/components/plan-diagram";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getCables, getDevices } from "@/lib/data";
import { findIssues } from "@/lib/patch";
import { toPlanCable, toPlanDevice } from "@/lib/plan-data";

export const metadata: Metadata = { title: "Patch plan" };

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const [devices, cables] = await Promise.all([getDevices(), getCables()]);
  const planDevices = devices.filter((d) => d.state !== "sold").map(toPlanDevice);
  const planCables = cables.map(toPlanCable);
  const issues = findIssues(planDevices, planCables);
  const focusId = Number(focus) || undefined;
  return (
    <>
      <PageHeader
        title="Patch plan"
        subtitle={issues.length ? `${issues.length} issue(s) in the plan: see the cables page.` : "How everything is wired, right now."}
        actions={
          <>
            <ButtonLink href="/cables#issues">Issues</ButtonLink>
            <ButtonLink href="/cables/new" primary>
              Add cable
            </ButtonLink>
          </>
        }
      />
      <PlanDiagram key={focusId ?? "all"} devices={planDevices} cables={planCables} focus={planDevices.some((d) => d.id === focusId) ? focusId : undefined} />
    </>
  );
}
