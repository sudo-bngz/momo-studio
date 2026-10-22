import type { Metadata } from "next";

import { DeviceScan } from "@/components/device-scan";
import { Help } from "@/components/help";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getDevices, getLocations } from "@/lib/data";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("scan.title") };
}

export default async function ScanPage() {
  const { t } = await getI18n();
  const [locations, devices] = await Promise.all([getLocations(), getDevices()]);
  return (
    <>
      <PageHeader
        title={t("scan.title")}
        subtitle={t("scan.subtitle")}
        actions={<ButtonLink href="/assets/new">{t("scan.byHand")}</ButtonLink>}
      />
      <Help topic="asset-scan" />
      <DeviceScan
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        existingCodes={devices.map((d) => d.code).filter(Boolean)}
      />
    </>
  );
}
