import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteMaintenance, saveMaintenance } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Badge, ButtonLink, Card, Code, Empty, Field, Input, PageHeader, Select, SignalDot } from "@/components/ui";
import { getCables, getDevice, getDevices, getMaintenance, refId } from "@/lib/data";
import { mediaSrc } from "@/lib/media";
import { cablesByPort, portKey, type PlanCable } from "@/lib/patch";
import { toPlanCable } from "@/lib/plan-data";
import { formatDate, formatMoney } from "@/lib/time";
import { CATEGORIES, CONNECTORS, DEVICE_STATES, DIRECTIONS, LOCATION_KINDS, SIGNALS } from "@/lib/vocab";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const device = await getDevice(Number((await params).id));
  return { title: device?.name ?? "Gear" };
}

const MAINTENANCE_KINDS = ["repair", "service", "calibration", "cleaning", "upgrade", "inspection"];

export default async function DevicePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [device, devices, cables, maintenance] = await Promise.all([getDevice(id), getDevices(), getCables(), getMaintenance()]);
  if (!device) notFound();

  const names = new Map(devices.map((d) => [d.id, d]));
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
  const photo = mediaSrc(device.photo);
  const linked = new Set<number>();
  for (const c of plan) {
    if (c.state !== "connected") continue;
    if (c.from?.device === id && c.to) linked.add(c.to.device);
    if (c.to?.device === id && c.from) linked.add(c.from.device);
  }

  const facts: Array<[string, React.ReactNode]> = [
    ["Category", CATEGORIES[device.category]],
    ["Brand / model", [device.brand, device.model].filter(Boolean).join(" ") || "—"],
    [
      "Location",
      location ? (
        <>
          {location.name} <span className="text-faint">({LOCATION_KINDS[location.kind]}{room ? `, ${room.name}` : ""})</span>
          {device.rack_position ? <span className="text-faint"> · U{device.rack_position}{device.rack_height ? `–${device.rack_position + device.rack_height - 1}` : ""}</span> : null}
        </>
      ) : (
        "—"
      ),
    ],
    ["MIDI channel", device.midi_channel ?? "—"],
    ["Serial", device.serial_number ? <span className="font-mono text-xs">{device.serial_number}</span> : "—"],
    ["Bought", device.purchase_date ? `${formatDate(device.purchase_date)}${device.supplier ? ` · ${device.supplier}` : ""}` : (device.supplier ?? "—")],
    ["Price / value", `${formatMoney(device.purchase_price)} / ${formatMoney(device.current_value)}`],
    ["Warranty", device.warranty_until ? formatDate(device.warranty_until) : "—"],
  ];

  return (
    <>
      <PageHeader
        title={device.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Code>{device.code}</Code>
            <Badge tone={DEVICE_STATES[device.state].tone}>{DEVICE_STATES[device.state].label}</Badge>
            {device.manual_url ? (
              <a href={device.manual_url} target="_blank" rel="noreferrer" className="text-xs text-dim underline hover:text-ink">
                Manual
              </a>
            ) : null}
          </span>
        }
        actions={
          <>
            {device.category === "patchbay" ? <ButtonLink href={`/patchbays/${device.id}`}>Patchbay view</ButtonLink> : null}
            {device.category === "mixer" ? <ButtonLink href={`/consoles/${device.id}`}>Console view</ButtonLink> : null}
            {location ? <ButtonLink href={`/map?place=${location.id}`}>On the map</ButtonLink> : null}
            <ButtonLink href={`/plan?focus=${device.id}`}>Show in plan</ButtonLink>
            <ButtonLink href={`/gear/${device.id}/edit`} primary>
              Edit
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6">
          <Card>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photo ? <img src={photo} alt={device.name} className="mb-4 w-full rounded-md border border-line object-cover" /> : null}
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
            <Card title="Wired to">
              <ul className="flex flex-wrap gap-2 text-sm">
                {[...linked].map((d) => (
                  <li key={d}>
                    <Link href={`/gear/${d}`} className="rounded border border-line px-2 py-1 hover:border-amber hover:text-amber">
                      {names.get(d)?.name ?? `#${d}`}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6 xl:col-span-2">
          <Card title={`Ports (${device.ports?.length ?? 0})`} actions={<Link href={`/cables/new?from=${device.id}`} className="text-xs text-dim hover:text-ink">+ Cable</Link>}>
            {device.ports?.length ? (
              <div className="-mx-4 -my-4 overflow-x-auto">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Port</th>
                      <th>Signal</th>
                      <th>Connector</th>
                      <th>Patched to</th>
                    </tr>
                  </thead>
                  <tbody>
                    {device.ports.map((p) => {
                      const here = usage.get(portKey(id, p.name)) ?? [];
                      return (
                        <tr key={p.name}>
                          <td>
                            <span className="font-medium">{p.name}</span> <span className="text-xs text-faint">{DIRECTIONS[p.direction]}</span>
                            {p.note ? <div className="text-xs text-faint">{p.note}</div> : null}
                          </td>
                          <td>
                            <SignalDot color={SIGNALS[p.signal].color} label={SIGNALS[p.signal].label} />
                          </td>
                          <td className="text-dim">
                            {p.connector ? CONNECTORS[p.connector] : "—"}
                            {p.balanced ? <span className="text-faint"> · bal.</span> : null}
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
                                        <Link href={`/gear/${other.id}`} className="hover:text-amber">
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
                              <Link href={`/cables/new?from=${encodeURIComponent(`${id}::${p.name}`)}`} className="text-xs text-faint hover:text-amber">
                                free · patch it
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
              <Empty>No ports described yet. Edit the device to add its sockets.</Empty>
            )}
            {loose.length ? (
              <p className="mt-6 text-sm text-warn">
                Cables plugged into ports this device doesn&apos;t have: {loose.map((c) => c.code).join(", ")}.
              </p>
            ) : null}
          </Card>

          <Card title="Maintenance log">
            {log.length ? (
              <ul className="mb-6 divide-y divide-line">
                {log.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm first:pt-0">
                    <div>
                      <div>
                        <span className="text-faint">{formatDate(m.date)}</span> · <Code>{m.kind}</Code>
                        {m.cost ? <span className="text-dim"> · {formatMoney(m.cost)}</span> : null}
                        {m.done_by ? <span className="text-dim"> · {m.done_by}</span> : null}
                      </div>
                      {m.description ? <p className="mt-1 text-dim">{m.description}</p> : null}
                    </div>
                    <form action={deleteMaintenance}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="device" value={id} />
                      <button className="text-xs text-faint hover:text-bad">Remove</button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-dim">Nothing logged yet.</p>
            )}
            <ActionForm action={saveMaintenance} submit="Log it">
              <input type="hidden" name="device" value={id} />
              <div className="grid gap-3 sm:grid-cols-4">
                <Field label="Date">
                  <Input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
                </Field>
                <Field label="Kind">
                  <Select name="kind" options={MAINTENANCE_KINDS.map((k) => ({ value: k, label: k[0]!.toUpperCase() + k.slice(1) }))} />
                </Field>
                <Field label="Cost">
                  <Input name="cost" type="number" step="0.01" min={0} />
                </Field>
                <Field label="Done by">
                  <Input name="done_by" />
                </Field>
                <Field label="What was done" className="sm:col-span-4">
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
