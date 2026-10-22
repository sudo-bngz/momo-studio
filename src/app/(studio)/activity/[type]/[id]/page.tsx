import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Help } from "@/components/help";
import { RestoreButton } from "@/components/restore-button";
import { Badge, ButtonLink, Card, Empty, PageHeader } from "@/components/ui";
import { ACTION_LABEL, AUDITED, TYPE_LABEL, describeData, entryHref, getHistory, getRevision } from "@/lib/audit";
import { entryNames } from "@/lib/audit-names";
import { formatDateTime } from "@/lib/time";

export const metadata: Metadata = { title: "History" };

/** A value as a short piece of text, whatever shape it has. */
function show(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.length ? `${v.length} item(s)` : "—";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 120);
  return String(v).slice(0, 160);
}

export default async function HistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ v?: string; compare?: string }>;
}) {
  const { type, id: rawId } = await params;
  const sp = await searchParams;
  const id = Number(rawId);
  if (!Number.isInteger(id) || !AUDITED.includes(type as (typeof AUDITED)[number])) notFound();

  const [{ revisions, forbidden }, nameOf] = await Promise.all([getHistory(type, id), entryNames()]);
  const chosen = Number(sp.v) || revisions[0]?.version;
  const compare = sp.compare === "current" ? "current" : "previous";
  const detail = chosen ? await getRevision(type, id, chosen, compare) : null;
  const name = nameOf(type, id) ?? describeData(type, revisions[0]?.data) ?? `#${id}`;
  const href = entryHref(type, id);
  const isGone = revisions[0]?.action === "delete";

  const link = (v: number, c: "previous" | "current") => `/activity/${type}/${id}?v=${v}${c === "current" ? "&compare=current" : ""}`;

  return (
    <>
      <PageHeader
        title={name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>{TYPE_LABEL[type] ?? type} · history</span>
            {isGone ? <Badge tone="bad">Deleted</Badge> : null}
          </span>
        }
        actions={
          <>
            <ButtonLink href="/activity">All activity</ButtonLink>
            {href && !isGone ? <ButtonLink href={href}>Open it</ButtonLink> : null}
          </>
        }
      />
      <Help topic="history" />

      {forbidden ? (
        <Card className="border-warn/40">
          <p className="text-sm text-warn">Your account may not read the history.</p>
        </Card>
      ) : revisions.length ? (
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <Card title={`${revisions.length} version(s)`}>
            <ol className="divide-y divide-line">
              {revisions.map((r) => {
                const action = ACTION_LABEL[r.action] ?? { label: r.action, tone: "muted" as const };
                const active = r.version === chosen;
                return (
                  <li key={r.version} className={`py-2 ${active ? "-mx-4 border-l-2 border-amber bg-raised/40 px-4" : ""}`}>
                    <Link href={link(r.version, compare)} className="block">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-dim">v{r.version}</span>
                        <Badge tone={action.tone}>{action.label}</Badge>
                      </div>
                      <div className="mt-1 text-sm">{r.actorName ?? "—"}</div>
                      <div className="text-xs text-faint">
                        {formatDateTime(r.createdAt)}
                        {r.actorKind !== "user" ? ` · ${r.actorKind}` : ""}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card
            title={detail ? `Version ${detail.version}` : "Pick a version"}
            actions={
              detail ? (
                <span className="flex gap-2 text-xs">
                  <Link href={link(detail.version, "previous")} className={compare === "previous" ? "text-amber" : "text-dim hover:text-ink"}>
                    vs previous
                  </Link>
                  <Link href={link(detail.version, "current")} className={compare === "current" ? "text-amber" : "text-dim hover:text-ink"}>
                    vs now
                  </Link>
                </span>
              ) : null
            }
          >
            {detail ? (
              <>
                {detail.changes?.length ? (
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>{compare === "current" ? "Now" : "Before"}</th>
                        <th>{compare === "current" ? "This version" : "After"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.changes.map((c) => (
                        <tr key={c.field}>
                          <td className="font-medium">{c.field.replace(/_/g, " ")}</td>
                          <td className="text-dim">{show(compare === "current" ? c.after : c.before)}</td>
                          <td className={c.change === "removed" ? "text-bad" : "text-ok"}>{show(compare === "current" ? c.before : c.after)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-dim">
                    {compare === "current" ? "This version matches the content as it stands." : "Nothing changed in this version's fields."}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                  <RestoreButton
                    collection={type}
                    entry={id}
                    version={detail.version}
                    primary
                    label={isGone ? "Bring it back" : `Restore version ${detail.version}`}
                    confirm={
                      isGone
                        ? `Bring ${name} back as it was at version ${detail.version}?`
                        : `Make version ${detail.version} the current content of ${name}?`
                    }
                  />
                  <span className="text-xs text-faint">
                    A restore is itself recorded, so it can be undone. Fields the content model no longer has are left out.
                  </span>
                </div>
              </>
            ) : (
              <Empty>Pick a version on the left.</Empty>
            )}
          </Card>
        </div>
      ) : (
        <Empty>No history for this entry.</Empty>
      )}
    </>
  );
}
