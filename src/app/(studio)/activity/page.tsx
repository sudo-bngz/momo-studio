import type { Metadata } from "next";
import Link from "next/link";

import { RestoreButton } from "@/components/restore-button";
import { Badge, ButtonLink, Card, Empty, PageHeader } from "@/components/ui";
import { ACTION_LABEL, AUDITED, TYPE_LABEL, describeData, entryHref, getFeed, type ActorKind, type RevisionAction } from "@/lib/audit";
import { entryNames } from "@/lib/audit-names";
import { formatDateTime } from "@/lib/time";

export const metadata: Metadata = { title: "Activity" };

type Search = { collection?: string; action?: string; actorKind?: string; actor?: string; page?: string };

const ACTOR_KINDS: ActorKind[] = ["user", "token", "agent", "system"];

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const filter = {
    collection: AUDITED.includes(sp.collection as (typeof AUDITED)[number]) ? sp.collection : undefined,
    action: sp.action && sp.action in ACTION_LABEL ? (sp.action as RevisionAction) : undefined,
    actorKind: ACTOR_KINDS.includes(sp.actorKind as ActorKind) ? (sp.actorKind as ActorKind) : undefined,
    actor: sp.actor?.trim() || undefined,
    page,
  };
  const [{ revisions, pagination, forbidden }, nameOf] = await Promise.all([getFeed(filter), entryNames()]);
  const deleted = filter.action === "delete";
  const link = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") q.set(k, v);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return `/activity${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Activity"
        subtitle="Every change to the studio's content: who, what and when. Recorded by GoHead as each change is made."
        actions={<ButtonLink href="/activity?action=delete">Recently deleted</ButtonLink>}
      />

      {forbidden ? (
        <Card className="border-warn/40">
          <p className="text-sm text-warn">
            Your account may not read the history. GoHead keeps it for roles that can change content: ask an admin for the
            <strong> studio-staff</strong> role, or sign in as an admin.
          </p>
        </Card>
      ) : (
        <>
          <form method="get" className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
            <input name="actor" defaultValue={sp.actor} placeholder="Who (a username, a token or an agent)…" className="control" />
            <select name="collection" defaultValue={filter.collection ?? ""} className="control">
              <option value="">Everything</option>
              {AUDITED.map((c) => (
                <option key={c} value={c}>
                  {TYPE_LABEL[c]}
                </option>
              ))}
            </select>
            <select name="action" defaultValue={filter.action ?? ""} className="control">
              <option value="">Any change</option>
              {(Object.keys(ACTION_LABEL) as RevisionAction[]).map((a) => (
                <option key={a} value={a}>
                  {ACTION_LABEL[a].label}
                </option>
              ))}
            </select>
            <select name="actorKind" defaultValue={filter.actorKind ?? ""} className="control">
              <option value="">Anyone</option>
              {ACTOR_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k === "user" ? "People" : k === "token" ? "API tokens" : k === "agent" ? "Agents" : "The system"}
                </option>
              ))}
            </select>
            <button className="rounded-md border border-line-strong px-3 py-1.5 text-sm hover:bg-raised">Filter</button>
          </form>

          {deleted ? (
            <p className="mb-4 text-sm text-dim">
              Everything that was deleted. <strong className="text-ink">Bring it back</strong> puts the entry back under its own id, with
              the content it had.
            </p>
          ) : null}

          {revisions.length ? (
            <div className="overflow-x-auto rounded-lg border border-line bg-panel">
              <table className="data">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Who</th>
                    <th>What</th>
                    <th>Entry</th>
                    <th>Version</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {revisions.map((r) => {
                    const name = nameOf(r.typeName, r.entityId) ?? describeData(r.typeName, r.data);
                    const href = entryHref(r.typeName, r.entityId);
                    const action = ACTION_LABEL[r.action] ?? { label: r.action, tone: "muted" as const };
                    const gone = r.action === "delete" && !nameOf(r.typeName, r.entityId);
                    return (
                      <tr key={r.id}>
                        <td className="whitespace-nowrap text-dim">{formatDateTime(r.createdAt)}</td>
                        <td className="whitespace-nowrap">
                          {r.actorName ?? "—"}
                          <div className="text-xs text-faint">
                            {r.actorKind === "user" ? "person" : r.actorKind === "token" ? "API token" : r.actorKind}
                          </div>
                        </td>
                        <td>
                          <Badge tone={action.tone}>{action.label}</Badge>
                        </td>
                        <td>
                          <div className="text-xs text-faint">{TYPE_LABEL[r.typeName] ?? r.typeName}</div>
                          {href && !gone ? (
                            <Link href={href} className="hover:text-amber">
                              {name ?? `#${r.entityId}`}
                            </Link>
                          ) : (
                            <span className={gone ? "text-faint line-through" : undefined}>{name ?? `#${r.entityId}`}</span>
                          )}
                        </td>
                        <td className="tabular-nums text-dim">
                          v{r.version}
                          {r.restoredFrom ? <span className="text-xs text-faint"> ← v{r.restoredFrom}</span> : null}
                        </td>
                        <td className="whitespace-nowrap text-right">
                          <Link href={`/activity/${r.typeName}/${r.entityId}`} className="text-xs text-dim hover:text-ink">
                            History
                          </Link>
                          {gone ? (
                            <span className="ml-3 inline-block align-middle">
                              <RestoreButton collection={r.typeName} entry={r.entityId} version={r.version} label="Bring it back" />
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty>{deleted ? "Nothing has been deleted." : "No change recorded yet."}</Empty>
          )}

          {pagination && pagination.pageCount > 1 ? (
            <div className="mt-4 flex items-center gap-3 text-sm">
              {page > 1 ? <ButtonLink href={link(page - 1)}>← Newer</ButtonLink> : null}
              <span className="text-dim">
                Page {pagination.page} of {pagination.pageCount} · {pagination.total} changes
              </span>
              {page < pagination.pageCount ? <ButtonLink href={link(page + 1)}>Older →</ButtonLink> : null}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
