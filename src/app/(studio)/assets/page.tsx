import type { Metadata } from "next";
import Link from "next/link";

import { AssetImage, coverOf } from "@/components/asset-image";
import { Help } from "@/components/help";
import { ViewToggle } from "@/components/view-toggle";
import { Badge, ButtonLink, Code, Empty, PageHeader } from "@/components/ui";
import { getCables, getDevices, getLocations, refId } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { cablesByPort, portKey } from "@/lib/patch";
import { toPlanCable } from "@/lib/plan-data";
import { CATEGORIES, DEVICE_STATES, categoryLabel, deviceStateLabel, deviceStateTone, isKey, translatedOptions } from "@/lib/vocab";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("assets.meta.title") };
}

type Search = { q?: string; category?: string; state?: string; location?: string; view?: string };

export default async function GearPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { t, d } = await getI18n();
  const sp = await searchParams;
  const [devices, cables, locations] = await Promise.all([getDevices(), getCables(), getLocations()]);
  const usage = cablesByPort(cables.map(toPlanCable));

  const q = sp.q?.trim().toLowerCase() ?? "";
  const list = devices.filter((dev) => {
    if (q && ![dev.name, dev.code, dev.brand, dev.model, dev.serial_number].some((v) => v?.toLowerCase().includes(q))) return false;
    if (isKey(CATEGORIES, sp.category) && dev.category !== sp.category) return false;
    if (isKey(DEVICE_STATES, sp.state) && dev.state !== sp.state) return false;
    if (!sp.state && dev.state === "sold") return false;
    if (sp.location && String(refId(dev.location) ?? "none") !== sp.location) return false;
    return true;
  });
  const total = list.reduce((s, dev) => s + (dev.current_value ?? dev.purchase_price ?? 0), 0);
  // The gallery is the way in; the table is there for inventory and values.
  const gallery = sp.view !== "table";
  const withPhoto = list.filter((dev) => coverOf(dev)).length;

  return (
    <>
      <PageHeader
        title={t("assets.title")}
        subtitle={t("assets.subtitle", {
          shown: list.length,
          total: devices.length,
          value: d.money(total),
          photographed: withPhoto,
        })}
        actions={
          <>
            <ViewToggle search={sp} gallery={gallery} />
            <ButtonLink href="/assets/scan">{t("scan.cta")}</ButtonLink>
            <ButtonLink href="/assets/new" primary>
              {t("assets.add")}
            </ButtonLink>
          </>
        }
      />
      <Help topic="assets" />

      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]" method="get">
        {gallery ? <input type="hidden" name="view" value="gallery" /> : null}
        <input name="q" defaultValue={sp.q} placeholder={t("assets.filter.q")} className="control" />
        <select name="category" defaultValue={sp.category ?? ""} className="control">
          <option value="">{t("assets.filter.allCategories")}</option>
          {translatedOptions(t, CATEGORIES, categoryLabel).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="state" defaultValue={sp.state ?? ""} className="control">
          <option value="">{t("assets.filter.notSold")}</option>
          {translatedOptions(t, DEVICE_STATES, deviceStateLabel).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="location" defaultValue={sp.location ?? ""} className="control">
          <option value="">{t("assets.filter.anywhere")}</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
          <option value="none">{t("assets.filter.noLocation")}</option>
        </select>
        <button className="rounded-md border border-line-strong px-3 py-1.5 text-sm hover:bg-raised">{t("action.filter")}</button>
      </form>

      {list.length && gallery ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {list.map((dev) => {
            const loc = dev.location && typeof dev.location === "object" ? dev.location : undefined;
            const ports = dev.ports ?? [];
            const patched = ports.filter((p) => usage.has(portKey(dev.id, p.name))).length;
            return (
              <li key={dev.id}>
                <Link
                  href={`/assets/${dev.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-panel hover:border-line-strong"
                >
                  <AssetImage device={dev} className="h-32 w-full" />
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <Code>{dev.code}</Code>
                      <Badge tone={deviceStateTone(dev.state)}>{deviceStateLabel(t, dev.state)}</Badge>
                    </div>
                    <div className="font-medium leading-tight group-hover:text-amber">{dev.name}</div>
                    <div className="text-xs text-dim">{categoryLabel(t, dev.category)}</div>
                    <div className="mt-auto flex items-baseline justify-between gap-2 pt-2 text-xs text-faint">
                      <span className="truncate">
                        {loc ? loc.name : t("assets.card.noLocation")}
                        {dev.rack_position ? ` · U${dev.rack_position}` : ""}
                      </span>
                      <span className="whitespace-nowrap">{ports.length ? `${patched}/${ports.length}` : t("state.none")}</span>
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
                <th>{t("assets.col.code")}</th>
                <th>{t("assets.col.device")}</th>
                <th>{t("assets.col.category")}</th>
                <th>{t("assets.col.where")}</th>
                <th>{t("assets.col.ports")}</th>
                <th>{t("assets.col.state")}</th>
                <th className="text-right">{t("assets.col.value")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((dev) => {
                const loc = dev.location && typeof dev.location === "object" ? dev.location : undefined;
                const ports = dev.ports ?? [];
                const patched = ports.filter((p) => usage.has(portKey(dev.id, p.name))).length;
                return (
                  <tr key={dev.id}>
                    <td>
                      <Code>{dev.code}</Code>
                    </td>
                    <td>
                      <Link href={`/assets/${dev.id}`} className="font-medium hover:text-amber">
                        {dev.name}
                      </Link>
                      {dev.brand || dev.model ? (
                        <div className="text-xs text-faint">{[dev.brand, dev.model].filter(Boolean).join(" ")}</div>
                      ) : null}
                    </td>
                    <td className="text-dim">{categoryLabel(t, dev.category)}</td>
                    <td className="text-dim">
                      {loc ? loc.name : t("state.none")}
                      {dev.rack_position ? <span className="text-faint"> · U{dev.rack_position}</span> : null}
                    </td>
                    <td className="tabular-nums text-dim">
                      {ports.length ? t("assets.patchedOf", { patched, total: ports.length }) : t("state.none")}
                    </td>
                    <td>
                      <Badge tone={deviceStateTone(dev.state)}>{deviceStateLabel(t, dev.state)}</Badge>
                    </td>
                    <td className="text-right tabular-nums text-dim">{d.money(dev.current_value ?? dev.purchase_price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{devices.length ? t("assets.empty.filtered") : t("assets.empty.none")}</Empty>
      )}
    </>
  );
}
