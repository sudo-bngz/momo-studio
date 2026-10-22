import type { Metadata } from "next";

import { CableForm, nextCableCode } from "@/components/cable-form";
import { PageHeader } from "@/components/ui";
import { getCables, getDevices } from "@/lib/data";
import { cablesByPort } from "@/lib/patch";
import { toPlanCable } from "@/lib/plan-data";

export const metadata: Metadata = { title: "Add cable" };

export default async function NewCablePage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { from, to } = await searchParams;
  const [devices, cables] = await Promise.all([getDevices(), getCables()]);
  const returnTo = from?.includes("::") ? `/gear/${from.split("::")[0]}` : undefined;
  return (
    <>
      <PageHeader title="Add cable" subtitle="Give it a code, write it on both ends, and say which two ports it joins." />
      <CableForm
        devices={devices}
        usage={cablesByPort(cables.map(toPlanCable))}
        suggestedCode={nextCableCode(cables)}
        from={from?.includes("::") ? from : undefined}
        to={to?.includes("::") ? to : undefined}
        returnTo={returnTo}
      />
    </>
  );
}
