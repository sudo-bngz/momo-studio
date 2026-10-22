import type { Metadata } from "next";

import { StudioMap } from "@/components/studio-map";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getStudioMap } from "@/lib/studio-map-data";

export const metadata: Metadata = { title: "Studio map" };

export default async function MapPage({ searchParams }: { searchParams: Promise<{ place?: string }> }) {
  const { place } = await searchParams;
  const map = await getStudioMap();
  const focus = Number(place);
  return (
    <>
      <PageHeader
        title="Studio map"
        subtitle="Where everything stands, and the cable runs between racks, desks and stands. Click a place to look inside."
        actions={<ButtonLink href="/places">Rooms & locations</ButtonLink>}
      />
      <StudioMap {...map} focus={map.places.some((p) => p.id === focus) ? focus : undefined} />
    </>
  );
}
