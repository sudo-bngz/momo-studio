import type { Metadata } from "next";
import Link from "next/link";

import { ConsoleBoard } from "@/components/console-board";
import { LoopWarnings } from "@/components/patchbay-bits";
import { ButtonLink, Empty, PageHeader } from "@/components/ui";
import { getConsoles } from "@/lib/console-data";

export const metadata: Metadata = { title: "Consoles" };

export default async function ConsolesPage() {
  const { views, issues } = await getConsoles();
  const loops = [...new Set([...issues.values()].flat().filter((i) => i.kind === "loop"))];
  return (
    <>
      <PageHeader
        title="Consoles"
        subtitle="Every channel of the desk: what's plugged in, what it's called, where it goes."
        actions={<ButtonLink href="/gear/new?category=mixer">Add a console</ButtonLink>}
      />
      {loops.length ? <LoopWarnings loops={loops} /> : null}
      {views.length ? (
        <div className="space-y-8">
          {views.map((v) => (
            <section key={v.id}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  <Link href={`/consoles/${v.id}`} className="hover:text-amber">
                    {v.name}
                  </Link>{" "}
                  <span className="font-mono text-xs text-amber">{v.code}</span>
                </h2>
                <span className="flex gap-3 text-sm">
                  <span className="text-dim">
                    {v.channels} channels · {v.groups} groups · {v.auxes} auxes · {v.strips.filter((s) => s.sockets.some((k) => k.ends.length)).length} in use
                  </span>
                  <Link href={`/consoles/${v.id}`} className="text-amber hover:underline">
                    Edit →
                  </Link>
                </span>
              </div>
              <ConsoleBoard view={v} />
            </section>
          ))}
        </div>
      ) : (
        <Empty>
          No console yet. Add one as gear with the category “Mixer” and fill its ports from a template (the Allen &amp; Heath GS3 is there), or name its ports “Ch 1 Line”, “Ch 1 Insert”…
        </Empty>
      )}
    </>
  );
}
