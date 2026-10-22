import type { Metadata } from "next";
import Link from "next/link";

import { AssetImage, coverOf } from "@/components/asset-image";
import { Help } from "@/components/help";
import { Badge, ButtonLink, Code, Empty, PageHeader, ViewToggle } from "@/components/ui";
import { getCables, getDevices, getLocations, refId } from "@/lib/data";
import { cablesByPort, portKey } from "@/lib/patch";
import { toPlanCable } from "@/lib/plan-data";
import { formatMoney } from "@/lib/time";
import { CATEGORIES, DEVICE_STATES, isKey, options } from "@/lib/vocab";

export const metadata: Metadata = { title: "Assets" };

type Search = { q?: string; category?: string; state?: string; location?: string; view?: string };

export default async function GearPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const [devices, cables, locations] = await Promise.all([getDevices(), getCables(), getLocations()]);
  const usage = cablesByPort(cables.map(toPlanCable));

  const q = sp.q?.trim().toLowerCase() ?? "";
  const list = devices.filter((d) => {
    if (q && ![d.name, d.code, d.brand, d.model, d.serial_number].some((v) => v?.toLowerCase().includes(q))) return false;
    if (isKey(CATEGORIES, sp.category) && d.category !== sp.category) return false;
    if (isKey(DEVICE_STATES, sp.state) && d.state !== sp.state) return false;
    if (!sp.state && d.state === "sold") return false;
    if (sp.location && String(refId(d.location) ?? "none") !== sp.location) return false;
    return true;
  });
  const total = list.reduce((s, d) => s + (d.current_value ?? d.purchase_price ?? 0), 0);
  // The gallery is the way in; the table is there for inventory and values.
  const gallery = sp.view !== "table";
  const withPhoto = list.filter((d) => coverOf(d)).length;

  return (
    <>
      <PageHeader
        title="Assets"
        subtitle={`${list.length} of ${devices.length} machines · ${formatMoney(total)} · ${withPhoto} photographed`}
        actions={
          <>
            <ViewToggle search={sp} gallery={gallery} />
            <ButtonLink href="/assets/new" primary>
              Add an asset
            </ButtonLink>
          </>
        }
      />
      <Help topic="assets" />

      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]" method="get">
        {gallery ? <input type="hidden" name="view" value="gallery" /> : null}
        <input name="q" defaultValue={sp.q} placeholder="Search name, code, brand, serial…" className="control" />
        <select name="category" defaultValue={sp.category ?? ""} className="control">
          <option value="">All categories</option>
          {options(CATEGORIES).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="state" defaultValue={sp.state ?? ""} className="control">
          <option value="">Not sold</option>
          {options(DEVICE_STATES).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="location" defaultValue={sp.location ?? ""} className="control">
          <option value="">Anywhere</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
          <option value="none">No location</option>
        </select>
        <button className="rounded-md border border-line-strong px-3 py-1.5 text-sm hover:bg-raised">Filter</button>
      </form>

      {list.length && gallery ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {list.map((d) => {
            const loc = d.location && typeof d.location === "object" ? d.location : undefined;
            const ports = d.ports ?? [];
            const patched = ports.filter((p) => usage.has(portKey(d.id, p.name))).length;
            return (
              <li key={d.id}>
                <Link
                  href={`/assets/${d.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-panel hover:border-line-strong"
                >
                  <AssetImage device={d} className="h-32 w-full" />
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <Code>{d.code}</Code>
                      <Badge tone={DEVICE_STATES[d.state].tone}>{DEVICE_STATES[d.state].label}</Badge>
                    </div>
                    <div className="font-medium leading-tight group-hover:text-amber">{d.name}</div>
                    <div className="text-xs text-dim">{CATEGORIES[d.category]}</div>
                    <div className="mt-auto flex items-baseline justify-between gap-2 pt-2 text-xs text-faint">
                      <span className="truncate">
                        {loc ? loc.name : "no location"}
                        {d.rack_position ? ` · U${d.rack_position}` : ""}
                      </span>
                      <span className="whitespace-nowrap">{ports.length ? `${patched}/${ports.length}` : "—"}</span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : list.length ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-panel">
          <table className="data">
            <thead>
              <tr>
                <th>Code</th>
                <th>Device</th>
                <th>Category</th>
                <th>Where</th>
                <th>Ports</th>
                <th>State</th>
                <th className="text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => {
                const loc = d.location && typeof d.location === "object" ? d.location : undefined;
                const ports = d.ports ?? [];
                const patched = ports.filter((p) => usage.has(portKey(d.id, p.name))).length;
                return (
                  <tr key={d.id}>
                    <td>
                      <Code>{d.code}</Code>
                    </td>
                    <td>
                      <Link href={`/assets/${d.id}`} className="font-medium hover:text-amber">
                        {d.name}
                      </Link>
                      {d.brand || d.model ? <div className="text-xs text-faint">{[d.brand, d.model].filter(Boolean).join(" ")}</div> : null}
                    </td>
                    <td className="text-dim">{CATEGORIES[d.category]}</td>
                    <td className="text-dim">
                      {loc ? loc.name : "—"}
                      {d.rack_position ? <span className="text-faint"> · U{d.rack_position}</span> : null}
                    </td>
                    <td className="tabular-nums text-dim">
                      {ports.length ? `${patched}/${ports.length} patched` : "—"}
                    </td>
                    <td>
                      <Badge tone={DEVICE_STATES[d.state].tone}>{DEVICE_STATES[d.state].label}</Badge>
                    </td>
                    <td className="text-right tabular-nums text-dim">{formatMoney(d.current_value ?? d.purchase_price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{devices.length ? "Nothing matches these filters." : "Nothing yet: add your first machine."}</Empty>
      )}
    </>
  );
}
