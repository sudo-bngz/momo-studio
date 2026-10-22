import type { Metadata } from "next";
import Link from "next/link";

import { Help } from "@/components/help";
import { getI18n } from "@/lib/i18n";
import { issueLabel, issueMessage } from "@/lib/issues";
import { Badge, ButtonLink, Card, Code, Empty, PageHeader, SignalDot } from "@/components/ui";
import { getCables, getDevices, refId } from "@/lib/data";
import { findIssues } from "@/lib/patch";
import { toPlanCable, toPlanDevice } from "@/lib/plan-data";
import {
  CABLE_STATES,
  SIGNALS,
  cableStateLabel,
  cableStateTone,
  connectorLabel,
  isKey,
  signalColor,
  signalLabel,
  translatedOptions,
} from "@/lib/vocab";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("cables.meta.title") };
}

type Search = { q?: string; signal?: string; state?: string; device?: string };

export default async function CablesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { t, p, d } = await getI18n();
  const sp = await searchParams;
  const [devices, cables] = await Promise.all([getDevices(), getCables()]);
  const byId = new Map(devices.map((x) => [x.id, x]));
  const issues = findIssues(devices.map(toPlanDevice), cables.map(toPlanCable));
  const flagged = new Set(issues.map((i) => i.cable.id));

  const deviceFilter = Number(sp.device) || undefined;
  const q = sp.q?.trim().toLowerCase() ?? "";
  const list = cables.filter((c) => {
    if (isKey(SIGNALS, sp.signal) && c.signal !== sp.signal) return false;
    if (isKey(CABLE_STATES, sp.state) && c.state !== sp.state) return false;
    if (deviceFilter && refId(c.from_device) !== deviceFilter && refId(c.to_device) !== deviceFilter) return false;
    if (q) {
      const hay = [c.code, c.color, c.from_port, c.to_port, byId.get(refId(c.from_device) ?? 0)?.name, byId.get(refId(c.to_device) ?? 0)?.name, c.notes];
      if (!hay.some((v) => v?.toLowerCase().includes(q))) return false;
    }
    return true;
  });
  const metres = list.reduce((s, c) => s + (c.length_m ?? 0), 0);

  const end = (device: number | undefined, port: string | null | undefined) => {
    const dev = device ? byId.get(device) : undefined;
    if (!dev) return <span className="text-faint">{t("state.none")}</span>;
    return (
      <>
        <Link href={`/assets/${dev.id}`} className="hover:text-amber">
          {dev.name}
        </Link>
        <div className="text-xs text-dim">{port ?? "?"}</div>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title={t("cables.title")}
        subtitle={p("cables.subtitle", list.length, { total: cables.length, metres: d.metres(metres) })}
        actions={
          <>
            <ButtonLink href="/plan">{t("cables.plan.title")}</ButtonLink>
            <ButtonLink href={`/cables/labels${sp.device ? `?device=${sp.device}` : ""}`}>{t("cables.printLabels")}</ButtonLink>
            <ButtonLink href="/cables/new" primary>
              {t("cables.add")}
            </ButtonLink>
          </>
        }
      />
      <Help topic="cables" />

      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]" method="get">
        <input name="q" defaultValue={sp.q} placeholder={t("cables.search.placeholder")} className="control" />
        <select name="signal" defaultValue={sp.signal ?? ""} className="control">
          <option value="">{t("cables.filter.allSignals")}</option>
          {translatedOptions(t, SIGNALS, signalLabel).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="state" defaultValue={sp.state ?? ""} className="control">
          <option value="">{t("cables.filter.anyState")}</option>
          {translatedOptions(t, CABLE_STATES, cableStateLabel).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="device" defaultValue={sp.device ?? ""} className="control">
          <option value="">{t("cables.filter.anyDevice")}</option>
          {devices.map((dev) => (
            <option key={dev.id} value={dev.id}>
              {dev.code} · {dev.name}
            </option>
          ))}
        </select>
        <button className="rounded-md border border-line-strong px-3 py-1.5 text-sm hover:bg-raised">{t("action.filter")}</button>
      </form>

      {list.length ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-panel">
          <table className="data">
            <thead>
              <tr>
                <th>{t("cables.col.code")}</th>
                <th>{t("cables.col.signal")}</th>
                <th>{t("cables.col.from")}</th>
                <th>{t("cables.col.to")}</th>
                <th>{t("cables.col.plugs")}</th>
                <th>{t("cables.col.length")}</th>
                <th>{t("cables.col.state")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="whitespace-nowrap">
                    <Link href={`/cables/${c.id}`} className="hover:underline">
                      <Code>{c.code}</Code>
                    </Link>
                    {flagged.has(c.id) ? <span className="ml-1 text-warn" title={t("cables.seeIssues")}>⚠</span> : null}
                    {c.color ? <div className="text-xs text-faint">{c.color}</div> : null}
                  </td>
                  <td>
                    <SignalDot color={signalColor(c.signal)} label={signalLabel(t, c.signal)} />
                  </td>
                  <td>{end(refId(c.from_device), c.from_port)}</td>
                  <td>{end(refId(c.to_device), c.to_port)}</td>
                  <td className="text-xs text-dim">
                    {c.connector_a ? connectorLabel(t, c.connector_a) : t("state.none")} → {c.connector_b ? connectorLabel(t, c.connector_b) : t("state.none")}
                  </td>
                  <td className="tabular-nums text-dim">{d.metres(c.length_m)}</td>
                  <td>
                    <Badge tone={cableStateTone(c.state)}>{cableStateLabel(t, c.state)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{cables.length ? t("cables.none.filtered") : t("cables.none")}</Empty>
      )}

      <div id="issues" className="mt-8 scroll-mt-6">
        <Card title={p("cables.issues", issues.length)}>
          {issues.length ? (
            <ul className="space-y-2 text-sm">
              {issues.map((i, k) => (
                <li key={k} className="flex items-start gap-2">
                  <Badge tone={i.kind === "busy_port" || i.kind === "direction" ? "warn" : "bad"}>{issueLabel(t, i.kind)}</Badge>
                  <Link href={`/cables/${i.cable.id}`} className="hover:underline">
                    {issueMessage(t, i)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-dim">{t("cables.issues.none")}</p>
          )}
        </Card>
      </div>
    </>
  );
}
