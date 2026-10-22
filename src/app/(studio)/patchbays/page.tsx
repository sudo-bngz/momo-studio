import type { Metadata } from "next";
import Link from "next/link";

import { PatchbayBoard } from "@/components/patchbay-board";
import { LoopWarnings, ModeLegend } from "@/components/patchbay-bits";
import { ButtonLink, Empty, PageHeader } from "@/components/ui";
import { getPatchbays } from "@/lib/patchbay-data";

export const metadata: Metadata = { title: "Patchbays" };

export default async function PatchbaysPage() {
  const { views, loops } = await getPatchbays();
  return (
    <>
      <PageHeader
        title="Patchbays"
        subtitle="What's behind every point, how it's normalled, and where it goes in the DAW."
        actions={<ButtonLink href="/gear/new?category=patchbay">Add a patchbay</ButtonLink>}
      />
      <ModeLegend />
      {loops.length ? <LoopWarnings loops={loops} /> : null}
      {views.length ? (
        <div className="space-y-8">
          {views.map((v) => (
            <section key={v.id}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  <Link href={`/patchbays/${v.id}`} className="hover:text-amber">
                    {v.name}
                  </Link>{" "}
                  <span className="font-mono text-xs text-amber">{v.code}</span>
                </h2>
                <span className="flex gap-3 text-sm">
                  <span className="text-dim">
                    {v.rows.filter((r) => r.top.ends.length || r.bottom.ends.length || r.top.text || r.bottom.text).length}/{v.columns} columns used
                  </span>
                  <Link href={`/patchbays/${v.id}`} className="text-amber hover:underline">
                    Edit →
                  </Link>
                </span>
              </div>
              {v.columns ? <PatchbayBoard view={v} /> : <Empty>No columns yet: open it to set its size.</Empty>}
            </section>
          ))}
        </div>
      ) : (
        <Empty>No patchbay yet. Add one as gear with the category “Patchbay”, then lay out its columns here.</Empty>
      )}
    </>
  );
}
