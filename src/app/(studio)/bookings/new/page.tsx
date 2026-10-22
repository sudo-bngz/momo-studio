import type { Metadata } from "next";

import { BookingForm } from "@/components/booking-form";
import { Help } from "@/components/help";
import { PageHeader } from "@/components/ui";
import { getClients, getDevices, getRooms } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { localDate, mondayOf } from "@/lib/time";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("bookings.meta.new") };
}

export default async function NewBookingPage({ searchParams }: { searchParams: Promise<{ date?: string; week?: string }> }) {
  const { t } = await getI18n();
  const sp = await searchParams;
  const [rooms, clients, devices] = await Promise.all([getRooms(), getClients(), getDevices()]);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "") ? sp.date! : undefined;
  const week = /^\d{4}-\d{2}-\d{2}$/.test(sp.week ?? "") ? sp.week! : date ? mondayOf(date) : undefined;
  const day = date ?? localDate(new Date());
  return (
    <>
      <PageHeader title={t("bookings.new")} />
      <Help topic="booking-form" />
      <BookingForm rooms={rooms} clients={clients} devices={devices} week={week} defaults={{ start: `${day}T10:00`, end: `${day}T18:00` }} />
    </>
  );
}
