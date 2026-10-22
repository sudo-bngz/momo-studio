import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteMaintenance, saveMaintenance } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Help } from "@/components/help";
import { Badge, ButtonLink, Card, Code, Empty, Field, Input, PageHeader, Select, SignalDot } from "@/components/ui";
import { getCables, getDevice, getDevices, getMaintenance, refId } from "@/lib/data";
import { coverOf, figureOf } from "@/components/asset-image";
import { DeviceFigure } from "@/components/device-figure";
import { PhotoGallery } from "@/components/photo-gallery";
import { getI18n } from "@/lib/i18n";
import { mediaSrc } from "@/lib/media";
import { cablesByPort, portKey, type PlanCable } from "@/lib/patch";
import { toPlanCable } from "@/lib/plan-data";
import {
  categoryLabel,
  connectorLabel,
  deviceStateLabel,
  deviceStateTone,
  directionLabel,
  locationKindLabel,
  signalColor,
  signalLabel,
} from "@/lib/vocab";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { t } = await getI18n();
  const device = await getDevice(Number((await params).id));
  return { title: device?.name ?? t("assets.meta.one") };
}

const MAINTENANCE_KINDS = ["repair", "service", "calibration", "cleaning", "upgrade", "inspection"] as const;

export default async function DevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { t, d } = await getI18n();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [device, devices, cables, maintenance] = await Promise.all([getDevice(id), getDevices(), getCables(), getMaintenance()]);
  if (!device) notFound();

  const names = new Map(devices.map((dev) => [dev.id, dev]));
  const plan = cables.map(toPlanCable);
  const usage = cablesByPort(plan);
  const otherEnd = (c: PlanCable, port: string) => {
    const mine = c.from?.device === id && c.from.port === port ? "from" : "to";
    return mine === "from" ? c.to : c.from;
  };
  const loose = plan.filter(
    (c) => c.state === "connected" && [c.from, c.to].some((e) => e?.device === id && !(device.ports ?? []).some((p) => p.name === e.port)),
  );
  const log = maintenance.filter((m) => refId(m.device) === id);
  const location = device.location && typeof device.location === "object" ? device.location : undefined;
  const room = location?.room && typeof location.room === "object" ? location.room : undefined;
  const cover = coverOf(device);
  const gallery = [cover, ...(device.photos ?? []).filter((m) => refId(m) !== refId(cover))]
    .flatMap((m) => {
      const src = mediaSrc(m);
      return src && m && typeof m === "object" ? [{ id: m.id, src, name: m.name }] : [];
    });
  const linked = new Set<number>();
  for (const c of plan) {
    if (c.state !== "connected") continue;
    if (c.from?.device === id && c.to) linked.add(c.to.device);
    if (c.to?.device === id && c.from) linked.add(c.from.device);
  }

  const facts: Array<[string, React.ReactNode]> = [
    [t("assets.fact.category"), categoryLabel(t, device.category)],
    [t("assets.fact.brand"), [device.brand, device.model].filter(Boolean).join(" ") || t("state.none")],
    [
      t("assets.fact.location"),
      location ? (
        <>
          {location.name}{" "}
          <span className="text-faint">
            ({locationKindLabel(t, location.kind)}
            {room ? `, ${room.name}` : ""})
          </span>
          {device.rack_position ? (
            <span className="text-faint">
              {" "}
              · U{device.rack_position}
              {device.rack_height ? `–${device.rack_position + device.rack_height - 1}` : ""}
            </span>
          ) : null}
        </>
      ) : (
        t("state.none")
      ),
    ],
    [t("assets.fact.midi"), device.midi_channel ?? t("state.none")],
    [t("assets.fact.serial"), device.serial_number ? <span className="font-mono text-xs">{device.serial_number}</span> : t("state.none")],
    [
      t("assets.fact.bought"),
      device.purchase_date
        ? `${d.date(device.purchase_date)}${device.supplier ? ` · ${device.supplier}` : ""}`
        : (device.supplier ?? t("state.none")),
    ],
    [t("assets.fact.price"), `${d.money(device.purchase_price)} / ${d.money(device.current_value)}`],
    [t("assets.fact.warranty"), device.warranty_until ? d.date(device.warranty_until) : t("state.none")],
  ];

  return (
    <>
      <PageHeader
        title={device.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Code>{device.code}</Code>
            <Badge tone={deviceStateTone(device.state)}>{deviceStateLabel(t, device.state)}</Badge>
            {device.manual_url ? (
              <a href={device.manual_url} target="_blank" rel="noreferrer" className="text-xs text-dim underline hover:text-ink">
                {t("assets.manual")}
              </a>
            ) : null}
          </span>
        }
        actions={
          <>
            {device.category === "patchbay" ? <ButtonLink href={`/patchbays/${device.id}`}>{t("assets.patchbayView")}</ButtonLink> : null}
            {device.category === "mixer" ? <ButtonLink href={`/consoles/${device.id}`}>{t("assets.consoleView")}</ButtonLink> : null}
            {location ? <ButtonLink href={`/map?place=${location.id}`}>{t("assets.onMap")}</ButtonLink> : null}
            <ButtonLink href={`/activity/devices/${device.id}`}>{t("assets.history")}</ButtonLink>
            <ButtonLink href={`/plan?focus=${device.id}`}>{t("action.showInPlan")}</ButtonLink>
            <ButtonLink href={`/assets/${device.id}/edit`} primary>
              {t("action.edit")}
            </ButtonLink>
          </>
        }
      />
      <Help topic="asset" />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <div className="mb-4">
              {gallery.length ? (
                <PhotoGallery photos={gallery} alt={device.name} />
              ) : (
                <div className="rounded-md border border-dashed border-line-strong bg-[#15171a] p-4">
                  <DeviceFigure figure={figureOf(device)} className="w-full" title={t("assets.figure.title", { name: device.name })} />
                  <p className="mt-2 text-center text-[11px] text-faint">
                    {t("assets.figure.drawn")} ·{" "}
                    <Link href={`/assets/${device.id}/edit`} className="underline hover:text-amber">
                      {t("assets.figure.addPhoto")}
                    </Link>
                  </p>
                </div>
              )}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-faint">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {device.notes ? <p className="mt-4 whitespace-pre-line border-t border-line pt-4 text-sm text-dim">{device.notes}</p> : null}
          </Card>

          {linked.size ? (
            <Card title={t("assets.wiredTo")}>
              <ul className="flex flex-wrap gap-2 text-sm">
                {[...linked].map((other) => (
                  <li key={other}>
                    <Link href={`/assets/${other}`} className="rounded border border-line px-2 py-1 hover:border-amber hover:text-amber">
                      {names.get(other)?.name ?? `#${other}`}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6 xl:col-span-2">
          <Card
            title={t("assets.ports.title", { count: device.ports?.length ?? 0 })}
            actions={
              <Link href={`/cables/new?from=${device.id}`} className="text-xs text-dim hover:text-ink">
                {t("assets.ports.addCable")}
              </Link>
            }
          >
            {device.ports?.length ? (
              <div className="-mx-4 -my-4 overflow-x-auto">
                <table className="data">
                  <thead>
                    <tr>
                      <th>{t("assets.ports.col.port")}</th>
                      <th>{t("assets.ports.col.signal")}</th>
                      <th>{t("assets.ports.col.connector")}</th>
                      <th>{t("assets.ports.col.patchedTo")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {device.ports.map((p) => {
                      const here = usage.get(portKey(id, p.name)) ?? [];
                      return (
                        <tr key={p.name}>
                          <td>
                            <span className="font-medium">{p.name}</span>{" "}
                            <span className="text-xs text-faint">{directionLabel(t, p.direction)}</span>
                            {p.note ? <div className="text-xs text-faint">{p.note}</div> : null}
                          </td>
                          <td>
                            <SignalDot color={signalColor(p.signal)} label={signalLabel(t, p.signal)} />
                          </td>
                          <td className="text-dim">
                            {p.connector ? connectorLabel(t, p.connector) : t("state.none")}
                            {p.balanced ? <span className="text-faint"> · {t("assets.ports.balanced")}</span> : null}
                          </td>
                          <td>
                            {here.length ? (
                              <ul className="space-y-1">
                                {here.map((c) => {
                                  const end = otherEnd(c, p.name);
                                  const other = end ? names.get(end.device) : undefined;
                                  return (
                                    <li key={c.id} className={here.length > 1 ? "text-warn" : undefined}>
                                      <Link href={`/cables/${c.id}`} className="hover:underline">
                                        <Code>{c.code}</Code>
                                      </Link>{" "}
                                      →{" "}
                                      {other ? (
                                        <Link href={`/assets/${other.id}`} className="hover:text-amber">
                                          {other.name}
                                        </Link>
                                      ) : (
                                        "?"
                                      )}{" "}
                                      <span className="text-dim">· {end?.port}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <Link
                                href={`/cables/new?from=${encodeURIComponent(`${id}::${p.name}`)}`}
                                className="text-xs text-faint hover:text-amber"
                              >
                                {t("action.patchIt")}
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>{t("assets.ports.empty")}</Empty>
            )}
            {loose.length ? (
              <p className="mt-6 text-sm text-warn">{t("assets.ports.loose", { codes: loose.map((c) => c.code).join(", ") })}</p>
            ) : null}
          </Card>

          <Card title={t("assets.maint.title")}>
            {log.length ? (
              <ul className="mb-6 divide-y divide-line">
                {log.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm first:pt-0">
                    <div>
                      <div>
                        <span className="text-faint">{d.date(m.date)}</span> · <Code>{m.kind}</Code>
                        {m.cost ? <span className="text-dim"> · {d.money(m.cost)}</span> : null}
                        {m.done_by ? <span className="text-dim"> · {m.done_by}</span> : null}
                      </div>
                      {m.description ? <p className="mt-1 text-dim">{m.description}</p> : null}
                    </div>
                    <form action={deleteMaintenance}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="device" value={id} />
                      <button className="text-xs text-faint hover:text-bad">{t("assets.remove")}</button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-dim">{t("assets.maint.empty")}</p>
            )}
            <ActionForm action={saveMaintenance} submit={t("assets.maint.submit")}>
              <input type="hidden" name="device" value={id} />
              <div className="grid gap-3 sm:grid-cols-4">
                <Field label={t("assets.maint.date")}>
                  <Input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
                </Field>
                <Field label={t("assets.maint.kind")}>
                  <Select name="kind" options={MAINTENANCE_KINDS.map((k) => ({ value: k, label: t(`assets.maint.kind.${k}`) }))} />
                </Field>
                <Field label={t("assets.maint.cost")}>
                  <Input name="cost" type="number" step="0.01" min={0} />
                </Field>
                <Field label={t("assets.maint.doneBy")}>
                  <Input name="done_by" />
                </Field>
                <Field label={t("assets.maint.what")} className="sm:col-span-4">
                  <Input name="description" />
                </Field>
              </div>
            </ActionForm>
          </Card>
        </div>
      </div>
    </>
  );
}
