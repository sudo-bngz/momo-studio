import type { Metadata } from "next";
import Link from "next/link";

import { removePerson, savePerson } from "@/app/actions";
import { ActionForm, DeleteForm } from "@/components/action-form";
import { Help } from "@/components/help";
import { ButtonLink, Card, Empty, Field, Input, PageHeader, Select } from "@/components/ui";
import { getI18n, type MessageKey } from "@/lib/i18n";
import { getMe, getPeople, suggestPassword, ROLE_NOTE } from "@/lib/people";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("ops.meta.people") };
}

/** What GoHead's own roles mean here, in the reader's language. */
const ROLE_NOTE_KEY = {
  admin: "ops.roleNote.admin",
  editor: "ops.roleNote.editor",
  viewer: "ops.roleNote.viewer",
  "studio-staff": "ops.roleNote.studioStaff",
} as const satisfies Record<string, MessageKey>;

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string }> }) {
  const { t } = await getI18n();
  const sp = await searchParams;
  const [me, { people, roles, forbidden }] = await Promise.all([getMe(), getPeople()]);
  const editing = people.find((p) => p.id === Number(sp.edit));
  const showForm = Boolean(editing || sp.new);
  // A role we don't know keeps the note GoHead gives it, if any.
  const roleNote = (role: string) =>
    role in ROLE_NOTE_KEY ? t(ROLE_NOTE_KEY[role as keyof typeof ROLE_NOTE_KEY]) : ROLE_NOTE[role];
  const roleOptions = (roles.length ? roles.map((r) => r.name) : ["admin", "editor", "viewer", "studio-staff"])
    .filter((n) => n !== "public")
    .map((name) => {
      const note = roleNote(name);
      return { value: name, label: note ? `${name} — ${note}` : name };
    });

  if (forbidden || !me.isAdmin) {
    return (
      <>
        <PageHeader title={t("ops.people.title")} subtitle={t("ops.people.subtitleShort")} />
        <Card className="border-warn/40">
          <p className="text-sm text-warn">
            {t("ops.people.onlyAdmin")} <strong>{me.username}</strong> {t("ops.people.withRole")} <strong>{me.role}</strong>.
          </p>
          <p className="mt-2 text-sm text-dim">
            {t("ops.people.adminCanAdd")}{" "}
            <code className="font-mono text-xs text-amber">npm run gohead:access -- --user alex</code>
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("ops.people.title")}
        subtitle={t("ops.people.subtitle")}
        actions={
          <ButtonLink href="/people?new=1" primary>
            {t("ops.people.add")}
          </ButtonLink>
        }
      />
      <Help topic="people" />

      {showForm ? (
        <Card title={editing ? t("ops.people.editOne", { name: editing.username }) : t("ops.people.new")} className="mb-6">
          <ActionForm
            action={savePerson}
            submit={editing ? t("action.save") : t("ops.people.create")}
            footer={<ButtonLink href="/people">{t("action.cancel")}</ButtonLink>}
          >
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            {editing ? <input type="hidden" name="username" value={editing.username} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {editing ? null : (
                <Field label={t("ops.field.username")} hint={t("ops.field.username.hint")}>
                  <Input name="username" required placeholder="alex" autoCapitalize="none" />
                </Field>
              )}
              <Field label={t("ops.field.email")}>
                <Input name="email" type="email" required={!editing} defaultValue={editing?.email ?? ""} />
              </Field>
              <Field
                label={t("ops.field.role")}
                hint={
                  <Link href="/activity" className="underline hover:text-amber">
                    {t("ops.field.role.hint")}
                  </Link>
                }
              >
                <Select name="role_name" options={roleOptions} defaultValue={editing?.role ?? "studio-staff"} />
              </Field>
              <Field
                label={editing ? t("ops.field.newPassword") : t("ops.field.password")}
                hint={editing ? t("ops.field.password.keep") : t("ops.field.password.hint")}
              >
                <Input name="password" defaultValue={editing ? "" : suggestPassword()} className="font-mono" />
              </Field>
            </div>
            <p className="mt-3 text-xs text-faint">{t("ops.people.passwordOnce")}</p>
          </ActionForm>
          {editing && editing.username !== me.username ? (
            <div className="mt-6 border-t border-line pt-4">
              <DeleteForm
                action={removePerson}
                id={editing.id}
                label={t("ops.people.deleteOne", { name: editing.username })}
                confirm={t("ops.people.deleteConfirm", { name: editing.username })}
              />
            </div>
          ) : null}
        </Card>
      ) : null}

      {people.length ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-panel">
          <table className="data">
            <thead>
              <tr>
                <th>{t("ops.col.account")}</th>
                <th>{t("ops.col.email")}</th>
                <th>{t("ops.col.role")}</th>
                <th>{t("ops.col.changes")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {people.map((person) => {
                const note = roleNote(person.role);
                return (
                  <tr key={person.id}>
                    <td>
                      <span className="font-medium">{person.username}</span>
                      {person.username === me.username ? <span className="ml-2 text-xs text-amber">{t("ops.people.you")}</span> : null}
                    </td>
                    <td className="text-dim">{person.email ?? t("state.none")}</td>
                    <td>
                      <span className="font-mono text-xs">{person.role}</span>
                      {note ? <div className="text-xs text-faint">{note}</div> : null}
                    </td>
                    <td>
                      <Link
                        href={`/activity?actorKind=user&actor=${encodeURIComponent(person.username)}`}
                        className="text-xs text-dim hover:text-amber"
                      >
                        {t("ops.people.whatTheyChanged")}
                      </Link>
                    </td>
                    <td className="text-right">
                      <Link href={`/people?edit=${person.id}`} className="text-xs text-dim hover:text-ink">
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
        <Empty>{t("ops.people.empty")}</Empty>
      )}

      <p className="mt-4 text-xs text-faint">{t("ops.people.footer")}</p>
    </>
  );
}
