import type { Metadata } from "next";

import { DeviceForm } from "@/components/device-form";
import { PageHeader } from "@/components/ui";
import { getLocations } from "@/lib/data";

export const metadata: Metadata = { title: "Add gear" };

export default async function NewDevicePage() {
  const locations = await getLocations();
  return (
    <>
      <PageHeader title="Add gear" subtitle="A synth, an expander, an interface, a patchbay: anything you own or patch." />
      <DeviceForm locations={locations} />
    </>
  );
}
