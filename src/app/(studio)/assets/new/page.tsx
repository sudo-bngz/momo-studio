import type { Metadata } from "next";

import { DeviceForm } from "@/components/device-form";
import { PageHeader } from "@/components/ui";
import { getLocations } from "@/lib/data";
import { CATEGORIES, isKey } from "@/lib/vocab";

export const metadata: Metadata = { title: "Add an asset" };

export default async function NewDevicePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const locations = await getLocations();
  return (
    <>
      <PageHeader title="Add an asset" subtitle="A synth, an expander, an interface, a patchbay, a mic: anything you own or patch." />
      <DeviceForm locations={locations} category={isKey(CATEGORIES, category) ? category : undefined} />
    </>
  );
}
