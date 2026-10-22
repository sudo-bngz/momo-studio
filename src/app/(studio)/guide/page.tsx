import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { RichText } from "@/components/rich-text";
import { ChannelStripFlow, InlineGroups, Normalling } from "@/components/signal-flow";
import { PageHeader } from "@/components/ui";
import { GLOSSARY, GUIDE_PARTS, TOPICS, type TopicId } from "@/lib/help";

export const metadata: Metadata = { title: "Guide" };

/** The drawing that belongs to a chapter, and a caption for it. */
const FIGURES: Partial<Record<TopicId, ReactNode>> = {
  patchbays: (
    <Figure
      bare
      caption="The three modes of a column. The app follows a signal through the first two as if the points were one wire, and stops at the third — because that is what the hardware does."
    >
      <Normalling />
    </Figure>
  ),
  console: (
    <>
      <Figure caption="One channel of the GS3. The channel path carries mic or line through the insert, the EQ and the fader, and leaves by one of four routes. The monitor path carries the tape return on its own level — which is why every channel has a Tape In.">
        <ChannelStripFlow />
      </Figure>
      <Figure caption="Why the desk has eight groups and no group output sockets: the group buses are paralleled onto the channels' track outs. Group 1 comes out of channel 1, 9 or 17; group 2 out of 2, 10 or 18.">
        <InlineGroups />
      </Figure>
    </>
  ),
};

export default function GuidePage() {
  return (
    <>
      <PageHeader title="Guide" subtitle="How the app is put together, and how the studio it describes is put together." />

      <div className="max-w-3xl">
        <p className="text-[15px] leading-relaxed text-dim">
          Every page carries its own short help at the top — the sentence is always on screen, and opening it explains what the
          things on that page mean. This is the same text at length, in one place, plus the parts that need a drawing. The{" "}
          <Link href="#console" className="text-amber hover:underline">
            console chapter
          </Link>{" "}
          is the one worth reading properly: an in-line desk like the Allen &amp; Heath GS3 behaves in a way that looks like a bug
          until you know it isn&apos;t.
        </p>

        {/* Contents */}
        <nav className="mt-8 rounded-lg border border-line bg-panel p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">Contents</h2>
          <ol className="mt-3 space-y-3">
            {GUIDE_PARTS.map((part, i) => (
              <li key={part.title}>
                <span className="text-sm font-medium">
                  <span className="mr-2 font-mono text-xs text-faint">{i + 1}</span>
                  {part.title}
                </span>
                <span className="ml-6 block text-xs text-faint">{part.blurb}</span>
                <span className="ml-6 mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {part.topics.map((t) => (
                    <Link key={t} href={`#${t}`} className="text-dim hover:text-amber">
                      {TOPICS[t].title}
                    </Link>
                  ))}
                </span>
              </li>
            ))}
            <li>
              <Link href="#glossary" className="text-sm font-medium hover:text-amber">
                <span className="mr-2 font-mono text-xs text-faint">{GUIDE_PARTS.length + 1}</span>
                Glossary
              </Link>
            </li>
          </ol>
        </nav>

        {/* Chapters */}
        {GUIDE_PARTS.map((part, i) => (
          <section key={part.title} className="mt-12">
            <h2 className="flex items-baseline gap-3 border-b border-line pb-2 text-lg font-semibold">
              <span className="font-mono text-sm text-faint">{i + 1}</span>
              {part.title}
            </h2>
            {part.topics.map((t) => (
              <Chapter key={t} id={t} />
            ))}
          </section>
        ))}

        {/* Glossary */}
        <section id="glossary" className="mt-12 scroll-mt-6">
          <h2 className="flex items-baseline gap-3 border-b border-line pb-2 text-lg font-semibold">
            <span className="font-mono text-sm text-faint">{GUIDE_PARTS.length + 1}</span>
            Glossary
          </h2>
          <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {Object.values(GLOSSARY).map((g) => (
              <div key={g.term} className="text-sm">
                <dt className="font-medium text-ink">{g.term}</dt>
                <dd className="mt-0.5 leading-relaxed text-dim">{g.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-12 border-t border-line pt-4 text-xs text-faint">
          Something here wrong or missing? The text lives in one file, <code className="font-mono text-dim">src/lib/help.ts</code>, and
          feeds both this page and the panels on the pages themselves.
        </p>
      </div>
    </>
  );
}

function Chapter({ id }: { id: TopicId }) {
  const t = TOPICS[id];
  return (
    <article id={id} className="mt-8 scroll-mt-6">
      <h3 className="text-base font-semibold text-ink">{t.title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-dim">
        <RichText>{t.lede}</RichText>
      </p>

      {FIGURES[id] ?? null}

      {t.long?.map((p) => (
        <p key={p.slice(0, 40)} className="mt-3 text-[15px] leading-relaxed text-dim">
          <RichText>{p}</RichText>
        </p>
      ))}

      {t.points?.length ? (
        <dl className="mt-4 space-y-2 border-l border-line pl-4">
          {t.points.map((p) => (
            <div key={p.term} className="text-sm">
              <dt className="font-medium text-ink">{p.term}</dt>
              <dd className="mt-0.5 leading-relaxed text-dim">
                <RichText>{p.text}</RichText>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {t.steps?.length ? (
        <>
          <h4 className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-faint">Doing it</h4>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-dim">
            {t.steps.map((s) => (
              <li key={s} className="leading-relaxed">
                <RichText>{s}</RichText>
              </li>
            ))}
          </ol>
        </>
      ) : null}

      {t.see?.length ? (
        <p className="mt-3 flex flex-wrap gap-x-3 text-xs">
          <span className="text-faint">See also</span>
          {t.see.map((s) => (
            <Link key={s} href={`#${s}`} className="text-amber hover:underline">
              {TOPICS[s].title}
            </Link>
          ))}
        </p>
      ) : null}
    </article>
  );
}

/** `bare` for a drawing that brings its own panels. */
function Figure({ children, caption, bare = false }: { children: ReactNode; caption: string; bare?: boolean }) {
  return (
    <figure className="my-5">
      {bare ? children : <div className="rounded-lg border border-line bg-panel p-4">{children}</div>}
      <figcaption className="mt-2 text-xs leading-relaxed text-faint">{caption}</figcaption>
    </figure>
  );
}
