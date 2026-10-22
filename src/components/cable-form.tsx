import { saveCable } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { ButtonLink, Card, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import type { CableEntry, DeviceEntry } from "@/lib/data";
import { refId } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import type { T } from "@/lib/i18n/translate";
import { portKey, type PlanCable } from "@/lib/patch";
import {
  CABLE_STATES,
  CONNECTORS,
  SIGNALS,
  cableStateLabel,
  categoryLabel,
  connectorLabel,
  directionLabel,
  signalLabel,
  translatedOptions,
} from "@/lib/vocab";

/**
 * One <select> per end: every port of every device, grouped by device, with
 * the cables already in it. Typing in an open select jumps to a device, so it
 * stays quick with a few hundred ports and needs no JavaScript.
 */
function PortSelect({
  t,
  name,
  devices,
  usage,
  value,
  cableId,
  prefer,
}: {
  t: T;
  name: string;
  devices: DeviceEntry[];
  usage: Map<string, PlanCable[]>;
  value?: string;
  cableId?: number;
  prefer: "out" | "in";
}) {
  return (
    <select name={name} defaultValue={value ?? ""} className="control font-normal">
      <option value="">{t("cables.form.notPlugged")}</option>
      {devices
        .filter((d) => (d.ports ?? []).length && d.state !== "sold")
        .map((d) => {
          // Outputs first on the source side, inputs first on the destination side.
          const ports = [...(d.ports ?? [])].sort((a, b) => {
            const rank = (dir: string) => (dir === prefer ? 0 : dir === "io" ? 1 : 2);
            return rank(a.direction) - rank(b.direction);
          });
          return (
            <optgroup key={d.id} label={`${d.code} · ${d.name} (${categoryLabel(t, d.category)})`}>
              {ports.map((p) => {
                const busy = (usage.get(portKey(d.id, p.name)) ?? []).filter((c) => c.id !== cableId);
                return (
                  <option key={p.name} value={`${d.id}::${p.name}`}>
                    {p.name} — {signalLabel(t, p.signal)}, {directionLabel(t, p.direction).toLowerCase()}
                    {p.connector ? `, ${connectorLabel(t, p.connector)}` : ""}
                    {busy.length ? `  ● ${busy.map((c) => c.code).join(", ")}` : ""}
                  </option>
                );
              })}
            </optgroup>
          );
        })}
    </select>
  );
}

export async function CableForm({
  cable,
  devices,
  usage,
  suggestedCode,
  from,
  to,
  returnTo,
}: {
  cable?: CableEntry;
  devices: DeviceEntry[];
  usage: Map<string, PlanCable[]>;
  suggestedCode?: string;
  from?: string;
  to?: string;
  returnTo?: string;
}) {
  const { t } = await getI18n();
  const fromValue = cable ? (refId(cable.from_device) && cable.from_port ? `${refId(cable.from_device)}::${cable.from_port}` : "") : from;
  const toValue = cable ? (refId(cable.to_device) && cable.to_port ? `${refId(cable.to_device)}::${cable.to_port}` : "") : to;

  // A new cable from a port takes that port's signal and connector.
  let signal = cable?.signal;
  let connectorA = cable?.connector_a ?? undefined;
  if (!cable && (from || to)) {
    const [deviceId, ...rest] = (from ?? to)!.split("::");
    const port = devices.find((d) => d.id === Number(deviceId))?.ports?.find((p) => p.name === rest.join("::"));
    signal = port?.signal;
    if (from) connectorA = port?.connector ?? undefined;
  }

  return (
    <ActionForm
      action={saveCable}
      submit={cable ? t("cables.form.save") : t("cables.add")}
      footer={<ButtonLink href={returnTo ?? "/cables"}>{t("action.cancel")}</ButtonLink>}
    >
      {cable ? <input type="hidden" name="id" value={cable.id} /> : null}
      {returnTo ? <input type="hidden" name="return_to" value={returnTo} /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={t("cables.form.cable")}>
          <div className="space-y-4">
            <Field label={t("cables.form.code")} hint={t("cables.form.code.hint")}>
              <Input name="code" required defaultValue={cable?.code ?? suggestedCode} className="font-mono uppercase" />
            </Field>
            <Field label={t("cables.form.signal")}>
              <Select name="signal" options={translatedOptions(t, SIGNALS, signalLabel)} defaultValue={signal ?? "audio"} />
            </Field>
            <Field label={t("cables.form.state")}>
              <Select name="state" options={translatedOptions(t, CABLE_STATES, cableStateLabel)} defaultValue={cable?.state ?? "connected"} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("cables.form.length")}>
                <Input name="length_m" type="number" step="0.1" min={0} defaultValue={cable?.length_m ?? ""} />
              </Field>
              <Field label={t("cables.form.color")}>
                <Input name="color" defaultValue={cable?.color ?? ""} placeholder={t("cables.form.color.placeholder")} />
              </Field>
            </div>
          </div>
        </Card>

        <Card title={t("cables.form.where")} className="lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <Field label={t("cables.form.from")} hint={t("cables.form.from.hint")}>
                <PortSelect t={t} name="from" devices={devices} usage={usage} value={fromValue} cableId={cable?.id} prefer="out" />
              </Field>
              <Field label={t("cables.form.plug")}>
                <Select name="connector_a" options={translatedOptions(t, CONNECTORS, connectorLabel)} empty={t("state.none")} defaultValue={connectorA ?? ""} />
              </Field>
            </div>
            <div className="space-y-4">
              <Field label={t("cables.form.to")} hint={t("cables.form.to.hint")}>
                <PortSelect t={t} name="to" devices={devices} usage={usage} value={toValue} cableId={cable?.id} prefer="in" />
              </Field>
              <Field label={t("cables.form.plug")}>
                <Select name="connector_b" options={translatedOptions(t, CONNECTORS, connectorLabel)} empty={t("state.none")} defaultValue={cable?.connector_b ?? ""} />
              </Field>
            </div>
          </div>
          <div className="mt-4">
            <Checkbox name="allow_shared" label={t("cables.form.shared")} />
          </div>
          <Field label={t("cables.form.notes")} className="mt-4">
            <Textarea name="notes" defaultValue={cable?.notes ?? ""} />
          </Field>
        </Card>
      </div>
    </ActionForm>
  );
}

/** The next free C-### code. */
export function nextCableCode(cables: CableEntry[]): string {
  let max = 0;
  for (const c of cables) {
    const m = /^C-(\d+)$/i.exec(c.code);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `C-${String(max + 1).padStart(3, "0")}`;
}
