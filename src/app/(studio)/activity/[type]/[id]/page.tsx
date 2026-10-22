import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Help } from "@/components/help";
import { RestoreButton } from "@/components/restore-button";
import { Badge, ButtonLink, Card, Empty, PageHeader } from "@/components/ui";
import {
  AUDITED,
  actionBadge,
  actorKindLabel,
  describeData,
  entryHref,
  getHistory,
  getRevision,
  typeLabel,
} from "@/lib/audit";
import { entryNames } from "@/lib/audit-names";
import { getI18n } from "@/lib/i18n";
import type { P, T } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("ops.meta.history") };
}

/** A value as a short piece of text, whatever shape it has. */
function show(t: T, p: P, v: unknown): string {
  if (v === null || v === undefined || v === "") return t("state.none");
  if (Array.isArray(v)) return v.length ? p("ops.items", v.length) : t("state.none");
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
  const { t, p, d } = await getI18n();
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
            <span>{t("ops.history.subtitle", { type: typeLabel(t, type) })}</span>
            {isGone ? <Badge tone="bad">{t("ops.action.delete")}</Badge> : null}
          </span>
        }
        actions={
          <>
            <ButtonLink href="/activity">{t("ops.history.allActivity")}</ButtonLink>
            {href && !isGone ? <ButtonLink href={href}>{t("ops.history.openIt")}</ButtonLink> : null}
          </>
        }
      />
      <Help topic="history" />

      {forbidden ? (
        <Card className="border-warn/40">
          <p className="text-sm text-warn">{t("ops.history.forbidden")}</p>
        </Card>
      ) : revisions.length ? (
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <Card title={p("ops.versions", revisions.length)}>
            <ol className="divide-y divide-line">
              {revisions.map((r) => {
                const action = actionBadge(t, r.action);
                const active = r.version === chosen;
                return (
                  <li key={r.version} className={`py-2 ${active ? "-mx-4 border-l-2 border-amber bg-raised/40 px-4" : ""}`}>
                    <Link href={link(r.version, compare)} className="block">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-dim">v{r.version}</span>
                        <Badge tone={action.tone}>{action.label}</Badge>
                      </div>
                      <div className="mt-1 text-sm">{r.actorName ?? t("state.none")}</div>
                      <div className="text-xs text-faint">
                        {d.dateTime(r.createdAt)}
                        {r.actorKind !== "user" ? ` · ${actorKindLabel(t, r.actorKind)}` : ""}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card
            title={detail ? t("ops.version.title", { version: detail.version }) : t("ops.version.pick")}
            actions={
              detail ? (
                <span className="flex gap-2 text-xs">
                  <Link href={link(detail.version, "previous")} className={compare === "previous" ? "text-amber" : "text-dim hover:text-ink"}>
                    {t("ops.compare.previous")}
                  </Link>
                  <Link href={link(detail.version, "current")} className={compare === "current" ? "text-amber" : "text-dim hover:text-ink"}>
                    {t("ops.compare.now")}
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
                        <th>{t("ops.col.field")}</th>
                        <th>{compare === "current" ? t("ops.col.now") : t("ops.col.before")}</th>
                        <th>{compare === "current" ? t("ops.col.thisVersion") : t("ops.col.after")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.changes.map((c) => (
                        <tr key={c.field}>
                          <td className="font-medium">{c.field.replace(/_/g, " ")}</td>
                          <td className="text-dim">{show(t, p, compare === "current" ? c.after : c.before)}</td>
                          <td className={c.change === "removed" ? "text-bad" : "text-ok"}>
                            {show(t, p, compare === "current" ? c.before : c.after)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-dim">{compare === "current" ? t("ops.diff.sameAsNow") : t("ops.diff.noChange")}</p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                  <RestoreButton
                    collection={type}
                    entry={id}
                    version={detail.version}
                    primary
                    label={isGone ? t("ops.restore.bringBack") : t("ops.restore.version", { version: detail.version })}
                    confirm={
                      isGone
                        ? t("ops.restore.confirmUndelete", { name, version: detail.version })
                        : t("ops.restore.confirmApply", { name, version: detail.version })
                    }
                  />
                  <span className="text-xs text-faint">{t("ops.restore.note")}</span>
                </div>
              </>
            ) : (
              <Empty>{t("ops.version.pickLeft")}</Empty>
            )}
          </Card>
        </div>
      ) : (
        <Empty>{t("ops.history.empty")}</Empty>
      )}
    </>
  );
}
