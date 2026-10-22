import type { Metadata } from "next";

import { DeviceForm } from "@/components/device-form";
import { Help } from "@/components/help";
import { PageHeader } from "@/components/ui";
import { getLocations } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { CATEGORIES, isKey } from "@/lib/vocab";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("assets.meta.new") };
}

export default async function NewDevicePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { t } = await getI18n();
  const { category } = await searchParams;
  const locations = await getLocations();
  return (
    <>
      <PageHeader title={t("assets.add")} subtitle={t("assets.new.subtitle")} />
      <Help topic="asset-form" />
      <DeviceForm locations={locations} category={isKey(CATEGORIES, category) ? category : undefined} />
    </>
  );
}
