import type { Metadata } from "next";
import Link from "next/link";

import { deletePlaceOrClient, saveClient } from "@/app/actions";
import { ActionForm, DeleteForm } from "@/components/action-form";
import { ButtonLink, Card, Empty, Field, Input, PageHeader, Textarea } from "@/components/ui";
import { getBookings, getClients, refId } from "@/lib/data";
import { formatMoney } from "@/lib/time";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string }> }) {
  const sp = await searchParams;
  const [clients, bookings] = await Promise.all([getClients(), getBookings("2000-01-01T00:00:00Z", "2100-01-01T00:00:00Z")]);
  const editing = clients.find((c) => c.id === Number(sp.edit));
  const showForm = Boolean(editing || sp.new);
  const stats = (id: number) => {
    const mine = bookings.filter((b) => refId(b.client) === id && b.state !== "cancelled");
    const billed = mine.reduce((s, b) => s + (b.price ?? 0), 0);
    const due = mine.filter((b) => !b.paid).reduce((s, b) => s + (b.price ?? 0), 0);
    return { sessions: mine.length, billed, due };
  };

  return (
    <>
      <PageHeader title="Clients" subtitle="Artists and people who book the studio." actions={<ButtonLink href="/clients?new=1" primary>Add client</ButtonLink>} />

      {showForm ? (
        <Card title={editing ? `Edit ${editing.name}` : "New client"} className="mb-6">
          <ActionForm action={saveClient} footer={<ButtonLink href="/clients">Cancel</ButtonLink>}>
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Name">
                <Input name="name" required defaultValue={editing?.name} />
              </Field>
              <Field label="Artist name">
                <Input name="artist_name" defaultValue={editing?.artist_name ?? ""} />
              </Field>
              <Field label="Email">
                <Input name="email" type="email" defaultValue={editing?.email ?? ""} />
              </Field>
              <Field label="Phone">
                <Input name="phone" type="tel" defaultValue={editing?.phone ?? ""} />
              </Field>
              <Field label="Notes" className="sm:col-span-2 lg:col-span-4">
                <Textarea name="notes" defaultValue={editing?.notes ?? ""} />
              </Field>
            </div>
          </ActionForm>
          {editing ? (
            <div className="mt-6 border-t border-line pt-4">
              <DeleteForm action={deletePlaceOrClient} id={editing.id} extra={{ type: "clients" }} label="Delete client" confirm={`Delete ${editing.name}? Their bookings stay, without a client.`} />
            </div>
          ) : null}
        </Card>
      ) : null}

      {clients.length ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-panel">
          <table className="data">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th className="text-right">Sessions</th>
                <th className="text-right">Billed</th>
                <th className="text-right">Unpaid</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const s = stats(c.id);
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="font-medium">{c.artist_name || c.name}</div>
                      {c.artist_name ? <div className="text-xs text-faint">{c.name}</div> : null}
                    </td>
                    <td className="text-dim">
                      {c.email ? <a href={`mailto:${c.email}`} className="hover:text-ink">{c.email}</a> : null}
                      {c.phone ? <div className="text-xs">{c.phone}</div> : null}
                    </td>
                    <td className="text-right tabular-nums">{s.sessions}</td>
                    <td className="text-right tabular-nums text-dim">{formatMoney(s.billed)}</td>
                    <td className={`text-right tabular-nums ${s.due ? "text-warn" : "text-dim"}`}>{formatMoney(s.due)}</td>
                    <td className="text-right">
                      <Link href={`/clients?edit=${c.id}`} className="text-xs text-dim hover:text-ink">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No clients yet.</Empty>
      )}
    </>
  );
}
