import type { Metadata } from "next";
import Link from "next/link";

import { removePerson, savePerson } from "@/app/actions";
import { ActionForm, DeleteForm } from "@/components/action-form";
import { ButtonLink, Card, Empty, Field, Input, PageHeader, Select } from "@/components/ui";
import { getMe, getPeople, suggestPassword, ROLE_NOTE } from "@/lib/people";

export const metadata: Metadata = { title: "Accounts" };

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string }> }) {
  const sp = await searchParams;
  const [me, { people, roles, forbidden }] = await Promise.all([getMe(), getPeople()]);
  const editing = people.find((p) => p.id === Number(sp.edit));
  const showForm = Boolean(editing || sp.new);
  const roleOptions = (roles.length ? roles.map((r) => r.name) : ["admin", "editor", "viewer", "studio-staff"])
    .filter((n) => n !== "public")
    .map((name) => ({ value: name, label: ROLE_NOTE[name] ? `${name} — ${ROLE_NOTE[name]}` : name }));

  if (forbidden || !me.isAdmin) {
    return (
      <>
        <PageHeader title="Accounts" subtitle="Who can sign in to the studio." />
        <Card className="border-warn/40">
          <p className="text-sm text-warn">
            Only an administrator manages accounts. You are signed in as <strong>{me.username}</strong> with the role{" "}
            <strong>{me.role}</strong>.
          </p>
          <p className="mt-2 text-sm text-dim">
            An admin can add you, or create an account for someone else here, in GoHead&apos;s own admin, or with{" "}
            <code className="font-mono text-xs text-amber">npm run gohead:access -- --user alex</code>.
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Accounts"
        subtitle="Everyone signs in with their own account, so the activity trail says who did what."
        actions={<ButtonLink href="/people?new=1" primary>Add someone</ButtonLink>}
      />

      {showForm ? (
        <Card title={editing ? `Edit ${editing.username}` : "New account"} className="mb-6">
          <ActionForm action={savePerson} submit={editing ? "Save" : "Create the account"} footer={<ButtonLink href="/people">Cancel</ButtonLink>}>
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            {editing ? <input type="hidden" name="username" value={editing.username} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {editing ? null : (
                <Field label="Username" hint="What they type to sign in">
                  <Input name="username" required placeholder="alex" autoCapitalize="none" />
                </Field>
              )}
              <Field label="Email">
                <Input name="email" type="email" required={!editing} defaultValue={editing?.email ?? ""} />
              </Field>
              <Field label="Role" hint={<Link href="/activity" className="underline hover:text-amber">Their changes are recorded under their name</Link>}>
                <Select name="role_name" options={roleOptions} defaultValue={editing?.role ?? "studio-staff"} />
              </Field>
              <Field label={editing ? "New password" : "Password"} hint={editing ? "Leave empty to keep it" : "12 characters or more"}>
                <Input name="password" defaultValue={editing ? "" : suggestPassword()} className="font-mono" />
              </Field>
            </div>
            <p className="mt-3 text-xs text-faint">
              The password is shown here once: copy it and give it to them. They can change it in GoHead&apos;s admin.
            </p>
          </ActionForm>
          {editing && editing.username !== me.username ? (
            <div className="mt-6 border-t border-line pt-4">
              <DeleteForm
                action={removePerson}
                id={editing.id}
                label={`Delete ${editing.username}`}
                confirm={`Delete the account ${editing.username}? What they changed stays in the activity trail.`}
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
                <th>Account</th>
                <th>Email</th>
                <th>Role</th>
                <th>Changes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="font-medium">{p.username}</span>
                    {p.username === me.username ? <span className="ml-2 text-xs text-amber">you</span> : null}
                  </td>
                  <td className="text-dim">{p.email ?? "—"}</td>
                  <td>
                    <span className="font-mono text-xs">{p.role}</span>
                    {ROLE_NOTE[p.role] ? <div className="text-xs text-faint">{ROLE_NOTE[p.role]}</div> : null}
                  </td>
                  <td>
                    <Link href={`/activity?actorKind=user&actor=${encodeURIComponent(p.username)}`} className="text-xs text-dim hover:text-amber">
                      What they changed →
                    </Link>
                  </td>
                  <td className="text-right">
                    <Link href={`/people?edit=${p.id}`} className="text-xs text-dim hover:text-ink">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No account yet.</Empty>
      )}

      <p className="mt-4 text-xs text-faint">
        Accounts are GoHead users: the same ones that open GoHead&apos;s admin. Roles decide what each may change, and the app
        acts as the signed-in person for every read and write — which is what makes the activity trail trustworthy.
      </p>
    </>
  );
}
