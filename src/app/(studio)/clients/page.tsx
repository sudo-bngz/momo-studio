import type { Metadata } from "next";
import Link from "next/link";

import { deletePlaceOrClient, saveClient } from "@/app/actions";
import { ActionForm, DeleteForm } from "@/components/action-form";
import { Help } from "@/components/help";
import { ButtonLink, Card, Empty, Field, Input, PageHeader, Textarea } from "@/components/ui";
import { getBookings, getClients, refId } from "@/lib/data";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("bookings.clients.meta.title") };
}

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string }> }) {
  const { t, d } = await getI18n();
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
      <PageHeader
        title={t("bookings.clients.title")}
        subtitle={t("bookings.clients.subtitle")}
        actions={
          <ButtonLink href="/clients?new=1" primary>
            {t("bookings.clients.add")}
          </ButtonLink>
        }
      />
      <Help topic="clients" />

      {showForm ? (
        <Card
          title={editing ? t("bookings.clients.edit", { name: editing.name }) : t("bookings.clients.new")}
          className="mb-6"
        >
          <ActionForm action={saveClient} footer={<ButtonLink href="/clients">{t("action.cancel")}</ButtonLink>}>
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={t("bookings.clients.name")}>
                <Input name="name" required defaultValue={editing?.name} />
              </Field>
              <Field label={t("bookings.clients.artistName")}>
                <Input name="artist_name" defaultValue={editing?.artist_name ?? ""} />
              </Field>
              <Field label={t("bookings.clients.email")}>
                <Input name="email" type="email" defaultValue={editing?.email ?? ""} />
              </Field>
              <Field label={t("bookings.clients.phone")}>
                <Input name="phone" type="tel" defaultValue={editing?.phone ?? ""} />
              </Field>
              <Field label={t("bookings.notes")} className="sm:col-span-2 lg:col-span-4">
                <Textarea name="notes" defaultValue={editing?.notes ?? ""} />
              </Field>
            </div>
          </ActionForm>
          {editing ? (
            <div className="mt-6 border-t border-line pt-4">
              <DeleteForm
                action={deletePlaceOrClient}
                id={editing.id}
                extra={{ type: "clients" }}
                label={t("bookings.clients.delete")}
                confirm={t("bookings.clients.deleteConfirm", { name: editing.name })}
              />
            </div>
          ) : null}
        </Card>
      ) : null}

      {clients.length ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-panel">
          <table className="data">
            <thead>
              <tr>
                <th>{t("bookings.clients.col.client")}</th>
                <th>{t("bookings.clients.col.contact")}</th>
                <th className="text-right">{t("bookings.clients.col.sessions")}</th>
                <th className="text-right">{t("bookings.clients.col.billed")}</th>
                <th className="text-right">{t("bookings.clients.col.unpaid")}</th>
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
                    <td className="text-right tabular-nums text-dim">{d.money(s.billed)}</td>
                    <td className={`text-right tabular-nums ${s.due ? "text-warn" : "text-dim"}`}>{d.money(s.due)}</td>
                    <td className="text-right">
                      <Link href={`/clients?edit=${c.id}`} className="text-xs text-dim hover:text-ink">
                        {t("action.edit")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{t("bookings.clients.empty")}</Empty>
      )}
    </>
  );
}
