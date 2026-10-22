import type { Metadata } from "next";

import { Help } from "@/components/help";
import { PrintButton } from "@/components/print-button";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getCables, getDevices, refId } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { SIGNALS, isKey, signalColor } from "@/lib/vocab";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("action.cableLabels") };
}

/**
 * Two wrap-around labels per cable, one for each end. Each says which end it
 * is and where both ends go, so a cable found loose behind a rack can be put
 * back without the app.
 */
export default async function LabelsPage({ searchParams }: { searchParams: Promise<{ device?: string; signal?: string; codes?: string }> }) {
  const { t, p } = await getI18n();
  const sp = await searchParams;
  const [devices, cables] = await Promise.all([getDevices(), getCables()]);
  const byId = new Map(devices.map((x) => [x.id, x]));
  const device = Number(sp.device) || undefined;
  const codes = sp.codes ? new Set(sp.codes.split(",").map((c) => c.trim().toUpperCase())) : undefined;
  const list = cables.filter(
    (c) =>
      c.state !== "broken" &&
      (!device || refId(c.from_device) === device || refId(c.to_device) === device) &&
      (!isKey(SIGNALS, sp.signal) || c.signal === sp.signal) &&
      (!codes || codes.has(c.code.toUpperCase())),
  );
  const where = (id: number | undefined, port: string | null | undefined) => {
    const dev = id ? byId.get(id) : undefined;
    return dev ? `${dev.code} ${port ?? ""}`.trim() : t("state.none");
  };

  return (
    <>
      <div className="no-print">
        <PageHeader
          title={t("action.cableLabels")}
          subtitle={`${p("cables.labels.count", list.length)} · ${p("cables.labels.sheets", list.length * 2)}. ${t("cables.labels.filterHint")}`}
          actions={
            <>
              <ButtonLink href="/cables">{t("action.back")}</ButtonLink>
              <PrintButton />
            </>
          }
        />
        <Help topic="cable-labels" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(62mm,1fr))] gap-[3mm] print:text-black">
        {list.flatMap((c) => {
          const a = where(refId(c.from_device), c.from_port);
          const b = where(refId(c.to_device), c.to_port);
          return (["A", "B"] as const).map((side) => (
            <div
              key={`${c.id}${side}`}
              className="flex h-[22mm] break-inside-avoid items-stretch overflow-hidden rounded border border-line-strong bg-white text-black print:border-black"
            >
              <div className="flex w-[7mm] items-center justify-center text-[10px] font-bold text-white" style={{ background: signalColor(c.signal) }}>
                {side}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center px-2 font-mono leading-tight">
                <div className="text-[15px] font-bold tracking-wide">{c.code}</div>
                <div className="truncate text-[10px]">
                  <b>{side === "A" ? t("cables.labels.here") : t("cables.labels.from")}</b> {a}
                </div>
                <div className="truncate text-[10px]">
                  <b>{side === "B" ? t("cables.labels.here") : t("cables.labels.to")}</b> {b}
                </div>
              </div>
            </div>
          ));
        })}
      </div>
    </>
  );
}
