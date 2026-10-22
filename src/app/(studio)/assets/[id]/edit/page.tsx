import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { deleteDevice } from "@/app/actions";
import { DeleteForm } from "@/components/action-form";
import { DeviceForm } from "@/components/device-form";
import { Help } from "@/components/help";
import { Card, PageHeader } from "@/components/ui";
import { getDevice, getLocations } from "@/lib/data";

export const metadata: Metadata = { title: "Edit asset" };

export default async function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [device, locations] = await Promise.all([getDevice(id), getLocations()]);
  if (!device) notFound();
  return (
    <>
      <PageHeader title={`Edit ${device.name}`} />
      <Help topic="asset-form" />
      <DeviceForm device={device} locations={locations} />
      <Card title="Delete" className="mt-10 border-bad/30">
        <p className="mb-3 text-sm text-dim">
          Sold it? Set its state to <em>Sold</em> to keep its history. Delete it only if it was a mistake: its cables must be removed first.
        </p>
        <DeleteForm action={deleteDevice} id={device.id} label="Delete this device" confirm={`Delete ${device.name}? This can't be undone.`} />
      </Card>
    </>
  );
}
