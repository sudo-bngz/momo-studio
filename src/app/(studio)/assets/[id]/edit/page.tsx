import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { deleteDevice } from "@/app/actions";
import { DeleteForm } from "@/components/action-form";
import { DeviceForm } from "@/components/device-form";
import { Help } from "@/components/help";
import { Card, PageHeader } from "@/components/ui";
import { getDevice, getLocations } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { deviceStateLabel } from "@/lib/vocab";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("assets.meta.edit") };
}

export default async function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getI18n();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [device, locations] = await Promise.all([getDevice(id), getLocations()]);
  if (!device) notFound();
  return (
    <>
      <PageHeader title={t("assets.edit.title", { name: device.name })} />
      <Help topic="asset-form" />
      <DeviceForm device={device} locations={locations} />
      <Card title={t("action.delete")} className="mt-10 border-bad/30">
        <p className="mb-3 text-sm text-dim">{t("assets.delete.hint", { state: deviceStateLabel(t, "sold") })}</p>
        <DeleteForm
          action={deleteDevice}
          id={device.id}
          label={t("assets.delete.button")}
          confirm={t("assets.delete.confirm", { name: device.name })}
        />
      </Card>
    </>
  );
}
