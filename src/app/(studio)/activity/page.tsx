import type { Metadata } from "next";
import Link from "next/link";

import { Help } from "@/components/help";
import { RestoreButton } from "@/components/restore-button";
import { Badge, ButtonLink, Card, Empty, PageHeader } from "@/components/ui";
import {
  ACTOR_KINDS,
  AUDITED,
  REVISION_ACTIONS,
  actionBadge,
  actorKindFilterLabel,
  actorKindLabel,
  describeData,
  entryHref,
  getFeed,
  isActorKind,
  isRevisionAction,
  typeLabel,
} from "@/lib/audit";
import { entryNames } from "@/lib/audit-names";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("ops.meta.activity") };
}

type Search = { collection?: string; action?: string; actorKind?: string; actor?: string; page?: string };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { t, p, d } = await getI18n();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const filter = {
    collection: AUDITED.includes(sp.collection as (typeof AUDITED)[number]) ? sp.collection : undefined,
    action: isRevisionAction(sp.action) ? sp.action : undefined,
    actorKind: isActorKind(sp.actorKind) ? sp.actorKind : undefined,
    actor: sp.actor?.trim() || undefined,
    page,
  };
  const [{ revisions, pagination, forbidden }, nameOf] = await Promise.all([getFeed(filter), entryNames()]);
  const deleted = filter.action === "delete";
  const link = (n: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") q.set(k, v);
    if (n > 1) q.set("page", String(n));
    const s = q.toString();
    return `/activity${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title={t("ops.activity.title")}
        subtitle={t("ops.activity.subtitle")}
        actions={<ButtonLink href="/activity?action=delete">{t("ops.activity.recentlyDeleted")}</ButtonLink>}
      />
      <Help topic="activity" />

      {forbidden ? (
        <Card className="border-warn/40">
          <p className="text-sm text-warn">
            {t("ops.feed.forbidden.lead")} <strong>studio-staff</strong>
            {t("ops.feed.forbidden.tail")}
          </p>
        </Card>
      ) : (
        <>
          <form method="get" className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
            <input name="actor" defaultValue={sp.actor} placeholder={t("ops.filter.who")} className="control" />
            <select name="collection" defaultValue={filter.collection ?? ""} className="control">
              <option value="">{t("ops.filter.allTypes")}</option>
              {AUDITED.map((c) => (
                <option key={c} value={c}>
                  {typeLabel(t, c)}
                </option>
              ))}
            </select>
            <select name="action" defaultValue={filter.action ?? ""} className="control">
              <option value="">{t("ops.filter.anyChange")}</option>
              {REVISION_ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {actionBadge(t, a).label}
                </option>
              ))}
            </select>
            <select name="actorKind" defaultValue={filter.actorKind ?? ""} className="control">
              <option value="">{t("ops.filter.anyone")}</option>
              {ACTOR_KINDS.map((k) => (
                <option key={k} value={k}>
                  {actorKindFilterLabel(t, k)}
                </option>
              ))}
            </select>
            <button className="rounded-md border border-line-strong px-3 py-1.5 text-sm hover:bg-raised">{t("action.filter")}</button>
          </form>

          {deleted ? (
            <p className="mb-4 text-sm text-dim">
              {t("ops.deleted.lead")} <strong className="text-ink">{t("ops.restore.bringBack")}</strong> {t("ops.deleted.tail")}
            </p>
          ) : null}

          {revisions.length ? (
            <div className="overflow-x-auto rounded-lg border border-line bg-panel">
              <table className="data">
                <thead>
                  <tr>
                    <th>{t("ops.col.when")}</th>
                    <th>{t("ops.col.who")}</th>
                    <th>{t("ops.col.what")}</th>
                    <th>{t("ops.col.entry")}</th>
                    <th>{t("ops.col.version")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {revisions.map((r) => {
                    const name = nameOf(r.typeName, r.entityId) ?? describeData(r.typeName, r.data);
                    const href = entryHref(r.typeName, r.entityId);
                    const action = actionBadge(t, r.action);
                    const gone = r.action === "delete" && !nameOf(r.typeName, r.entityId);
                    return (
                      <tr key={r.id}>
                        <td className="whitespace-nowrap text-dim">{d.dateTime(r.createdAt)}</td>
                        <td className="whitespace-nowrap">
                          {r.actorName ?? t("state.none")}
                          <div className="text-xs text-faint">{actorKindLabel(t, r.actorKind)}</div>
                        </td>
                        <td>
                          <Badge tone={action.tone}>{action.label}</Badge>
                        </td>
                        <td>
                          <div className="text-xs text-faint">{typeLabel(t, r.typeName)}</div>
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
                            {t("ops.history.link")}
                          </Link>
                          {gone ? (
                            <span className="ml-3 inline-block align-middle">
                              <RestoreButton
                                collection={r.typeName}
                                entry={r.entityId}
                                version={r.version}
                                label={t("ops.restore.bringBack")}
                              />
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
            <Empty>{deleted ? t("ops.feed.emptyDeleted") : t("ops.feed.empty")}</Empty>
          )}

          {pagination && pagination.pageCount > 1 ? (
            <div className="mt-4 flex items-center gap-3 text-sm">
              {page > 1 ? <ButtonLink href={link(page - 1)}>{t("ops.page.newer")}</ButtonLink> : null}
              <span className="text-dim">
                {t("ops.page.position", { page: pagination.page, pages: pagination.pageCount })} ·{" "}
                {p("ops.page.changes", pagination.total)}
              </span>
              {page < pagination.pageCount ? <ButtonLink href={link(page + 1)}>{t("ops.page.older")}</ButtonLink> : null}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
