import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Help } from "@/components/help";
import { PrintButton } from "@/components/print-button";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getConsoles } from "@/lib/console-data";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("console.meta.strip") };
}

const PRINTABLE_MM = 277;

/** The source printed on a 30 mm strip: the short words only. */
const SOURCE_KEY = { mic: "console.role.mic", line: "console.role.line", tape: "console.role.tapeShort" } as const;

/** A scribble strip to tape under the faders: channel number, name, source, routing. */
export default async function ScribbleStripPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ pitch?: string; height?: string }> }) {
  const { t, p } = await getI18n();
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
          title={t("console.strip.title", { name: view.name })}
          subtitle={p("console.strip.subtitle", pieces.length)}
          actions={
            <>
              <ButtonLink href={`/consoles/${id}`}>{t("action.back")}</ButtonLink>
              <PrintButton />
            </>
          }
        />
        <Help topic="console-strip" />
        <form method="get" className="mb-6 flex flex-wrap items-end gap-3 text-sm">
          <label>
            <span className="mb-1 block text-xs text-dim">{t("console.strip.pitch")}</span>
            <input name="pitch" type="number" step="0.5" min={15} max={60} defaultValue={pitch} className="control w-28" />
          </label>
          <label>
            <span className="mb-1 block text-xs text-dim">{t("console.strip.height")}</span>
            <input name="height" type="number" step="0.5" min={8} max={40} defaultValue={height} className="control w-28" />
          </label>
          <button className="rounded-md border border-line-strong px-3 py-2 hover:bg-raised">{t("console.strip.update")}</button>
        </form>
      </div>
      {pieces.map((piece, k) => (
        <div key={k} className="mb-[4mm] break-inside-avoid">
          <div className="mb-[1mm] font-mono text-[7pt] text-dim print:text-black">
            {t("console.strip.range", { code: view.code, from: piece[0]!.number, to: piece[piece.length - 1]!.number })}
          </div>
          <div className="flex border-l border-black bg-white text-black" style={{ width: `${piece.length * pitch}mm` }}>
            {piece.map((s) => {
              const src = s.source ? t(SOURCE_KEY[s.source]).toUpperCase() : "";
              const route = [
                s.direct ? t("console.strip.direct") : "",
                s.route.toUpperCase(),
                s.aux.length ? t("console.strip.aux", { list: s.aux.join(",") }) : "",
              ]
                .filter(Boolean)
                .join(" ");
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
