import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { deleteCable } from "@/app/actions";
import { DeleteForm } from "@/components/action-form";
import { CableForm } from "@/components/cable-form";
import { Help } from "@/components/help";
import { Card, PageHeader } from "@/components/ui";
import { getCable, getCables, getDevices } from "@/lib/data";
import { cablesByPort, findIssues } from "@/lib/patch";
import { toPlanCable, toPlanDevice } from "@/lib/plan-data";

export const metadata: Metadata = { title: "Cable" };

export default async function CablePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [cable, devices, cables] = await Promise.all([getCable(id), getDevices(), getCables()]);
  if (!cable) notFound();
  const issues = findIssues(devices.map(toPlanDevice), cables.map(toPlanCable)).filter(
    (i) => i.cable.id === id || i.others?.some((o) => o.id === id),
  );
  return (
    <>
      <PageHeader title={`Cable ${cable.code}`} />
      <Help topic="cable-form" />
      {issues.length ? (
        <ul className="mb-6 space-y-1 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          {issues.map((i, k) => (
            <li key={k}>{i.message}</li>
          ))}
        </ul>
      ) : null}
      <CableForm cable={cable} devices={devices} usage={cablesByPort(cables.map(toPlanCable))} />
      <Card title="Delete" className="mt-10 border-bad/30">
        <p className="mb-3 text-sm text-dim">Unplugged but still in the drawer? Set it to Spare instead.</p>
        <DeleteForm action={deleteCable} id={cable.id} label="Delete this cable" confirm={`Delete cable ${cable.code}?`} />
      </Card>
    </>
  );
}
