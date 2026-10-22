import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { deleteBooking } from "@/app/actions";
import { DeleteForm } from "@/components/action-form";
import { BookingForm } from "@/components/booking-form";
import { Card, PageHeader } from "@/components/ui";
import { getBooking, getClients, getDevices, getRooms } from "@/lib/data";
import { formatRange, localDate, mondayOf } from "@/lib/time";

export const metadata: Metadata = { title: "Booking" };

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [booking, rooms, clients, devices] = await Promise.all([getBooking(id), getRooms(), getClients(), getDevices()]);
  if (!booking) notFound();
  const week = mondayOf(localDate(new Date(booking.starts_at)));
  return (
    <>
      <PageHeader title={booking.title} subtitle={formatRange(booking.starts_at, booking.ends_at)} />
      <BookingForm booking={booking} rooms={rooms} clients={clients} devices={devices} week={week} />
      <Card title="Delete" className="mt-10 border-bad/30">
        <p className="mb-3 text-sm text-dim">Called off? Set it to Cancelled to keep a trace.</p>
        <DeleteForm action={deleteBooking} id={booking.id} label="Delete booking" confirm={`Delete “${booking.title}”?`} />
      </Card>
    </>
  );
}
