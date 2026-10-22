import type { Metadata } from "next";

import { CableForm, nextCableCode } from "@/components/cable-form";
import { Help } from "@/components/help";
import { PageHeader } from "@/components/ui";
import { getCables, getDevices } from "@/lib/data";
import { cablesByPort } from "@/lib/patch";
import { toPlanCable } from "@/lib/plan-data";

export const metadata: Metadata = { title: "Add cable" };

export default async function NewCablePage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { from, to } = await searchParams;
  const [devices, cables] = await Promise.all([getDevices(), getCables()]);
  // Back to where the patching started: the patchbay, or the device.
  const start = [from, to].find((v) => v?.includes("::"));
  const startDevice = start ? devices.find((d) => d.id === Number(start.split("::")[0])) : undefined;
  const returnTo = startDevice ? (startDevice.category === "patchbay" ? `/patchbays/${startDevice.id}` : `/assets/${startDevice.id}`) : undefined;
  return (
    <>
      <PageHeader title="Add cable" subtitle="Give it a code, write it on both ends, and say which two ports it joins." />
      <Help topic="cable-form" />
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
