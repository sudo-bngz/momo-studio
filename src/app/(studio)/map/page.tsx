import type { Metadata } from "next";

import { Help } from "@/components/help";
import { StudioMap } from "@/components/studio-map";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getI18n } from "@/lib/i18n";
import { getStudioMap } from "@/lib/studio-map-data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("places.meta.map") };
}

export default async function MapPage({ searchParams }: { searchParams: Promise<{ place?: string }> }) {
  const { t } = await getI18n();
  const { place } = await searchParams;
  const map = await getStudioMap();
  const focus = Number(place);
  return (
    <>
      <PageHeader
        title={t("places.map.title")}
        subtitle={t("places.map.subtitle")}
        actions={<ButtonLink href="/places">{t("places.action.roomsLocations")}</ButtonLink>}
      />
      <Help topic="map" />
      <StudioMap {...map} focus={map.places.some((p) => p.id === focus) ? focus : undefined} />
    </>
  );
}
