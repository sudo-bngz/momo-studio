import type { Metadata } from "next";
import Link from "next/link";

import { Help } from "@/components/help";
import { Badge, ButtonLink, Card, Code, Empty, PageHeader, SignalDot } from "@/components/ui";
import { getCables, getDevices, refId } from "@/lib/data";
import { findIssues } from "@/lib/patch";
import { toPlanCable, toPlanDevice } from "@/lib/plan-data";
import { CABLE_STATES, CONNECTORS, SIGNALS, isKey, options } from "@/lib/vocab";

export const metadata: Metadata = { title: "Cables" };

type Search = { q?: string; signal?: string; state?: string; device?: string };

export default async function CablesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const [devices, cables] = await Promise.all([getDevices(), getCables()]);
  const byId = new Map(devices.map((d) => [d.id, d]));
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
    const d = device ? byId.get(device) : undefined;
    if (!d) return <span className="text-faint">—</span>;
    return (
      <>
        <Link href={`/assets/${d.id}`} className="hover:text-amber">
          {d.name}
        </Link>
        <div className="text-xs text-dim">{port ?? "?"}</div>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Cables"
        subtitle={`${list.length} of ${cables.length} cables · ${metres.toLocaleString("en", { maximumFractionDigits: 1 })} m`}
        actions={
          <>
            <ButtonLink href="/plan">Patch plan</ButtonLink>
            <ButtonLink href={`/cables/labels${sp.device ? `?device=${sp.device}` : ""}`}>Print labels</ButtonLink>
            <ButtonLink href="/cables/new" primary>
              Add cable
            </ButtonLink>
          </>
        }
      />
      <Help topic="cables" />

      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]" method="get">
        <input name="q" defaultValue={sp.q} placeholder="Search code, device, port, color…" className="control" />
        <select name="signal" defaultValue={sp.signal ?? ""} className="control">
          <option value="">All signals</option>
          {options(SIGNALS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="state" defaultValue={sp.state ?? ""} className="control">
          <option value="">Any state</option>
          {options(CABLE_STATES).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="device" defaultValue={sp.device ?? ""} className="control">
          <option value="">Any device</option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.code} · {d.name}
            </option>
          ))}
        </select>
        <button className="rounded-md border border-line-strong px-3 py-1.5 text-sm hover:bg-raised">Filter</button>
      </form>

      {list.length ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-panel">
          <table className="data">
            <thead>
              <tr>
                <th>Code</th>
                <th>Signal</th>
                <th>From</th>
                <th>To</th>
                <th>Plugs</th>
                <th>Length</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="whitespace-nowrap">
                    <Link href={`/cables/${c.id}`} className="hover:underline">
                      <Code>{c.code}</Code>
                    </Link>
                    {flagged.has(c.id) ? <span className="ml-1 text-warn" title="See issues below">⚠</span> : null}
                    {c.color ? <div className="text-xs text-faint">{c.color}</div> : null}
                  </td>
                  <td>
                    <SignalDot color={SIGNALS[c.signal].color} label={SIGNALS[c.signal].label} />
                  </td>
                  <td>{end(refId(c.from_device), c.from_port)}</td>
                  <td>{end(refId(c.to_device), c.to_port)}</td>
                  <td className="text-xs text-dim">
                    {c.connector_a ? CONNECTORS[c.connector_a] : "—"} → {c.connector_b ? CONNECTORS[c.connector_b] : "—"}
                  </td>
                  <td className="tabular-nums text-dim">{c.length_m ? `${c.length_m} m` : "—"}</td>
                  <td>
                    <Badge tone={CABLE_STATES[c.state].tone}>{CABLE_STATES[c.state].label}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{cables.length ? "No cable matches these filters." : "No cables yet. Add your devices with their ports, then patch them here."}</Empty>
      )}

      <div id="issues" className="mt-8 scroll-mt-6">
        <Card title={`Issues (${issues.length})`}>
          {issues.length ? (
            <ul className="space-y-2 text-sm">
              {issues.map((i, k) => (
                <li key={k} className="flex items-start gap-2">
                  <Badge tone={i.kind === "busy_port" || i.kind === "direction" ? "warn" : "bad"}>{i.kind.replace("_", " ")}</Badge>
                  <Link href={`/cables/${i.cable.id}`} className="hover:underline">
                    {i.message}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-dim">
              None: every connected cable joins two existing ports of the same signal, one cable per port, outputs to inputs.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
