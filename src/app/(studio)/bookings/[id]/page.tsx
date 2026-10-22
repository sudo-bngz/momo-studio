import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { deleteBooking } from "@/app/actions";
import { DeleteForm } from "@/components/action-form";
import { BookingForm } from "@/components/booking-form";
import { Help } from "@/components/help";
import { Card, PageHeader } from "@/components/ui";
import { getBooking, getClients, getDevices, getRooms } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { localDate, mondayOf } from "@/lib/time";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("bookings.meta.detail") };
}

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, d } = await getI18n();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [booking, rooms, clients, devices] = await Promise.all([getBooking(id), getRooms(), getClients(), getDevices()]);
  if (!booking) notFound();
  const week = mondayOf(localDate(new Date(booking.starts_at)));
  return (
    <>
      <PageHeader title={booking.title} subtitle={d.range(booking.starts_at, booking.ends_at)} />
      <Help topic="booking-form" />
      <BookingForm booking={booking} rooms={rooms} clients={clients} devices={devices} week={week} />
      <Card title={t("action.delete")} className="mt-10 border-bad/30">
        <p className="mb-3 text-sm text-dim">{t("bookings.delete.hint")}</p>
        <DeleteForm
          action={deleteBooking}
          id={booking.id}
          label={t("bookings.delete.label")}
          confirm={t("bookings.delete.confirm", { title: booking.title })}
        />
      </Card>
    </>
  );
}
