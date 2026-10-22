import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PrintButton } from "@/components/print-button";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getConsoles } from "@/lib/console-data";

export const metadata: Metadata = { title: "Scribble strip" };

const PRINTABLE_MM = 277;

/** A scribble strip to tape under the faders: channel number, name, source, routing. */
export default async function ScribbleStripPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ pitch?: string; height?: string }> }) {
  const id = Number((await params).id);
  const sp = await searchParams;
  const { views } = await getConsoles();
  const view = views.find((v) => v.id === id);
  if (!view) notFound();
  const pitch = Math.min(60, Math.max(15, Number(sp.pitch) || 30));
  const height = Math.min(40, Math.max(8, Number(sp.height) || 14));
  const perPiece = Math.max(1, Math.floor(PRINTABLE_MM / pitch));
  const pieces = [];
  for (let i = 0; i < view.strips.length; i += perPiece) pieces.push(view.strips.slice(i, i + perPiece));
  return (
    <>
      <style>{"@page { size: A4 landscape; margin: 10mm; }"}</style>
      <div className="no-print">
        <PageHeader
          title={`Scribble strip · ${view.name}`}
          subtitle={`${pieces.length} piece(s). Print at 100 %, cut, tape under the faders. Measure your channel spacing (GS3: about 30 mm).`}
          actions={
            <>
              <ButtonLink href={`/consoles/${id}`}>Back</ButtonLink>
              <PrintButton />
            </>
          }
        />
        <form method="get" className="mb-6 flex flex-wrap items-end gap-3 text-sm">
          <label>
            <span className="mb-1 block text-xs text-dim">Channel spacing (mm)</span>
            <input name="pitch" type="number" step="0.5" min={15} max={60} defaultValue={pitch} className="control w-28" />
          </label>
          <label>
            <span className="mb-1 block text-xs text-dim">Strip height (mm)</span>
            <input name="height" type="number" step="0.5" min={8} max={40} defaultValue={height} className="control w-28" />
          </label>
          <button className="rounded-md border border-line-strong px-3 py-2 hover:bg-raised">Update</button>
        </form>
      </div>
      {pieces.map((piece, k) => (
        <div key={k} className="mb-[4mm] break-inside-avoid">
          <div className="mb-[1mm] font-mono text-[7pt] text-dim print:text-black">
            {view.code} · channels {piece[0]!.number}–{piece[piece.length - 1]!.number}
          </div>
          <div className="flex border-l border-black bg-white text-black" style={{ width: `${piece.length * pitch}mm` }}>
            {piece.map((s) => {
              const src = s.source ? s.source.toUpperCase() : "";
              const route = [s.direct ? "DIR" : "", s.route.toUpperCase(), s.aux.length ? `AUX ${s.aux.join(",")}` : ""].filter(Boolean).join(" ");
              return (
                <div
                  key={s.number}
                  className="flex flex-col items-center justify-between overflow-hidden border-y border-r border-black px-[0.5mm] py-[0.5mm] text-center leading-[1.05]"
                  style={{ width: `${pitch}mm`, height: `${height}mm`, background: s.color ? `color-mix(in srgb, ${s.color} 35%, white)` : undefined }}
                >
                  <span className="font-mono text-[6pt] text-neutral-500">{s.number}{src ? ` · ${src}` : ""}</span>
                  <span className="line-clamp-2 break-words text-[8pt] font-bold">{s.label}</span>
                  <span className="line-clamp-1 text-[5.5pt] text-neutral-700">{route}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
