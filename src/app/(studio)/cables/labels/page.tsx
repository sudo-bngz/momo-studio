import type { Metadata } from "next";

import { PrintButton } from "@/components/print-button";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getCables, getDevices, refId } from "@/lib/data";
import { SIGNALS, isKey } from "@/lib/vocab";

export const metadata: Metadata = { title: "Cable labels" };

/**
 * Two wrap-around labels per cable, one for each end. Each says which end it
 * is and where both ends go, so a cable found loose behind a rack can be put
 * back without the app.
 */
export default async function LabelsPage({ searchParams }: { searchParams: Promise<{ device?: string; signal?: string; codes?: string }> }) {
  const sp = await searchParams;
  const [devices, cables] = await Promise.all([getDevices(), getCables()]);
  const byId = new Map(devices.map((d) => [d.id, d]));
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
    const d = id ? byId.get(id) : undefined;
    return d ? `${d.code} ${port ?? ""}`.trim() : "—";
  };

  return (
    <>
      <div className="no-print">
        <PageHeader
          title="Cable labels"
          subtitle={`${list.length} cables · ${list.length * 2} labels. Filter with ?device=, ?signal= or ?codes=C-001,C-002.`}
          actions={
            <>
              <ButtonLink href="/cables">Back</ButtonLink>
              <PrintButton />
            </>
          }
        />
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
              <div className="flex w-[7mm] items-center justify-center text-[10px] font-bold text-white" style={{ background: SIGNALS[c.signal].color }}>
                {side}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center px-2 font-mono leading-tight">
                <div className="text-[15px] font-bold tracking-wide">{c.code}</div>
                <div className="truncate text-[10px]">
                  <b>{side === "A" ? "HERE" : "FROM"}</b> {a}
                </div>
                <div className="truncate text-[10px]">
                  <b>{side === "B" ? "HERE" : "TO"}</b> {b}
                </div>
              </div>
            </div>
          ));
        })}
      </div>
    </>
  );
}
