import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { RichText } from "@/components/rich-text";
import { ChannelStripFlow, InlineGroups, Normalling } from "@/components/signal-flow";
import { PageHeader } from "@/components/ui";
import { getHelp, PART_TOPICS, type HelpContent, type TopicId } from "@/lib/help";
import { getI18n } from "@/lib/i18n";
import type { T } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("guide.title") };
}

export default async function GuidePage() {
  const { t, locale } = await getI18n();
  const help = getHelp(locale);

  /** The drawing that belongs to a chapter, and the caption under it. */
  const figures: Partial<Record<TopicId, ReactNode>> = {
    patchbays: (
      <Figure bare caption={t("guide.fig.normalling")}>
        <Normalling t={t} />
      </Figure>
    ),
    console: (
      <>
        <Figure caption={t("guide.fig.channelFlow")}>
          <ChannelStripFlow t={t} />
        </Figure>
        <Figure caption={t("guide.fig.inlineGroups")}>
          <InlineGroups t={t} />
        </Figure>
      </>
    ),
  };

  const intro = t("guide.intro", { link: "\u0000" }).split("\u0000");

  return (
    <>
      <PageHeader title={t("guide.title")} subtitle={t("guide.subtitle")} />

      <div className="max-w-3xl">
        <p className="text-[15px] leading-relaxed text-dim">
          {intro[0]}
          <Link href="#console" className="text-amber hover:underline">
            {t("guide.intro.link")}
          </Link>
          {intro[1]}
        </p>

        {/* Contents */}
        <nav className="mt-8 rounded-lg border border-line bg-panel p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">{t("guide.contents")}</h2>
          <ol className="mt-3 space-y-3">
            {PART_TOPICS.map((part, i) => (
              <li key={part.id}>
                <span className="text-sm font-medium">
                  <span className="mr-2 font-mono text-xs text-faint">{i + 1}</span>
                  {help.parts[part.id].title}
                </span>
                <span className="ml-6 block text-xs text-faint">{help.parts[part.id].blurb}</span>
                <span className="ml-6 mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {part.topics.map((id) => (
                    <Link key={id} href={`#${id}`} className="text-dim hover:text-amber">
                      {help.topics[id].title}
                    </Link>
                  ))}
                </span>
              </li>
            ))}
            <li>
              <Link href="#glossary" className="text-sm font-medium hover:text-amber">
                <span className="mr-2 font-mono text-xs text-faint">{PART_TOPICS.length + 1}</span>
                {t("guide.glossary")}
              </Link>
            </li>
          </ol>
        </nav>

        {/* Chapters */}
        {PART_TOPICS.map((part, i) => (
          <section key={part.id} className="mt-12">
            <h2 className="flex items-baseline gap-3 border-b border-line pb-2 text-lg font-semibold">
              <span className="font-mono text-sm text-faint">{i + 1}</span>
              {help.parts[part.id].title}
            </h2>
            {part.topics.map((id) => (
              <Chapter key={id} id={id} help={help} t={t} figure={figures[id]} />
            ))}
          </section>
        ))}

        {/* Glossary */}
        <section id="glossary" className="mt-12 scroll-mt-6">
          <h2 className="flex items-baseline gap-3 border-b border-line pb-2 text-lg font-semibold">
            <span className="font-mono text-sm text-faint">{PART_TOPICS.length + 1}</span>
            {t("guide.glossary")}
          </h2>
          <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {Object.values(help.glossary).map((g) => (
              <div key={g.term} className="text-sm">
                <dt className="font-medium text-ink">{g.term}</dt>
                <dd className="mt-0.5 leading-relaxed text-dim">{g.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-12 border-t border-line pt-4 text-xs text-faint">
          {t("guide.source", { file: "" })}
          <code className="font-mono text-dim">src/lib/help</code>
        </p>
      </div>
    </>
  );
}

function Chapter({ id, help, t, figure }: { id: TopicId; help: HelpContent; t: T; figure?: ReactNode }) {
  const topic = help.topics[id];
  return (
    <article id={id} className="mt-8 scroll-mt-6">
      <h3 className="text-base font-semibold text-ink">{topic.title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-dim">
        <RichText>{topic.lede}</RichText>
      </p>

      {figure ?? null}

      {topic.long?.map((para) => (
        <p key={para.slice(0, 40)} className="mt-3 text-[15px] leading-relaxed text-dim">
          <RichText>{para}</RichText>
        </p>
      ))}

      {topic.points?.length ? (
        <dl className="mt-4 space-y-2 border-l border-line pl-4">
          {topic.points.map((pt) => (
            <div key={pt.term} className="text-sm">
              <dt className="font-medium text-ink">{pt.term}</dt>
              <dd className="mt-0.5 leading-relaxed text-dim">
                <RichText>{pt.text}</RichText>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {topic.steps?.length ? (
        <>
          <h4 className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-faint">{t("help.doingIt")}</h4>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-dim">
            {topic.steps.map((s) => (
              <li key={s} className="leading-relaxed">
                <RichText>{s}</RichText>
              </li>
            ))}
          </ol>
        </>
      ) : null}

      {topic.see?.length ? (
        <p className="mt-3 flex flex-wrap gap-x-3 text-xs">
          <span className="text-faint">{t("help.seeAlso")}</span>
          {topic.see.map((s) => (
            <Link key={s} href={`#${s}`} className="text-amber hover:underline">
              {help.topics[s].title}
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
