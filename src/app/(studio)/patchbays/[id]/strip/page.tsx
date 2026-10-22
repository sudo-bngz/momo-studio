import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Help } from "@/components/help";
import { PrintButton } from "@/components/print-button";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getPatchbays } from "@/lib/patchbay-data";
import { rearLabel, type ColumnView } from "@/lib/patchbay";

export const metadata: Metadata = { title: "Patchbay strips" };

const PRINTABLE_MM = 277; // A4 landscape minus margins

/**
 * Designation strips to slide above and below the jacks, at the real jack
 * spacing (measure yours: centre to centre of two neighbouring jacks), cut in
 * as many pieces as an A4 sheet needs.
 */
export default async function StripPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ pitch?: string; height?: string }> }) {
  const id = Number((await params).id);
  const sp = await searchParams;
  const { views } = await getPatchbays();
  const view = views.find((v) => v.id === id);
  if (!view) notFound();
  const pitch = clamp(Number(sp.pitch) || 18, 8, 40);
  const height = clamp(Number(sp.height) || 10, 5, 30);
  const perPiece = Math.max(1, Math.floor(PRINTABLE_MM / pitch));
  const pieces: ColumnView[][] = [];
  for (let i = 0; i < view.rows.length; i += perPiece) pieces.push(view.rows.slice(i, i + perPiece));

  const strip = (row: "top" | "bottom") =>
    pieces.map((piece, k) => (
      <div key={`${row}${k}`} className="mb-[4mm] break-inside-avoid">
        <div className="mb-[1mm] font-mono text-[7pt] text-dim print:text-black">
          {view.code} · {row === "top" ? "top row" : "bottom row"} · {piece[0]![row].number}–{piece[piece.length - 1]![row].number}
        </div>
        <div className="flex border-l border-black bg-white text-black" style={{ width: `${piece.length * pitch}mm` }}>
          {piece.map((c) => {
            const l = rearLabel(c[row]);
            return (
              <div
                key={c.column}
                className="flex flex-col items-center justify-center overflow-hidden border-y border-r border-black px-[0.5mm] text-center leading-[1.05]"
                style={{ width: `${pitch}mm`, height: `${height}mm`, background: c.color ? `color-mix(in srgb, ${c.color} 35%, white)` : undefined }}
              >
                <span className="font-mono text-[5.5pt] text-neutral-500">{c[row].number}</span>
                <span className={`line-clamp-2 break-words text-[6.5pt] font-semibold ${l.free ? "text-neutral-400" : ""}`}>{l.free ? "" : l.main}</span>
                {l.sub ? <span className="line-clamp-1 text-[5.5pt]">{l.sub}</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    ));

  return (
    <>
      <style>{"@page { size: A4 landscape; margin: 10mm; }"}</style>
      <div className="no-print">
        <PageHeader
          title={`Strips · ${view.name}`}
          subtitle={`${pieces.length} piece(s) per row. Print at 100 % scale, cut, slide above and below the jacks.`}
          actions={
            <>
              <ButtonLink href={`/patchbays/${id}`}>Back</ButtonLink>
              <PrintButton />
            </>
          }
        />
        <Help topic="patchbay-strip" />
        <form method="get" className="mb-6 flex flex-wrap items-end gap-3 text-sm">
          <label>
            <span className="mb-1 block text-xs text-dim">Jack spacing (mm)</span>
            <input name="pitch" type="number" step="0.1" min={8} max={40} defaultValue={pitch} className="control w-28" />
          </label>
          <label>
            <span className="mb-1 block text-xs text-dim">Strip height (mm)</span>
            <input name="height" type="number" step="0.5" min={5} max={30} defaultValue={height} className="control w-28" />
          </label>
          <button className="rounded-md border border-line-strong px-3 py-2 hover:bg-raised">Update</button>
        </form>
      </div>
      <h2 className="mb-2 text-sm font-semibold print:hidden">Top row</h2>
      {strip("top")}
      <h2 className="mt-6 mb-2 text-sm font-semibold print:hidden">Bottom row</h2>
      {strip("bottom")}
    </>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
